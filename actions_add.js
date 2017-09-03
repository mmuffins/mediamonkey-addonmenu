
// Add global section to register addon actions if it doesn't exist yet
if(typeof addons == "undefined"){
	var addons = {}
}


window.actionCategories.addons = function(){
	return _('AddonsMenu');
}

let addonsMenu = {
		action: {
				title: function () {
						return _('&Addons');
				},
				visible: !webApp,
				submenu: [
						{
								action: actions.fixArtistDelimiter,
								order: 10,
								grouporder: 10
						},
						{
								action: actions.scan,
								order: 20,
								grouporder: 10
						},
						{
								action: actions.downloadFile,
								order: 30,
								grouporder: 10
						},
						{
								action: actions.locateMissing,
								order: 40,
								grouporder: 10
						},
						{
								action: actions.maintainLibrary,
								order: 50,
								grouporder: 10
						},
						{
								action: actions.quit,
								order: 10,
								grouporder: 50
						}
				]
		},
		order: 55,
		grouporder: 10,
}

window.mainMenuItems.push(addonsMenu)
