// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// a mapping from when clause contexts names to their values. And other things "owned" by
// them. For example, storing the statusbar item so it can be updated.
// necessary because getContext values are not available by vscode.
interface ContextList {
	[context: string]: {
		value: any,
		status: vscode.StatusBarItem,
	}
}

// start up the extension!
export function activate(context: vscode.ExtensionContext) {
	// extract `contextually.contexts` from the settings
	let configurations = vscode.workspace.getConfiguration("contextually");
	let contexts: string[] | null | undefined = configurations?.get("contexts");

	// this map will track the truthy/falsity of every context. needed because there is
	// no way currently to executeCommand('getContext', key)
	var map: ContextList = {};

	// initialize each context as false, and add `turnOn` `turnOff` and `toggle`
	// commands for each context.
	for (let context of contexts || []) {
		map[context] = {
			value: false,
			status: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, -2),
		};

		// initialize context value
		vscode.commands.executeCommand('setContext', context, false);

		// introduce a status bar item.
		map[context].status.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
		map[context].status.color = "#ffffff";
		changeStatus(map, context);
		map[context].status.tooltip = `${context}`;
		map[context].status.show();

		// add a command that turns on to turn on context.
		vscode.commands.registerCommand(`contextually.turnOn${context}`, () => {
			map[context].value = true;
			vscode.commands.executeCommand('setContext', context, true);
		});

		// add ability to turn off context.
		vscode.commands.registerCommand(`contextually.turnOff${context}`, () => {
			map[context].value = false;
			changeStatus(map, context);

			vscode.commands.executeCommand('setContext', context, false);
		});

		// add ability to toggle context.
		vscode.commands.registerCommand(`contextually.toggle${context}`, () => {
			console.log(`toggled ${context}`);
			// invert the context.
			map[context].value = !map[context].value;
			changeStatus(map, context);

			vscode.commands.executeCommand(
				'setContext',
				context,
				map[context]
			);
		});

	}

	// add a generic command to change a context to a certain value.
	vscode.commands.registerCommand(`contextually.updateContext`, ([name , value]) => {
		if (map[name] !== undefined) {
			map[name].value = value;
			changeStatus(map, name);
		}
	});
}

// change status-bar item text.
function changeStatus(map: ContextList, context: string): void {
	// todo: maybe control width.
	map[context].status.text = `${context}: ${map[context].value}`;
}

// this method is called when your extension is deactivated
export function deactivate() { }
