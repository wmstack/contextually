# Contextually

A vscode extension which enables you to create your own contexts.

## How to use
Go to `settings.json`, and then add a `contextually.contexts` element as follows:
```json
"contextually.contexts": [
  "Normal",
  "Insert",
  "Random",
]
```

Then reload vscode, and then you will be able to use these contexts to configure your
keybindings. The contexts are named as they are in the array of contexts. That is,
those will be the names when you add them as when clause contexts in the `keybindings.json`:
```json
{
  "key": "escape",
  "command": "contextually.toggleNormal"
},
{
  "key": "j",
  "command": "cursorDown",
  "when": "textInputFocus && Normal"
},
{
  "key": "k",
  "command": "cursorUp",
  "when": "textInputFocus && Normal"
},
{
  "key": "h",
  "command": "cursorLeft",
  "when": "textInputFocus && Normal"
},
{
  "key": "l",
  "command": "cursorRight",
  "when": "textInputFocus && Normal"
}
```

## Initial context values
Context values start as `false`, and you can toggle them on or off by running the commands
```
contextually.toggle{context}
contextually.turnOn{context}
contextually.turnOff{context}
```

The commands above should be available when you look for them in vscode's keybindings,
which can be opened with `ctrl+K ctrl+S`. Let me know if you can't get them to work.
