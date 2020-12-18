if(!window.actionCategories.hasOwnProperty('addons')){
  window.actionCategories.addons = () => _('Addons');
}

window.actions.addonMenuSampleAddonAction1 = {
  title: () => _('Action 1'),
  hotkeyAble: false,
  category: actionCategories.addons,
  addon: () => _("Sample Addon Actions"),
    
  execute: function () {
    window.addons.addonMenuSampleAddon.function1();
  }
}

window.actions.addonMenuSampleAddonAction2 = {
  title: () => _('Action 2'),
  hotkeyAble: false,
  category: actionCategories.addons,
  addon: () => _("Sample Addon Other Actions"),
    
  execute: () => window.addons.addonMenuSampleAddon.function2()
}

window.actions.addonMenuSampleAddonInlineAction = {
  title: () => _('Inline Action'),
  hotkeyAble: false,
  category: actionCategories.addons,
  addon: () => _("Sample Addon Actions"),
    
  execute: () => alert('Inline Action')
}

// Refresh the addons menu if it was already loaded
if(typeof window.addons != "undefined" && window.addons.addonsMenu != null)
  window.addons.addonsMenu.refresh();