chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

async function fetchBookmarks() {
    return new Promise((resolve) => {
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
            resolve(bookmarkTreeNodes);
        });
    });
}

async function fetchExtensions() {
    return new Promise((resolve) => {
        chrome.management.getAll((extensions) => {
            const extensionsWithLinks = extensions.map(extension => {
                return {
                    id: extension.id,
                    name: extension.name,
                    description: extension.description,
                    version: extension.version,
                    chromeWebStoreUrl: `https://chrome.google.com/webstore/detail/${extension.id}`
                };
            });
            resolve(extensionsWithLinks);
        });
    });
}

function encodeUnicodeToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64ToUnicode(str) {
    return decodeURIComponent(escape(atob(str)));
}

async function saveToGitHub(token, repo, data) {
    const path = 'GitBrowserSync-data.json';
    const content = encodeUnicodeToBase64(JSON.stringify(data));
    let sha = null;

    try {
        const currentContentResponse = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });

        if (currentContentResponse.ok) {
            const currentContent = await currentContentResponse.json();
            sha = currentContent.sha;
        } else if (currentContentResponse.status !== 404) {
            const errorText = await currentContentResponse.text();
            throw new Error(`Failed to fetch current content from GitHub: ${currentContentResponse.status} - ${errorText}`);
        }

        const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Backup created on ${new Date().toLocaleString()}`,
                content: content,
                sha: sha
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving to GitHub:', error);
        throw error;
    }
}


async function fetchFromGitHub(token, repo) {
    const path = 'GitBrowserSync-data.json';
    
    try {
        const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = decodeBase64ToUnicode(data.content);

        return JSON.parse(content);
    } catch (error) {
        console.error('Error fetching from GitHub:', error);
        throw error;
    }
}

async function importBookmarks(bookmarks, parentId = '1') {
    for (let bookmark of bookmarks) {
        if (bookmark.children) {
            const folder = await chrome.bookmarks.create({ parentId, title: bookmark.title });
            await importBookmarks(bookmark.children, folder.id);
        } else {
            await chrome.bookmarks.create({ parentId, title: bookmark.title, url: bookmark.url });
        }
    }
}

async function importExtensions(extensions) {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Imported Extensions</title>
        </head>
        <body>
            <h1>Imported Extensions</h1>
            <ul>
                ${extensions.map(extension => `<li><a href="${extension.chromeWebStoreUrl}" target="_blank">${extension.name}</a></li>`).join('')}
            </ul>
        </body>
        </html>
    `;

    const tabProperties = {
        url: 'data:text/html,' + encodeURIComponent(htmlContent),
        active: true
    };

    chrome.tabs.create(tabProperties, (tab) => {
        if (!tab) {
            console.error('Failed to create tab');
        }
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'save') {
        fetchBookmarks().then(bookmarks => {
            fetchExtensions().then(extensions => {
                const data = { bookmarks, extensions };

                chrome.storage.sync.get(['githubToken', 'githubRepo'], async (items) => {
                    const { githubToken, githubRepo } = items;
                    if (githubToken && githubRepo) {
                        try {
                            const response = await saveToGitHub(githubToken, githubRepo, data);
                            sendResponse(response);
                        } catch (error) {
                            console.error('Error saving to GitHub:', error);
                            sendResponse({ error: error.message });
                        }
                    } else {
                        sendResponse({ error: "GitHub details not set" });
                    }
                });
            });
        });
        return true;
    } else if (request.action === 'saveSettings') {
        chrome.storage.sync.set({
            githubToken: request.token,
            githubRepo: request.repo
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving settings:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError });
            } else {
                sendResponse({ success: true });
            }
        });
        return true;
    } else if (request.action === 'import') {
        chrome.storage.sync.get(['githubToken', 'githubRepo'], async (items) => {
            const { githubToken, githubRepo } = items;
            if (githubToken && githubRepo) {
                try {
                    const data = await fetchFromGitHub(githubToken, githubRepo);
                    await importBookmarks(data.bookmarks);
                    await importExtensions(data.extensions);
                    sendResponse({ success: true });
                } catch (error) {
                    console.error('Error importing from GitHub:', error);
                    sendResponse({ error: error.message });
                }
            } else {
                sendResponse({ error: "GitHub details not set" });
            }
        });
        return true;
    }
});
