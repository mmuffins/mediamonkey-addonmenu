"use strict";

// Add global section to register extension actions if it doesn't exist yet
extensions = extensions || {};
	
extensions.extensionsMenu = {

	rootNode: {
		type: "root",
		id: "root",
		actions: []
	},

	editNode: {
		type: "root",
		id: "root",
		actions: []
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

	getExtensionActions: function(){
		// returns a list of all actions with an extension property

		return Object.keys(actions)
			.filter((key) => actions[key].hasOwnProperty("extension") 
				&& actions[key].extension instanceof Function
				&& (actions[key].extension()))
			.map(function(key){return {key:key,action:actions[key]}})
	},

	getValidActions: function(){
		// returns a list of all extension actions with valid properties

		let allActions = this.getExtensionActions();

		let validActions = allActions.filter(ext => {
			return (ext.action.hasOwnProperty('execute') 
			&& ext.action.hasOwnProperty('title')
			&& ext.action.title instanceof Function
			&& (ext.action.title())
			);
		})
		
		return validActions;
	},

	getExtensionList: function(actionObjects){
		// Returns the grouped extension list of all loaded actions

		return [...new Set(actionObjects.map(act => act.action.extension()))]
	},

	groupActions: function(actionObjects){
		// returns an array of all valid actions grouped by their extension;

		let groupedActions = [];
		let extensionList = this.getExtensionList(actionObjects);

		// expand valid actions to full object to be able to group them
		// let actionFunctions = Object.keys(actions)
		// 	.filter(key => validActions.includes(key))
		// 	.map(function(key){return {key:key,action:actions[key]}})
		
		// get the actions for each extension and group them
		extensionList.forEach(ext =>{
			let filteredActions = actionObjects
				.filter(act => act.action.extension() == ext)
				.map(act => act.key)

			groupedActions.push({
				extension: ext,
				actions: filteredActions
			});
		});

		return groupedActions;
	},

	buildNodeTree: function(actionObjects){
		// builds a node tree from a list of actions

		let groupedActions = this.groupActions(actionObjects);
		groupedActions.sort();

		let nodeTree = [];

		let extSortOrder = 0;
		groupedActions.forEach(ext =>{

			// map each action with its order within the extension and an unique ID
			let actionSortOrder = 0;
			let newGroup = this.newGroup(ext.extension, [], (extSortOrder += 10))

			let extActions = ext.actions.map(act => {
				return {
					action: act,
					id: `actions.${act}`,
					type: "action",
					group: newGroup.id,
					order: (actionSortOrder += 10),
					show: true
				}
			});

			newGroup.actions = extActions;
			nodeTree.push(newGroup);
		})
		return nodeTree;
	},

	buildActionTree: function(){
		// Creates an extension tree from the currently loaded actions

		let validActions = this.getValidActions();
		return this.buildNodeTree(validActions);

	},

	buildUserActionTree: function(){
		// Creates an extension tree from the currently loaded actions
		// and applies user settings to it

		let validActions = this.getValidActions();
		let userSettings = this.loadSettings();
		userSettings.sort(this.sortGroup);

		// only include extension actions if they have not been saved before
		let validActionsKeys = validActions.map(itm => itm.key);
		let userSettingsKeys = userSettings
			.filter(itm => itm.type == 'action')
			.map(itm => itm.action);

		validActionsKeys = validActionsKeys.filter(itm => !userSettingsKeys.includes(itm))
		let extActions = validActions.filter(itm => validActionsKeys.includes(itm.key))

		// create node tree from the filtered actions
		let actionNodes = this.buildNodeTree(extActions);

		// build node tree from loaded user settings
		let userActions = userSettings.filter(itm => itm.type == 'action');
		let userGroups = userSettings.filter(itm => itm.type == 'group');

		let actionTree = []
		userGroups.forEach(grp => {
			let grpActions = userActions.filter(act => act.group == grp.id);
			// grp.order = (groupOrder += 10);
			grp.actions = grpActions;
			actionTree.push(grp);
		});

		let rootActions = userActions.filter(act => act.group == 'root');
		rootActions.forEach(act =>{
			actionTree.push(act);
		})

		actionTree.sort(this.sortGroup);

		// add all new actions to the bottom of the list
		let groupOrder = actionTree[actionTree.length -1].order;

		actionNodes.forEach(node => {
			node.order = (groupOrder += 10);
			actionTree.push(node);
		})

		return actionTree;
	},

	getRootNode: function(){
		// returns the main extension menu root node
		if(this.rootNode.actions.length == 0)
			this.rootNode.actions = this.buildUserActionTree();
				
		return this.rootNode;
	},

	getEditRootNode: function(){
		// returns a temporary extension menu root node
		if(this.editNode.actions.length == 0)
			this.editNode.actions = this.buildUserActionTree();
		
		return this.editNode;
	},

	applyChanges: function(){
		// applies all changes from the edit root node
		// to the main root node

		this.rootNode.actions = this.editNode.actions;
		this.discardChanges();
	},

	buildMainMenuArray: function(){
		// Creates menu that can be pushed to the main menu

		let menu = []
		let extTree = this.getRootNode().actions;
		let groups = extTree.filter(itm => itm.type == "group");

		groups.forEach(ext =>{
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

		let rootActions = extTree
			.filter(itm => itm.type == "action" && itm.group == "root");

		rootActions.forEach(ext =>{
			menu.push({
				grouporder: 10,
				order: ext.order,
				action: actions[ext.action]
			});
		});

		return menu;
	},

	resetActionTree: function(){
		// discards all user settings and rebuilds the action tree
		this.rootNode.actions = this.buildActionTree();
		this.editNode.actions = this.buildActionTree();
	},	
	
	discardChanges: function(){
		// discards all changes in the edit root node
		this.editNode.actions = this.buildUserActionTree();
	},

	moveGroup: function(group, target){
		// moves the provided group to a new parent

		
		this.editNode.actions.sort(this.sortGroup);

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
				this.moveToIndex(group, this.editNode.actions[this.editNode.actions.length -1].order);
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
		this.cleanupGroups();
	},

	moveActionToGroup: function(item, target){
		// moves action to the last position of a group

		let oldParent = this.getActionParent(item)
		let actionIndex = oldParent.actions.findIndex(x => x.id == item.id);
		let newParent = (target.type == 'root' ? this.editNode : this.editNode.actions.filter(x => x.id == target.id)[0]);

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
		return (action.group == "root" ? this.editNode : this.editNode.actions.filter(x => x.type == "group" && x.id == action.group)[0]);
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

		let groupIndex = this.editNode.actions.findIndex(x => x.type == "group" && x.id == group.id);
		if(group.actions.length > 0){
			group.actions.forEach(action => this.moveActionToGroup(action, this.editNode.actions));
		}

		this.editNode.actions.splice(groupIndex, 1);

		let newGroupOrder = 0;
		for (let index = 0; index < this.editNode.actions.length; index++) {
			this.editNode.actions[index].order = (newGroupOrder += 10);
		}
	},

	cleanupGroups: function(){
		// removes all groups without action

		for (let index = this.editNode.actions.length-1; index >= 0 ; index--) {
			const treeElement = this.editNode.actions[index];
			if(treeElement.type != "action" && treeElement.actions.length == 0){
				this.removeGroup(this.editNode.actions[index]);
			}
		}
	},

	newGroup: function(title, actionList, sortOrder){
		// adds a new group edit root node and returns a reference to the group

		if(!sortOrder){
			sortOrder = 10;

			if(this.editNode.actions.length > 0)
				sortOrder = this.editNode.actions[this.editNode.actions.length -1].order;
		}

		if(!title)
			title = "";

		if(!actionList)
			actionList = [];

		let randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

		let newGroup = {
			id: `groups.${randomString}`,
			order: sortOrder,
			title: title,
			group: "root",
			type: "group",
			actions: actionList
		}

		this.editNode.actions.push(newGroup)
		return newGroup;
	},

	setTitle: function(item, newTitle){
		// changes the display title of an element
		let actionTree = this.getEditRootNode().actions;
		actionTree[0].title = "eeee";
	},

	saveSettings: function(){
		// persists user settings		

		// flatten the array to save all actions and groups as
		// list for easier comparison when loading them later
		
		let saveArr = this.rootNode.actions
			.filter(itm => itm.type == 'group')
			.map(itm => itm = itm.actions)
			.flat();

		let rootActions = this.rootNode.actions
			.filter(itm => itm.type == 'action');

		// also append the empty groups to preserve their names and order

		let rootGroups = this.rootNode.actions
			.filter(itm => itm.type == 'group')
			.map(itm => {
				return {
					id: itm.id,
					group: itm.group,
					order: itm.order,
					title: itm.title,
					type: itm.type
				}
			})

		saveArr.push(...rootActions);
		saveArr.push(...rootGroups);
			
		app.setValue(this.addonName(), saveArr);
	},

	loadSettings: function(){
		// loads saved user settings

		return app.getValue(this.addonName(), []);
	}

}