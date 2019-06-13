"use strict";

// Add global section to register extension actions if it doesn't exist yet
if (typeof extensions == "undefined")
	extensions = {}
	
extensions.extensionsMenu = {
	actionTree: [],
	miscCategoryName: "Misc",
	addonName: () => "ExtensionsMenu",

	refresh: async function(){
		let _this = this;
		let menu = _this.buildMainMenuArray()
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
		// returns a list of all actions with an extension property

		return Object.keys(actions)
			.filter((key) => actions[key].hasOwnProperty("extension") 
				&& actions[key].extension instanceof Function
				&& (actions[key].extension()))
			// .map(function(key){return {key:key,action:actions[key]}})
	},

	getValidActions: function(){
		// returns a list of all extension actions with valid properties

		let allActions = this.getExtensionActions();

		let validActions = allActions.filter(ext => {
			return (actions[ext].hasOwnProperty('execute') 
			&& actions[ext].hasOwnProperty('title')
			&& actions[ext].title instanceof Function
			&& (actions[ext].title())
			);
		})
		
		return validActions;
	},

	getExtensionList: function(){
		// Returns the grouped extension list of all loaded actions

		let validActions = this.getValidActions();
		// return [...new Set(extensionActions.map(x => x.action.extension()))]
		return [...new Set(validActions.map(act => actions[act].extension()))]

	},

	groupActions: function(){
		// returns an array of all valid actions grouped by their extension;

		let groupedActions = [];
		let validActions = this.getValidActions();
		let extensionList = this.getExtensionList();

		// expand valid actions to full object to be able to group them
		let actionFunctions = Object.keys(actions)
			.filter(key => validActions.includes(key))
			.map(function(key){return {key:key,action:actions[key]}})
		
		// get the actions for each extension and group them
		extensionList.forEach(ext =>{
			let filteredActions = actionFunctions
				.filter(act => act.action.extension() == ext)
				.map(act => act.key)

			groupedActions.push({
				extension: ext,
				actions: filteredActions
			});
		});

		return groupedActions;
	},

	buildActionTree: function(){
		// Creates an extension tree from the currently loaded actions

		let extActions = this.groupActions();
		extActions.sort();

		let tree = [];

		let extSortOrder = 0;
		extActions.forEach(ext =>{

			// map each action with its order within the extension and an unique ID
			let actionSortOrder = 0;
			let extActions = ext.actions.map(act => {
				return {
					action: act,
					id: `actions.${act}`,
					type: "action",
					group: `groups.${window.uitools.getPureTitle(ext.extension).replace(" ","_")}`,
					order: (actionSortOrder += 10),
					show: true
				}
			});

			// wrap the submenu node into a extension node
			tree.push({
				order: (extSortOrder += 10),
				id: `groups.${window.uitools.getPureTitle(ext.extension).replace(" ","_")}`,
				title: ext.extension,
				type: "group",
				actions: extActions
			});
		})
		return tree;
	},

	getActionTree: function(){
		if(this.actionTree.length == 0)
			this.actionTree = this.buildActionTree();

		return this.actionTree;
	},

	buildMainMenuArray: function(){
		// Creates menu that can be pushed to the main menu

		let menu = []
		let extTree = this.getActionTree();
		extTree.forEach(ext =>{
			// Unwrap each tree item and reorganize it to a structure
			// that can be understood by the main menu
			
			let actionList = ext.actions.map(act => {
				return {
					grouporder:10,
					order: act.order,
					action: actions[act.action]
				}
			})

			let extensionAction = {
				title: () => ext.title,
				submenu: actionList
			};

			menu.push({
				grouporder: 10,
				order: ext.order,
				action: extensionAction
			});
		});

		return menu;
	},

	resetActionTree: function(){
		// discards all user settings and rebuilds the action tree
		this.actionTree = this.buildActionTree();
	},

	moveAction: function(item, target){
		// moves the provided action to a new parent

		if(item.type == "group"){
			if(target.type == "group"){
				// group was dropped on different group
				this.moveToIndex(item, target.order);
			} 
			else {
				if(item.id != target.group){
					// group was dropped on action in different group, move item
					// behind the parent of the target
					let targetIndex = this.getActionParent(target).order + 1;
					this.moveToIndex(item, targetIndex)
				} 
				// else group was dropped on action in same group, nothing to do here
			}
		} else{
			if(target.type == "group"){
				if(item.group != target.id){
					// action was dropped on different group, move to last index of the group
					this.moveActionToGroup(item, target)
				} 
					// else action was dropped on same group, nothing to do here
			} else {

				if(item.group == target.group){
					// action was dropped on action in same group
					this.moveToIndex(item, target.order);
				} else{
					// action was dropped on action in different group
					let targetParent = this.getActionParent(target)
					this.moveActionToGroup(item, targetParent)
					this.moveToIndex(item, target.order);

				}
			}
		}

		this.cleanupGroups();
	},

	moveActionToGroup: function(item, target){
		// moves action to the last position of a group

		let newParent = this.actionTree.filter(x => x.id == target.id)[0];
		let oldParent = this.getActionParent(item)
		let actionIndex = oldParent.actions.findIndex(x => x.id == item.id);

		if(!oldParent || !newParent || actionIndex == null)
			return;

		// move action to new group, and assign the order 
		// of the current highest element +10

		newParent.actions.sort(this.sortGroup);
		let highestIndex = newParent.actions[newParent.actions.length -1].order;
		newParent.actions.push(item);
		item.order = (highestIndex + 10);
		item.group = newParent.id;

		// Reorder the old parent by shifting down the order of
		// all elements beginning from the order of the moved item

		oldParent = oldParent.actions;
		oldParent.splice(actionIndex,1);
		if(oldParent.length == 0){
			// the last node was moved away, remove the parent
			// this.removeGroup(oldParent);
			return;
		}

		
		oldParent.sort(this.sortGroup);
		let newItemOrder = (actionIndex == 0 ? 10 : (oldParent[actionIndex-1].order) + 10);

		for (let index = actionIndex; index < oldParent.length; index++) {
			oldParent[index].order = (newItemOrder += 10);
		}
	},

	moveToIndex: function(item, index){
		// moves the item to the specified index of a group
		// shifting up the order of all elements after it

		let itemParent;
		if(item.type == "group"){
			itemParent = this.actionTree;
		} else{
			itemParent = this.getActionParent(item).actions;
		}

		itemParent.sort(this.sortGroup);

		let itemsBeforeIndex = itemParent.filter(x => x.order <= 30);
		let lastItemBeforeIndex = itemsBeforeIndex[itemsBeforeIndex.length -1];

		let firstItemIndex = itemParent.findIndex(x => x.order >= index);
		let currentItemIndex = itemParent.findIndex(x =>x.id == item.id);

		itemParent.splice(firstItemIndex, 0, itemParent.splice(currentItemIndex, 1)[0]);

		// Assign a new order value to each item to 
		// keep the order in sync with the array position

		let itemOrder = 0;
		for (let index = 0; index < itemParent.length; index++) {
			itemParent[index].order = (itemOrder += 10);
		}
	},

	getActionParent: function(action){
		return this.actionTree.filter(x => x.type == "group" && x.id == action.group)[0];
	},

	sortGroup: function(a,b) {
		return a.order-b.order;
	},

	removeGroup: function(group){
		if(group.actions.length > 0)
			return;

		let groupIndex = this.actionTree.findIndex(x => x.type == "group" && x.id == group.id);
		this.actionTree.splice(groupIndex, 1);

		let newGroupOrder = 0;
		for (let index = 0; index < this.actionTree.length; index++) {
			this.actionTree[index].order = (newGroupOrder += 10);
		}
	},

	cleanupGroups: function(){
		// removes all groups without action

		for (let index = this.actionTree.length-1; index >= 0 ; index--) {
			if(this.actionTree[index].actions.length == 0){
				this.removeGroup(this.actionTree[index]);
			}
		}
	},

	saveSettings: function(){
		// persists user settings

		app.setValue(this.addonName(), this.actionTree);
	},

	loadSettings: function(){
		// loads saved user settings

		let appSettings = app.getValue(this.addonName(), {});
		return appSettings;
	}

}