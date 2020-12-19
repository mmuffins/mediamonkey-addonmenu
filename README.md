# Addon Menu for MediaMonkey
This addon adds an additional item to the MediaMonkey 5 main menu bar that allows addon developers to present an entry point or functionality of their addon in a central and consistent way to the user.

## Installation
Download the latest release from the releases section and double click the downloaded mmip file. An MediaMonkey dialog will automatically pop up, prompting you to confirm the installation. Once installed, the addon menu will automatically look for actions exposed by installed addons and add them to a new Addons item in the main menu bar.

### I don't see the addon menu after I installed the addon
The addon menu will only be displayed if addon actions were found. You can validate this by opening the addon configuration page for the addon menu.

### I installed an addon, but the menu doesn't contain any actions for it
If an installed addon doesn't show up in the menu, it either doesn't expose any actions or the actions are not configured to work with the addon menu. If there is an addon you would like to see added to the menu, please point the maintainer of the addon to this page, menu support can usually be added with a few lines of code.

## Developer information
### Registering actions
The addon menu automatically imports all valid actions from the global actions object if they are in the addons category. The following properties are required for an action to be considered valid:

| Name          | Type       | Description  |
| :------------ |:---------- | :----------  |
| title         | function   | Display name of the action |
| addon         | function   | Folder name to group actions |
| execute       | function   | Function to execute when calling the action |

### Example
To create new actions, simply add new actions to the global actions object.

```javascript
// Make sure to keep this header as it's needed to properly discover and
// import addon actions
if(!window.actionCategories.hasOwnProperty('addons')){
  window.actionCategories.addons = () => _('Addons');
}

// Create the needed actions
window.actions.MyAddonAction = {
  title: () => _('&My Addon Action'),
  hotkeyAble: true, // If set to true, the action can be mapped to a hotkey in the settings screen under Options > General > Hotkeys.
  category: actionCategories.addons,
  icon: 'myAddonIcon',
  addon: () => _("My &Addon"),
  execute: () => alert('My Addon Action')
}

window.actions.MyOtherAddonAction = {
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
if(typeof window.addons != "undefined" && window.addons.addonMenu != null)
  window.addons.addonMenu.refresh();
```

Also see the SampleAddon folder for a full usage example.