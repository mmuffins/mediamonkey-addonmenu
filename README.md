# Addons Menu for MediaMonkey
This extension adds an addons menu to the MediaMonkey 5 main menu.

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
Create an array containing all entries that should be added to the addons menu. Each entry that should be added to the addons menu needs to have three properties:
* action: Contains the action to be executed.
* category: Category/Grouping name for all entries. This should usually be the name of the addon.
* order: Sort order for the respective entry within its category.

```
let testAddonActions = []
// every action that should 
testAddonActions.push({action:actions.testAddon.create, order: 10, category:'TestAddon'})
testAddonActions.push({action:actions.testAddon.delete, order: 20, category:'TestAddon'})
```


Since it's not possible to enforce a load order for extensions, it cannot be guaranteed that the addons menu is already loaded when the addon wants to register an action. If it is already loaded, the addon can directly register the action, if not, it needs to add the action to a addons menu queue. Once it's loaded, the addons menu will check the queue and register all actions.

```
// Add global namespace to register addon actions if it doesn't exist yet
if (typeof addons == "undefined") var addons = {}

if(addons.addonsMenu != null){
  // Directly register actions if the addons menu has been loaded
  addons.addonsMenu.registerCommands(testAddonActions)
} else {
  // Otherwise add them to the addons menu queue
  if (!addons.hasOwnProperty('addonsMenuQueue')) addons.addonsMenuQueue = []
  testAddonActions.forEach(element => {
    addons.addonsMenuQueue.push(element)
  });
}
```
