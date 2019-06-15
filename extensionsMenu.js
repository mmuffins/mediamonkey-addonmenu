"use strict";

// Add global section to register extension actions if it doesn't exist yet
extensions = extensions || {};
	
extensions.extensionsMenu = {
	actionTree: [],

	rootNode: {
		type: "root",
		id: "root",
		actions: this.actionTree
	},

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
				group: "root",
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

	getRootNode: function(){
		if(!this.rootNode.actions)
			this.rootNode.actions = this.getActionTree();
				
		return this.rootNode;
	},

	buildMainMenuArray: function(){
		// Creates menu that can be pushed to the main menu

		let menu = []
		let extTree = this.getActionTree();
		extTree.forEach(ext =>{
			// Unwrap each tree item and reorganize it to a structure
			// that can be understood by the main menu
			
			let actionList = ext.actions
				.filter(act => act.show == true)
				.map(act => {
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
		this.rootNode.actions = this.actionTree;
	},

	moveGroup: function(group, target){
		// moves the provided group to a new parent

		this.actionTree.sort(this.sortGroup);

		if(target.type == "action"){
			if(target.group == "root"){
				// move group behind target in root
				this.moveToIndex(group, target.order)
				return;
			}

			if(group.id != target.group){
				// group was dropped on an action in a different group
				// action is in a group, move the current group behind the parent of the target
				let targetIndex = this.getActionParent(target).order;
				this.moveToIndex(group, targetIndex)
			}
	
			// else group was dropped on action in same group, nothing to do here
		} else {
			if(target.type == "group"){
				this.moveToIndex(group, target.order);
			} else {
				// group was dropped on root, move the group to the last index
				this.moveToIndex(group, this.actionTree[this.actionTree.length -1].order);
			}
		}
	},

	moveAction: function(action, target){
		// moves the provided action to a new parent

		if(target.type == "action"){
			if(action.group == target.group){
				// action was dropped on action in same group, move action behind target
				this.moveToIndex(action, target.order);
			} else {
				// action was dropped on action in different group
				// move action behind target in the new group
				let targetParent = this.getActionParent(target)
				this.moveActionToGroup(action, targetParent)
				this.moveToIndex(action, target.order);
			}
		} else{
			if(action.group != target.id || target.id == "root"){
				// action was dropped on different group, move to last index of the group
				this.moveActionToGroup(action, target)
			} 
			// else action was dropped on same group, nothing to do here
		}
	},

	moveActionToGroup: function(item, target){
		// moves action to the last position of a group

		let oldParent = this.getActionParent(item)
		let actionIndex = oldParent.actions.findIndex(x => x.id == item.id);
		let newParent = (target.type == 'root' ? this.rootNode : this.actionTree.filter(x => x.id == target.id)[0]);

		if(!oldParent || !newParent || actionIndex == null)
			return;

		// move action to new group, and assign the order 
		// of the current highest element +10

		newParent.actions.sort(this.sortGroup);
		let highestOrder = 0;
		if(newParent.actions.length > 0)
			highestOrder = newParent.actions[newParent.actions.length - 1].order

		newParent.actions.push(item);
		item.group = newParent.id;
		item.order = highestOrder + 10

		// Reorder the old parent by shifting down the order of
		// all elements beginning from the order of the moved item

		oldParent = oldParent.actions;
		oldParent.splice(actionIndex,1);
		if(oldParent.length == 0){
			// the last node was moved away, remove the parent
			return;
		}
		
		oldParent.sort(this.sortGroup);
		let newItemOrder = (actionIndex == 0 ? 10 : (oldParent[actionIndex-1].order) + 10);

		for (let index = actionIndex; index < oldParent.length; index++) {
			oldParent[index].order = (newItemOrder += 10);
		}
	},

	moveToIndex: function(item, order){
		// moves the item to the specified index of a group
		// shifting up the order of all elements after it

		let itemParent = this.getActionParent(item).actions;
		itemParent.sort(this.sortGroup);
		let currentItemIndex = itemParent.findIndex(x =>x.id == item.id);
		
		let targetIndex = itemParent.length
		if(itemParent[targetIndex-1].order > order){
			targetIndex = itemParent.findIndex(x => x.order >= order);
		}

		itemParent.splice(targetIndex, 0, itemParent.splice(currentItemIndex, 1)[0]);

		// Assign a new order value to each item to 
		// keep the order in sync with the array position

		let itemOrder = 0;
		for (let index = 0; index < itemParent.length; index++) {
			itemParent[index].order = (itemOrder += 10);
		}
	},

	getActionParent: function(action){
		return (action.group == "root" ? this.rootNode : this.actionTree.filter(x => x.type == "group" && x.id == action.group)[0]);
	},

	sortGroup: function(a,b) {
		return a.order-b.order;
	},

	removeGroup: function(group){
		// removes a group from the action tree
		// if the group contains actions, they will be moved to the
		// root node

		if(group.type == "action")
			return;

		// if(group.actions.length > 0)
		// 	return;

		let groupIndex = this.actionTree.findIndex(x => x.type == "group" && x.id == group.id);
		if(group.actions.length > 0){
			group.actions.forEach(action => this.moveActionToGroup(action, this.rootNode));
		}

		this.actionTree.splice(groupIndex, 1);

		let newGroupOrder = 0;
		for (let index = 0; index < this.actionTree.length; index++) {
			this.actionTree[index].order = (newGroupOrder += 10);
		}
	},

	cleanupGroups: function(){
		// removes all groups without action

		for (let index = this.actionTree.length-1; index >= 0 ; index--) {
			const treeElement = this.actionTree[index];
			if(treeElement.type != "action" && treeElement.actions.length == 0){
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