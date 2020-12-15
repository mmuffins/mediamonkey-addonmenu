# Addons Menu for MediaMonkey
[![Build status](https://dev.azure.com/mmuffins/github/_apis/build/status/MediaMonkey.AddonMenu)](https://dev.azure.com/mmuffins/github/_build/latest?definitionId=79)

This addon adds an additional item to the MediaMonkey 5 main menu bar that allows addon developers to present an entry point or functionality of their addon in a central and consistent way to the user.

## Installation
Download the latest release from the releases section and double click addonMenu.mmip. An MediaMonkey dialog will automatically pop up, prompting you to confirm the installation.

## Registering actions
The addon menu automatically imports all valid actions from the global actions object if they are in the Extenions category. The following properties are required for an action to be considered valid:

| Name          | Type       | Description  |
| :------------ |:---------- | :----------  |
| title         | function   | Display name of the action |
| addon     | function   | Display name of the addon |
| execute       | function   | Function to execute when calling the action |

## Example
To create new actions, simply add new actions to the global actions object.

```javascript
// Make sure to keep this header as it's needed to properly discover and
// import addon actions
if(!actionCategories.hasOwnProperty('addons')){
  actionCategories.addons = () => _('Addons');
}

// Create the needed actions
actions.MyAddonAction = {
  title: () => _('&My Addon Action'),
  hotkeyAble: true,
  category: actionCategories.addons, // Should always be actionCategories.addons, otherwise the action won't be discovered by the addon menu
  icon: 'myAddonIcon',
  addon: () => _("My &Addon"), // The addon property is used to group individual actions in folders
  execute: () => alert('My Addon Action')
}

actions.MyOtherAddonAction = {
  title: () => _('My &Other Addon Action'),
  hotkeyAble: true,
  category: actionCategories.addons,
  icon: 'myOtherAddonIcon',
  addon: () => _("My &Addon"),
  execute: () => alert('My Other Addon Action')
}

// Refresh the addon menu to import new actions.
// No need to worry if the menu can't be refreshed at this point because it's not loaded yet.
// It will automatically import all actions as soon it gets loaded by MediaMonkey.
if(typeof addons != "undefined" && addons.addonMenu != null)
  addons.addonMenu.refresh();
```

Also see the SampleAddon folder for a full usage example.