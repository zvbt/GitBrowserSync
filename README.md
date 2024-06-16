# GitBrowserSync (Beta)

## Overview

This Chrome extension allows users to save their bookmarks and installed extensions to a JSON file on GitHub. It provides a convenient way to backup and synchronize bookmarks and extensions across different browsers. (Only chromium based browser).

## Features

- **Backup Bookmarks:** Save all bookmarks, including folder structures, from your browser's bookmark bar.
- **Save Extensions:** Capture details of all installed extensions with links to their Chrome Web Store pages.
- **GitHub Integration:** Securely store your bookmarks and extensions data in a GitHub repository.
- **Import Functionality:** Restore bookmarks and view installed extensions directly from GitHub.

## How to Use

### Installation

1. Clone or download the repository to your local machine.

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable Developer mode (toggle switch usually found in the top right corner).

4. Click on "Load unpacked" and select the folder where you cloned/downloaded the extension.

### Usage

1. **Saving Data to GitHub:**

   - Click on the extension icon in the Chrome toolbar.
   - Enter your GitHub personal access token and the repository where you want to store the data.
   - Click "Save" to upload your bookmarks and extensions to GitHub.

2. **Importing Data:**

   - Use the extension's popup to import bookmarks and view extensions stored on GitHub.
   - Click "Import" to restore bookmarks and open a webpage with links to the Chrome Web Store for installed extensions.

### GitHub Repository Setup

- Ensure your GitHub repository is set up with appropriate permissions.
- Generate a personal access token with `repo` scope for the extension to interact with the repository.

### Permissions

This extension requires the following permissions:
- `storage`: To store GitHub access token and repository details locally.
- `bookmarks`: To read and save bookmarks from the browser.
- `management`: To fetch details of installed extensions.
- `tabs`: To open a new tab with extension details.

### Issues and Contributions

- **Beta Version:** This extension is currently in beta testing. It may contain bugs and is not recommended for production use.
- If you encounter any issues or have suggestions for improvement, please open an issue on [GitHub Issues](https://github.com/your/repository/issues).
- Contributions are welcome! Fork the repository and submit a pull request with your changes.

## License

This project is licensed under the [MIT License](LICENSE).
