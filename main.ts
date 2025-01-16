import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// obsidian-nmap-plugin.js

const xml2js = require('xml2js'); // Use xml2js to parse XML

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}


// Main Plugin
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// ##############################################    Ribbon    ########################################################""
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');


		// ##############################################  Status Bar  ########################################################""
		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Nmaper ready');


		// ##############################################   Commands   ########################################################""
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Import Nmap XML scan report',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});




		// ############################################## Settings Tabs ######################################################""
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


// Modal
class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}


  onOpen() {
    const { contentEl } = this;



	const main = contentEl.createDiv()

	main.createEl('h1', { text: "Nmaper"})
	main.createEl('h2', { text: "Select Nmap XML file"})

    // Create a file input for XML selection
    const fileInput = main.createEl('input', {
      type: 'file',
    });

    fileInput.addEventListener('change', async (event: any) => {
		console.log(event)
      const file = event.target.files[0]
      if (file) {
        const fileContent = await file.text();
        this.parseNmapXML(fileContent);
        this.close();
      }
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

async parseNmapXML(xmlContent: any) {
    try {
      const result = await xml2js.parseStringPromise(xmlContent);
      const hosts = result?.nmaprun?.host || [];

    	const targetFolder = await this.getUserSelectedFolder();
      let canvas; // Declare canvas variable
      for (const host of hosts) {
        const hostname = host?.hostnames?.[0]?.hostname?.[0]?.$.name || 'Unknown';
        const ipAddress = host?.address?.[0]?.$.addr || 'Unknown';

        const pageContent = this.createPageContent(host);

        const fileName = `${ipAddress}.md`;
        const filePath = targetFolder ? `${targetFolder}/${fileName}` : fileName;

        const createdFile = await this.app.vault.create(filePath, pageContent);

        // Add the file to the canvas
        if (!canvas) {
          canvas = await this.createOrGetCanvas(targetFolder);
        }

        await this.addFileToCanvas(canvas, createdFile);
      }

      new Notice('Nmap XML processed successfully!');
    } catch (err) {
      console.error('Error parsing Nmap XML:', err);
      new Notice('Error processing the XML file.');
    }
  }

  async createOrGetCanvas(folder: any) {
    const canvasName = 'network.canvas';
    const canvasPath = folder ? `${folder}/${canvasName}` : canvasName;

    let canvasFile = this.app.vault.getAbstractFileByPath(canvasPath);

    if (!canvasFile) {
      await this.app.vault.create(canvasPath, '{}');
      canvasFile = this.app.vault.getAbstractFileByPath(canvasPath);
    }

    return canvasFile;
  }

  async addFileToCanvas(canvas: any, file: any) {
    const canvasData = JSON.parse(await this.app.vault.read(canvas));

    const fileId = `file-${file.path}`;
    canvasData.nodes = canvasData.nodes || [];
    canvasData.nodes.push({
      id: fileId,
      type: 'file',
      file: file.path,
	  width: 475,
	  height: 500,
      x: Math.random() * 900, // Random X coordinate
      y: Math.random() * 1000, // Random Y coordinate
    });

    await this.app.vault.modify(canvas, JSON.stringify(canvasData, null, 2));
  }

    async getUserSelectedFolder() {
    // Open a modal to allow users to choose a folder or use the cursor location
    const folders = this.app.vault.getAllFolders();

    const currentFolder = this.app.fileManager.getNewFileParent('').path;

    return new Promise((resolve) => {
      const modal = new Modal(this.app);
      const { contentEl } = modal;

      contentEl.setText('Choose a directory to save files or use default:');

      // Create a combobox
      const combobox = contentEl.createEl('select');
      folders.forEach((folder) => {
        const option = combobox.createEl('option', {
          text: folder.path,
          value: folder.path,
        });
      });
	  
      // Buttons for navigation and validation
      const buttonContainer = contentEl.createEl('div', { cls: 'button-container' });

      const previousButton = buttonContainer.createEl('button', { text: 'Previous' });
      previousButton.addEventListener('click', () => {
        resolve(null); // Navigate back
        modal.close();
      });

      const validateButton = buttonContainer.createEl('button', { text: 'Validate' });
      validateButton.addEventListener('click', () => {
        const selectedPath = combobox.value;
        resolve(selectedPath);
        modal.close();
      });

      modal.open();
    });
  }

  
  createPageContent(host: any) {
    const ports = host?.ports?.[0]?.port || [];

    let content = '\n---\n\n'

    if (ports.length > 0) {
      content += '## Open Ports And Services\n\n';
      content += '| Port | Protocol | Service | State |\n';
      content += '|------|----------|---------|-------|\n';

      for (const port of ports) {
        const portId = port?.$.portid || 'Unknown';
        const protocol = port?.$.protocol || 'Unknown';
        const service = port?.service?.[0]?.$.name || 'Unknown';
        const state = port?.state?.[0]?.$.state || 'Unknown';

        content += `| ${portId} | ${protocol} | ${service} | ${state} |\n`;
      }
    } else {
      content += 'No open ports were found.\n';
    }

	content += "## Vulnerabilities Discovered"

    return content;
  }
}


// Setting tab
class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
