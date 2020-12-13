// Add global section to register extension actions if it doesn't exist yet
if(typeof extensions == "undefined" )
	extensions = {};

actionCategories.extensions = () => _('Extensions');