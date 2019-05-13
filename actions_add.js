"use strict";

window.actionCategories.addons = function(){
	return _('Extensions');
}

// Add global section to register addon actions if it doesn't exist yet
if (typeof addons == "undefined") 
	var addons = {}

addons.addonsMenu = {
	menuOrder: 55,
	menuGrouporder: 10,
	menu: [],

	refresh: async function(){
		let _this = this;
		if (!addons.hasOwnProperty('addonsMenuImportQueue') || !addons.addonsMenuImportQueue instanceof Array) {
			addons.addonsMenuImportQueue = [];
			return;
		}

		if(addons.addonsMenuImportQueue.length == 0)
			return;

		let importItems = addons.addonsMenuImportQueue;
		addons.addonsMenuImportQueue = [];

		// filter out items with missing properties
		importItems = importItems.filter(menuItm => {
			return (menuItm.hasOwnProperty('action') 
			&& menuItm.action.hasOwnProperty('title') 
			&& menuItm.hasOwnProperty('order') 
			&& menuItm.hasOwnProperty('category'));
		});

		// filter out items with missing title function or blank title
		importItems = importItems.filter(menuItm => {
			return (menuItm.action.title instanceof Function && menuItm.action.title() != '');
		});

		// Add imported entries to menu, but skip duplicates
		importItems.forEach(addonItm => {
			if (typeof (_this.menu.find(item => item.action.title() == addonItm.action.title() && item.category == addonItm.category)) != "undefined") {
				return Promise.reject('Item already exists');
			} 

			_this.menu.push({action: addonItm.action, order: addonItm.order, category: addonItm.category, grouporder: 100});
		})
		
		_this.sortMenu();
		await _this.pushToUi();
	},

	pushToUi: async function(){
		// pushes the internal menu to the ui
		let _this = this;

		if(_this.menu.length == 0)
			return;

		// Check if the menu was already pushed to UI, and only update the menu items if it was
		for (let i = 0; i < window.mainMenuItems.length; i++) {
			const itm = window.mainMenuItems[i].action;
			
			if(itm.hasOwnProperty('title') && itm.title instanceof Function && itm.title() == '&Addons'){
				itm.submenu = _this.menu;
				return;
			}
		}
		
		let newMenu = {
			action: {
				title: function () {
						return _('&Addons');
				},
				visible: !webApp,
				submenu: _this.menu
			},
			order: _this.menuOrder,
			grouporder: _this.menuGrouporder,
		}

		window.mainMenuItems.push(newMenu);
		uitools.switchMainMenu(false);
		uitools.switchMainMenu(true);
	},

	getCategories: function(){
		// returns an array with all categories in the menu
		return [...new Set(this.menu.map(x => x.category))];
	},

	sortMenu: function(){
		// sorts the menu by category

		// get list of all categories and add a sort value
		let cat = this.getCategories().sort();
		let catOrder = {};
		for (let index = 0; index < cat.length; index++) {
			catOrder[cat[index]] = (index + 1) * 100;
		}

		// update each menu item with the sort index
		this.menu.forEach(el => {
			el.grouporder = catOrder[el.category]
		});
	}
}

addons.addonsMenu.refresh()
