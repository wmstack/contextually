// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// a mapping from when clause contexts to whether they are active
// necessary because getContext is not available by vscode.
interface ContextList {
	[context: string]: boolean
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
		map[context] = false;
		vscode.commands.executeCommand('setContext', context, false);

		// add ability to turn on context.
		vscode.commands.registerCommand(`contextually.turnOn${context}`, () => {
			map[context] = true;
			vscode.commands.executeCommand('setContext', context, true);
		});

		// add ability to turn off context.
		vscode.commands.registerCommand(`contextually.turnOff${context}`, () => {
			map[context] = false;
			vscode.commands.executeCommand('setContext', context, false);
		});

		// add ability to toggle context.
		vscode.commands.registerCommand(`contextually.toggle${context}`, () => {
			console.log(`toggled ${context}`);
			// invert the context.
			map[context] = !map[context];
			console.log(`${context} is ${map[context]}`);
			vscode.commands.executeCommand(
				'setContext',
				context,
				map[context]
			);
		});
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
