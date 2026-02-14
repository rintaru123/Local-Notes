# Build Instructions

This project can be built in two ways: as a single portable HTML file (for web/browser use) or as a standalone desktop application (Windows/Linux/Mac).

## 1. Portable HTML File (Web Version)
This creates a single `index.html` file that contains the entire application. You can open this file in Chrome, Edge, or Opera without needing a server.

**Steps:**
1. Open a terminal in the project folder.
2. Run the build command:
   ```bash
   npm run build
   ```
3. Once finished, navigate to the `dist` folder.
4. You will see `index.html`. This is your app.

## 2. Desktop Application (Executable)
This creates an installed program (like `.exe` for Windows) that runs independently of your browser.

**Prerequisites:**
- You must have Node.js installed.

**Steps:**
1. Open a terminal in the project folder.
2. Run the build command:
   ```bash
   npm run electron:build
   ```
3. This process downloads necessary tools and packages the application. It may take a few minutes.
4. Once finished, navigate to the `dist` folder (or `release` folder depending on config).
5. You will see an executable file (e.g., `Local Notes Setup 1.0.0.exe` or `Local Notes 1.0.0.exe`).

## Troubleshooting
- If `npm run electron:build` fails, ensure you have run `npm install` first.
- If the HTML file doesn't open properly in Safari or Firefox, try Chrome or Edge (Safari/Firefox have stricter local file restrictions).
