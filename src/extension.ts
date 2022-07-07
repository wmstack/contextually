// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {parseConextually, Aggregative} from './config-internal'

let contexts: Map<string, ContextDeclaration> = new Map();
// start up the extension!
export function activate(context: vscode.ExtensionContext) {
	// extract `contextually.contexts` from the settings
	let configurations = vscode.workspace.getConfiguration("contextually");
	let contexts: Aggregative[] | undefined =  configurations?.get("contexts");
	if (!contexts) return;

	let internal = parseConextually(contexts);
	for (let ctx of internal) {
		// register all the status bar notifications, custom commands, and
		configure(ctx)
	}

	vscode.commands.registerCommand("contextually.setContext", (name, val)=>{
		configure({
			initial: val,
			name: name,
			mappings: [],
			make_extra_commands: false
		})
	});
}

function configure(ctx: Aggregative) {
	setContext(ctx, ctx.initial);

	if (ctx.make_extra_commands) {
		// add a command that turns on context.
		vscode.commands.registerCommand(`contextually.turnOn${ctx.name}`, () => {
			setContext(ctx, true)
		});

		vscode.commands.registerCommand(`contextually.turnOff${ctx.name}`, ()=>{
			setContext(ctx, false)
		});

		vscode.commands.registerCommand(`contextually.toggle${ctx.name}`, ()=>{
			let context_decl = contexts.get(ctx.name);
			setContext(ctx, !context_decl?.value);
		})
	}

}

function setContext(ctx: Aggregative, val: any) {
	vscode.commands.executeCommand('setContext', ctx.name, val);
	var contextObj = contexts.get(ctx.name);

	if (!contextObj) {
		// make one
		var statusBar: vscode.StatusBarItem | undefined;
		for (let mapping of ctx.mappings) {
			if (mapping.status) {
				statusBar  = vscode.window.createStatusBarItem(
					mapping.status.alignment,
					mapping.status.priority
				)

				statusBar.show();
				break
			}
		}

		contextObj = {
			hndl: ctx,
			value: val,
			statusbar_handle: statusBar
		}
	}

	contextObj.value = val;
	let editor = vscode.window.activeTextEditor;
	let ourMap = contextObj.hndl.mappings.find((hndl)=> hndl.key == val);
	let cursor = ourMap?.cursor
	let newbar = ourMap?.status
	if (cursor && editor) {
		editor.options.cursorStyle = cursor
	} else {
		if (editor) editor.options.cursorStyle = vscode.TextEditorCursorStyle.Line;
	}
	if (newbar && contextObj.statusbar_handle) {
		contextObj.statusbar_handle.color = newbar.color
		contextObj.statusbar_handle.backgroundColor = newbar.background
		contextObj.statusbar_handle.text = newbar.text
	}


	contexts.set(ctx.name, contextObj);
}

function addContext(ctx: Aggregative) {
	configure(ctx);
}

interface ContextDeclaration {
	value: any,
	statusbar_handle?: vscode.StatusBarItem,
	hndl: Aggregative
}
// this method is called when your extension is deactivated
export function deactivate() { }
