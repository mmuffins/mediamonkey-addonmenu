// Add global section to register addon actions if it doesn't exist yet
if(typeof addons == "undefined" )
	addons = {};

actionCategories.addons = () => _('Addons');