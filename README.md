# Nmap

This plugin integrates Nmap network scanning functionality into Obsidian. It allows users to import Nmap XML scan reports and visualize the results in a structured Markdown format, with the option to manage and visualize them in a network canvas.

![output-onlinegiftools](https://github.com/user-attachments/assets/85d7db6d-6cec-420f-87d8-5cdd788cb847)

## Features

### Ribbon Icon

-   Adds a **Nmap** icon in the left ribbon for quick access to the plugin.
-   Click the icon to open the XML parser interface.

### Status Bar

-   Displays the plugin status (`Nmap ready`) in the bottom bar of the application.

### Commands

-   **Import Nmap XML Scan Report**: Use the command palette to invoke the XML parsing modal.

### XML Parsing Modal

-   Import Nmap XML reports and generate Markdown files with:
    -   **Host Details**: Hostnames and IP addresses.
    -   **Open Ports**: Organized in a table including ports, protocols, services, and states.
    -   **Vulnerabilities Discovered**: Placeholder section for reporting potential vulnerabilities.
-   Files can be visualized in a network canvas for easy exploration.

### Canvas Support

-   Automatically creates or updates a canvas named `network.canvas` to include parsed files as nodes.

### Settings

-   Customize the output folder for Markdown files.
-   Simple configuration for future enhancements.

---

## Installation

1. Clone or download the plugin repository.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Build the plugin
    ```bash
    npm build
    ```
4. Copy the plugin folder into Obsidian's `.obsidian/plugins/` directory.
5. Enable the plugin in Obsidian via `Settings > Community Plugins`.

## Usage

1. Launch Obsidian and activate the Nmap Plugin.
2. Use the left ribbon icon or the command palette (Ctrl/Cmd + P) to open the Nmaper modal.
3. Upload an Nmap XML scan report and select an output folder.
4. The plugin generates:
    - Markdown files summarizing the scan results.
    - A canvas with file nodes for network visualization.

## License

This plugin is licensed under the MIT License. Let me know if you'd like modifications or further sections included!
