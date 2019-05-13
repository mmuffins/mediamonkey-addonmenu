# Addons Menu for MediaMonkey
This extension adds an additional item to the MediaMonkey 5 main menu bar that allows extension developers to present an entry point or functionality of their extension in a central and consistent way to the user.

## Installation
Download the latest release from the releases section and double click addonsMenu.mmip. An MediaMonkey dialog will automatically pop up, prompting you to confirm the installation.

## Registering actions
To add an action to the addons menu, follow the steps below.
Create an action for the function of the calling addon
```
actions.testAddon = {
	create: {
    title: function() {
      return _('&TestAddon Create Action')
    },
    hotkeyAble: false,
    category: actionCategories.addons,
    icon: 'createIcon',
    execute: function() {
      ...
    }
  },

  delete: {
    title: function() {
      return _('&TestAddon Delete Action')
    },
    hotkeyAble: false,
    category: actionCategories.addons,
    icon: 'deleteIcon',
    execute: function() {
      ...
    }
  },
}
```
Since it's not possible to enforce a load order for extensions or otherwise ensure that the Addons Menu extension is loaded before an extension wants to register an action, new menu items are added indirectly by pushing them into an import queue, which is picked up and processed once the Addons Menu extension is loaded.

```
// Add global section to register addon actions if it doesn't exist yet
if (typeof addons == "undefined") 
	var addons = {}

// If the Addons Menu was not loaded yet, not import queue exists. 
if (!addons.hasOwnProperty('addonsMenuImportQueue')) 
  addons.addonsMenuImportQueue = []

// Push actions that should be added to the menu to the import queue.
// Do not replace the import queue with a new array as this might remove already queued actions from other extensions
testAddonActions.push({action:actions.testAddon.create, order: 10, category:'TestAddon'})
testAddonActions.push({action:actions.testAddon.delete, order: 20, category:'TestAddon'})

// Refresh the menu to import actions that were added to the queue.
// No need to worry if the menu can't be refreshed at this point because it's not loaded yet.
// It will automatically import all pending entries in the import queue as soon as its  loaded.
if(addons.addonsMenu != null)
  addons.addonsMenu.refresh();
```

Each pushed to the import queue needs to have three properties:
* action: Contains the action to be executed.
* category: Category/Grouping name for all entries. This should usually be the name of the addon.
* order: Sort order for the respective entry within its category.