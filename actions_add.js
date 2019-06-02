window.actionCategories.extensions = function(){
    return _('Extensions');
}

// Add global section to register extension actions if it doesn't exist yet
if (typeof extensions == "undefined")
    var extensions = {}
    
// add actions to the extensions menu
if (!extensions.hasOwnProperty('extensionsMenuImportQueue'))
    extensions.extensionsMenuImportQueue = []