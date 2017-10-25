
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
								// action: actions.fixArtistDelimiter,
								order: 10,
								grouporder: 10
						},
						// {
						// 		action: 'mp playlist checker',
						// 		order: 20,
						// 		grouporder: 10
						// },
						{
								// action: actions.musicLifecycle.new,
								order: 10,
								grouporder: 100
						},
						{
								// action: actions.musicLifecycle.newMusic,
								order: 20,
								grouporder: 100
						},
						{
								// action: actions.musicLifecycle.pending,
								order: 30,
								grouporder: 100
						},
						{
								// action: actions.musicLifecycle.transit,
								order: 40,
								grouporder: 100
						},
						{
								// action: actions.musicLifecycle.looped,
								order: 50,
								grouporder: 100
						},
						{
								// action: actions.musicLifecycle.active,
								order: 60,
								grouporder: 100
						}
				]
		},
		order: 55,
		grouporder: 10,
}

window.mainMenuItems.push(addonsMenu)
