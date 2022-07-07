import * as api from "./config-api";
import * as vscode from 'vscode';

/**
 * internal programmer api after parsing the `contextually.context` field. This is to make
 * it easier to write the logical without too many if statements. The external api provides
 * a lot of those convenience unions, so it would be good to re-write them as a programmer
 * api, which doesn't have complex unions. This also helps other programmers figure out the
 * full scope of contextually as an extension, what it can do, and what it doesn't do.
 *
 * @field {string} name - the name of the when-clause context
 * @field {any} initial - the initial value of the context. when a boolean, special commands
 * are made. */
export interface Aggregative {
  name: string,
  initial: any,
  make_extra_commands: boolean,
  mappings: ViewMap[]
}

/**
 * a simple mapping from state to view. Since the context is not necessarily a string, it
 * must have a separate field for the key. the state is the value of the when-clause
 * context, the view is whether to show the status bar, and if so its text and color, and
 * similarly whether to change the cursor style. */
interface ViewMap {
  key: any,
  status?: StatusBarConfig
  // vscode allows you to configure a cursor with a string
  cursor?: vscode.TextEditorCursorStyle
}

interface StatusBarConfig {
  text: string,
  color?: vscode.ThemeColor,
  background?: vscode.ThemeColor,
  alignment: vscode.StatusBarAlignment,
  priority: number
}

export function parseConextually(config: api.ContextuallyContext): Aggregative[] {
  let contextList: Aggregative[] = [];
  for (let context of config) {
    if (typeof context === "string") {
      contextList.push({
        name: context,
        initial: false,
        make_extra_commands: true,
        mappings: []
      });
      continue;
    }

    if (context instanceof Array) {
      if (context.length == 2) {
        contextList.push({
          name: context[0],
          initial: context[1],
          // this might be controversial
          make_extra_commands: typeof context[1] === "boolean",
          mappings: []
        });
        continue;
      }

      if (context.length == 3) {
        contextList.push({
          name: context[0],
          initial: context[1],
          make_extra_commands: typeof context[1] === "boolean",
          // vscode accepts a cursor of type string anyway
          mappings: [{
            key: true,
            cursor: api.cursorify(context[2])
          }]
        });
        continue;
      }
    }

    if (typeof context == "object" && context != null) {
      let mappings: ViewMap[] = []
      if (context.map) {
        for (let map of context.map) {
          if (Array.isArray(map)) {
            if (map.length == 2) {
              mappings.push({
                key: map[0],
                cursor: api.cursorify(map[1]),
              });
              continue;
            }

            if (map.length == 3) {
              mappings.push({
                key: map[0],
                cursor: api.cursorify(map[1]),
                status: {
                  text: map[2],
                  alignment: vscode.StatusBarAlignment.Left,
                  priority: 1
                }
              })
              continue;
            }
            continue;
          }

          if (typeof map === "object") {
            let status: StatusBarConfig | undefined = undefined
            if (map.text || map.bg || map.color) {
              status = {
                text: map.text || context.name,
                background: api.mapBgColor(map.bg) || undefined,
                color: map.color || undefined,
                alignment: map.alignment || vscode.StatusBarAlignment.Left,
                priority: map.priority || 1

              }
            }
            mappings.push({
              key: map.initial,
              cursor: api.cursorify(map.cursor),
              status
            })
          }
        }
      }
      contextList.push({
        name: context.name,
        initial: context.initial,
        make_extra_commands: context["add-toggles"] || typeof context.initial === "boolean",
        mappings
      });
      continue;
    }

  }

  return contextList;
}


