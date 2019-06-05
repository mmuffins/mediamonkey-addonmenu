# Extensions Menu for MediaMonkey
[![Build status](https://dev.azure.com/mmuffins/github/_apis/build/status/MediaMonkey.ExtensionsMenu)](https://dev.azure.com/mmuffins/github/_build/latest?definitionId=79)

This extension adds an additional item to the MediaMonkey 5 main menu bar that allows extension developers to present an entry point or functionality of their extension in a central and consistent way to the user.

## Installation
Download the latest release from the releases section and double click extensionsMenu.mmip. An MediaMonkey dialog will automatically pop up, prompting you to confirm the installation.

## Registering actions
The extension menu automatically imports all valid actions from the global actions object if they are in the Extenions category. The following properties are required for an action to be considered valid:

| Name          | Type       | Description  |
| :------------ |:---------- | :----------  |
| title         | function   | Display name of the action |
| extension     | function   | Display name of the extension |
| execute       | function   | Function to execute when calling the action |

## Example
To create new actions, simply add a new property to the global actions object.

```javascript
if(!actionCategories.hasOwnProperty('extensions')){
  actionCategories.extensions = () => _('Extensions');
}

actions.MyAddonAction = {
  title: () => _('&My Addon Action'),
  hotkeyAble: true,
  category: actionCategories.extensions,
  icon: 'myAddonIcon',
  extension: () => _("My &Addon"),
  execute: () => alert('My Addon Action')
}

actions.MyOtherAddonAction = {
  title: () => _('My &Other Addon Action'),
  hotkeyAble: true,
  category: actionCategories.extensions,
  icon: 'myOtherAddonIcon',
  extension: () => _("My &Addon"),
  execute: () => alert('My Other Addon Action')
}

// Refresh the extension menu to import new actions.
// No need to worry if the menu can't be refreshed at this point because it's not loaded yet.
// It will automatically import all actions as soon it gets loaded by MediaMonkey.
if(typeof extensions != "undefined" && extensions.extensionsMenu != null)
  extensions.extensionsMenu.refresh();
```