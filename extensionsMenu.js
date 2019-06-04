"use strict";

extensions.extensionsMenu = {
	menuGrouporder: 10,
	menu: [],

	refresh: async function(){
		let _this = this;
		if (!extensions.hasOwnProperty('extensionsMenuImportQueue') || !extensions.extensionsMenuImportQueue instanceof Array) {
			extensions.extensionsMenuImportQueue = [];
			return;
		}

		if(extensions.extensionsMenuImportQueue.length == 0)
			return;

		let importItems = extensions.extensionsMenuImportQueue;
		extensions.extensionsMenuImportQueue = [];

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
		importItems.forEach(extensionItm => {
			if (typeof (_this.menu.find(item => item.action.title() == extensionItm.action.title() && item.category == extensionItm.category)) != "undefined") {
				return Promise.reject('Item already exists');
			} 

			_this.menu.push({action: extensionItm.action, order: extensionItm.order, category: extensionItm.category, grouporder: 100});
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
			
			if(itm.hasOwnProperty('title') && itm.title instanceof Function && itm.title() == '&Extensions'){
				itm.submenu = _this.menu;
				return;
			}
		}
		
		// The extensions menu item has not yet been added to the main menu

		// The help menu is, by convention, the last item on a menu bar, so the extension menu should be positioned before it.

		let helpMenu = window.mainMenuItems.filter(itm => itm.action.title instanceof Function && itm.action.title() == "&Help")[0]
		// While just taking the first index before the helpmenu could cause a collision with other items,
		// it doesn't matter beacause what ultimately decides the used order is the position within the mainMenuItems array,
		// not the order property
		let extMenuIndex = helpMenu.order -1;

		let newMenu = {
			action: {
				title: function () {
						return _('&Extensions');
				},
				visible: !webApp,
				submenu: _this.menu
			},
			order: extMenuIndex,
			grouporder: _this.menuGrouporder,
		}

		window.mainMenuItems.push(newMenu);
		window.mainMenuItems.sort((a,b) =>  !a.hasOwnProperty('order') || a.order > b.order);
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
	},

	getExtensionActions: function(){

		// returns an array containing all actions in the extensions category

		let extensionCat = actionCategories.extensions();
		return Object.keys(actions)
			.filter((key) => actions[key].hasOwnProperty("category") 
				&& typeof actions[key].category == "function"  
				&& actions[key].category() == extensionCat)
			.reduce((obj, key) => {return{...obj, [key]: actions[key]}},{})
	}
}

extensions.extensionsMenu.refresh()
