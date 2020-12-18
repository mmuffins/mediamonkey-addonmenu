// Add global section to register addon actions if it doesn't exist yet
if (typeof window.addons == "undefined")
  window.addons = {}

if(!window.actionCategories.hasOwnProperty('addons')){
	window.actionCategories.addons = () => _('Addons');
  }