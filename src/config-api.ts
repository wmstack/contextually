/**
 * The front facing user interface for contextually.
 */
import * as vscode from 'vscode';
export type ContextuallyContext = SingleContext[]
// the strings are convenience types and the FullContextConfig describes the full power of customization.
// Each of the other types strictly maps to a FullContextConfig. A context where the where default is a boolean will automatically produce commands to toggle that particular context on or off.  Two strings configure the default value and cursor shape. 3 strings configure the context name, the cursor shape, and the default value.
export type SingleContext = string
                      | [string, any]
                      | [string, any, string]
                      | FullContextConfig;

// A full context config gives the name of the when-clause context, its value assigned at startup, and a mapping from its values to cursor styles or statusbar item. Contextually is designed to be a general-purpose extension for setting when-clause contexts for visual studio code, however, it has two features that diverge from that goal:
// 1. Showing a status bar for a when-clause context
// 2. Changing the cursor shape given a particular when-clause context
// the `extra` flag tells contextually whether to create new commands for that context in particular, like `contextually.turnOn{context}` and so on. Normally, contextually only provides exactly two commands, one for setting a when clause context, and one for getting a when clause context.
export interface FullContextConfig {
	name: string,
  initial: boolean,
  map?: ValueView[],

  "add-toggles"?: boolean
}

// that is to say, you map every when-clause-context value to a view in the editor, which is to say, you map it to a cursor style and a status bar text and color. the first two types are again, just for convenience.
// [any, string] interprets the string as a cursor,
// [any, string, string] interprets the first string as a cursor, 2nd as a status bar text
export type ValueView = [any, string] | [any, string, string] | ValueViewMap
export interface ValueViewMap {
  val: any,

  // the public interface allows you to pick a number. So if vscode updates its list of cursor styles, one can write a number without the maintainer having to add an enum
  cursor?: CursorStyle | vscode.TextEditorCursorStyle,

  // status bar information
  text?: string
  alignment?: vscode.StatusBarAlignment,
  priority?: number;
  color?: StatusColor | string,
  backgroundColor: StatusColor | string,
}

// the reason we don't just use vscode's colour scheme is to give the users a string interface for typing the colour instead of just a numeric enum. They are of course, still free to write a number that corresponds to `vscode.TextEditorCursorStyle` if they wish.
// It would've been better if vscode gave us the scheme.
type StatusColor =  "warning" | "error";
type CursorStyle = "line" | "block" | "underline" | "line-thin" | "block-outline"
                 | "underline-thin";


// only a few vscode status bar item colours are supported. undefined for when there is no particular color that one might want to choose from.
export function mapBgColor(color: StatusColor): vscode.ThemeColor | undefined {
  if (color == "error") {
    return new vscode.ThemeColor("statusBarItem.errorBackground")
  }

  if(color == "warning") {
    return new vscode.ThemeColor("sttusBarItem.warningBackground")
  }
}

export function cursorify(
  cursor: string | vscode.TextEditorCursorStyle | undefined
): vscode.TextEditorCursorStyle | undefined {
  switch (cursor) {
    case 'block':
      return vscode.TextEditorCursorStyle.Block
    case 'block-outline' :
      return vscode.TextEditorCursorStyle.BlockOutline
    case 'line' :
      return vscode.TextEditorCursorStyle.Line
    case 'line-thin':
      return vscode.TextEditorCursorStyle.LineThin
    case 'underline':
      return vscode.TextEditorCursorStyle.Underline
    case 'underline-thin':
      return vscode.TextEditorCursorStyle.UnderlineThin
  }
}