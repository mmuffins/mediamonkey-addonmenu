# Extensions Menu for MediaMonkey
[![Build status](https://dev.azure.com/mmuffins/github/_apis/build/status/MediaMonkey.ExtensionsMenu)](https://dev.azure.com/mmuffins/github/_build/latest?definitionId=79)

This extension adds an additional item to the MediaMonkey 5 main menu bar that allows extension developers to present an entry point or functionality of their extension in a central and consistent way to the user.

## Installation
Download the latest release from the releases section and double click extensionsMenu.mmip. An MediaMonkey dialog will automatically pop up, prompting you to confirm the installation.

## Registering actions
To add an action to the Extensions menu, follow the steps below.
Create an action for the function of the calling Extensions
```javascript
actions.testExtensions = {
	create: {
    title: function() {
      return _('&TestExtension Create Action')
    },
    hotkeyAble: false,
    category: actionCategories.extensions,
    icon: 'createIcon',
    execute: function() {
      ...
    }
  },

  delete: {
    title: function() {
      return _('&TestExtension Delete Action')
    },
    hotkeyAble: false,
    category: actionCategories.extensions,
    icon: 'deleteIcon',
    execute: function() {
      ...
    }
  },
}
```
Since it's not possible to enforce a load order for extensions or otherwise ensure that the Extensions Menu extension is loaded before an extension wants to register an action, new menu items are added indirectly by pushing them into an import queue, which is picked up and processed once the Extensions Menu extension is loaded.

```javascript
// Add global section to register extension actions if it doesn't exist yet
if (typeof extensions == "undefined") 
	var extensions = {}

// If the Extensions Menu was not loaded yet, not import queue exists. 
if (!extensions.hasOwnProperty('extensionsMenuImportQueue')) 
  extensions.extensionsMenuImportQueue = []

// Push actions that should be added to the menu to the import queue.
// Do not replace the import queue with a new array as this might remove already queued actions from other extensions
extensions.extensionsMenuImportQueue.push({action:actions.testExtension.create, order: 10, category:'TestExtension'})
extensions.extensionsMenuImportQueue.push({action:actions.testExtension.delete, order: 20, category:'TestExtension'})

// Refresh the menu to import actions that were added to the queue.
// No need to worry if the menu can't be refreshed at this point because it's not loaded yet.
// It will automatically import all pending entries in the import queue as soon as its  loaded.
if(extensions.extensionsMenu != null)
  extensions.extensionsMenu.refresh();
```

Each pushed to the import queue needs to have three properties:
* action: Contains the action to be executed.
* category: Category/Grouping name for all entries. This should usually be the name of the extension.
* order: Sort order for the respective entry within its category.