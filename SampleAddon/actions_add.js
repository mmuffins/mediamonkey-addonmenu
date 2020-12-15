if(!actionCategories.hasOwnProperty('addons')){
  actionCategories.addons = () => _('Addons');
}

actions.addonMenuSampleAddonAction1 = {
  title: () => _('Action 1'),
  hotkeyAble: false,
  category: actionCategories.addons,
  addon: () => _("Sample Addon Actions"),
    
  execute: function () {
    addons.addonMenuSampleAddon.function1();
  }
}

actions.addonMenuSampleAddonAction2 = {
  title: () => _('Action 2'),
  hotkeyAble: false,
  category: actionCategories.addons,
  addon: () => _("Sample Addon Other Actions"),
    
  execute: () => addons.addonMenuSampleAddon.function2()
}

actions.addonMenuSampleAddonInlineAction = {
  title: () => _('Inline Action'),
  hotkeyAble: false,
  category: actionCategories.addons,
  addon: () => _("Sample Addon Actions"),
    
  execute: () => alert('Inline Action')
}

// Refresh the addons menu if it was already loaded
if(typeof addons != "undefined" && addons.addonsMenu != null)
  addons.addonsMenu.refresh();