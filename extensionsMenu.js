"use strict";

extensions.extensionsMenu = {
	menu: [],
	miscCategoryName: "Misc",

	refresh: async function(){
		let _this = this;
		let menu = _this.buildMenu()
		await _this.pushToUi(menu);
	},

	pushToUi: async function(Menu){
		// pushes the internal menu to the ui
		let _this = this;

		if(Menu.length == 0)
			return;

		// Check if the menu was already pushed to UI, and only update the menu items if it was
		for (let i = 0; i < window.mainMenuItems.length; i++) {
			const itm = window.mainMenuItems[i].action;
			
			if(itm.hasOwnProperty('title') && itm.title instanceof Function && itm.title() == '&Extensions'){
				itm.submenu = Menu;
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
				submenu: Menu
			},
			order: extMenuIndex,
			grouporder: 10,
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
		// returns an array containing all extension in the extensions category

		let extensionCat = actionCategories.extensions();
		return Object.keys(actions)
			.filter((key) => actions[key].hasOwnProperty("category") 
				&& actions[key].category instanceof Function 
				&& actions[key].category() == extensionCat)
			.map(function(key){return actions[key]})
	},

	getValidActions: function(){
		// returns an array containing all extension actions with valid properties

		let allActions = this.getExtensionActions();

		let validActions = allActions.filter(ext => {
			return (ext.hasOwnProperty('execute') 
			&& ext.hasOwnProperty('title')
			&& ext.title instanceof Function
			&& (ext.title())
			);
		});
		
		return validActions;

	},

	getGroupedExtensionActions: function(){
		// returns an array of extension actions grouped by their extension property
		// extensions without the extension property will be grouped into the Misc category

		let extensionActions = this.getValidActions();
		let actionsWithExt = extensionActions.filter(x => {
			return x.hasOwnProperty("extension") 
			&& x.extension instanceof Function
			&& (x.extension())
		});

		let extList = this.getExtensionList();
		extList.sort();
		let groupedList = [];

		extList.forEach(ext =>{
			let extActions = actionsWithExt.filter(x => x.extension() == ext)

			groupedList.push({
				extension:ext,
				actions:extActions
			});
		});

		let actionsWithoutExt = extensionActions.filter(x => {
			return !x.hasOwnProperty("extension") 
			|| !(x.extension instanceof Function)
			|| !(x.extension())
		});

		if(actionsWithoutExt.length > 0){
			groupedList.push({
				extension:this.miscCategoryName,
				actions:actionsWithoutExt
			});
		}

		return groupedList;
	},

	getExtensionList: function(){
		// Returns the grouped extension list of all loaded actions

		let extensionActions = this.getValidActions();
		return [...new Set(extensionActions.map(x => {
				if(x.hasOwnProperty("extension") && x.extension instanceof Function){
					return x.extension();
				}
			}))]
			.filter(x => x) // filters out undefined
	},

	buildMenu: function(){
		// Creates menu that can be pushed to the main menu

		let extActions = this.getGroupedExtensionActions();

		let menu = [];
		let sortOrder = 0;
		extActions.forEach(ext =>{
			
			let itemAction = {
				title: () => ext.extension,
				submenu: ext.actions
			};

			menu.push({
				action: itemAction,
				grouporder: 10,
				order: (sortOrder += 10)
			});
		})
		return menu;
	}
}

extensions.extensionsMenu.refresh()
