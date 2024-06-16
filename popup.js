// load saved settings
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['githubRepo', 'githubToken'], (items) => {
        if (items.githubRepo) {
            document.getElementById('repo').value = items.githubRepo;
        }
        if (items.githubToken) {
            document.getElementById('token').value = items.githubToken;
        }
    });
});

document.getElementById('saveSettingsButton').addEventListener('click', () => {
    const repo = document.getElementById('repo').value;
    const token = document.getElementById('token').value;

    chrome.runtime.sendMessage({
        action: 'saveSettings',
        repo: repo,
        token: token
    }, (response) => {
        if (response.success) {
            alert('GitHub settings saved successfully!');
        } else {
            console.error('Failed to save GitHub settings:', response.error);
            alert('Failed to save GitHub settings. Check the console for more details.');
        }
    });
});

document.getElementById('saveButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({
        action: 'save'
    }, (response) => {
        if (response.error) {
            console.error('Error:', response.error);
            alert('Failed to save bookmarks and extensions. Check the console for more details.');
        } else {
            console.log('Response from GitHub:', response);
            alert('Bookmarks and extensions saved to GitHub successfully!');
        }
    });
});

document.getElementById('importButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({
        action: 'import'
    }, (response) => {
        if (response.error) {
            console.error('Error:', response.error);
            alert('Failed to import bookmarks and extensions. Check the console for more details.');
        } else {
            console.log('Import successful');
            alert('Extensions imported and opened in a new tab!');
        }
    });
});
