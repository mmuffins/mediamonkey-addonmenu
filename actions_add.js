// Add global section to register addon actions if it doesn't exist yet
if (typeof addons == "undefined") var addons = {}

window.actionCategories.addons = function(){
	return _('AddonsMenu');
}

addons.addonsMenuQueue = []

addons.addonsMenu = {
	menuOrder: 55,
	menuGrouporder: 10,
	menu: [],


	  registerCommands: function (actions) {
		// Adds the provided actions to the Addons Menu
		let _this = this

		return new Promise((resolve, reject) => {
			if(!actions instanceof Array) return resolve(false);

			actions.forEach(el => {
				if(!el.hasOwnProperty('action') ||  !el.action.hasOwnProperty('title') 
				|| !el.hasOwnProperty('order') || !el.hasOwnProperty('category')){
					console.warn('Item will not be added to the addons menu due to missing properties:')
					console.warn(el)
					return
				}

				let elementTitle = null;
				if(el.action.title instanceof Function){
					elementTitle = el.action.title();
				} else {
					elementTitle = el.action.title;
				}

				if(elementTitle == ''){
					console.warn('Title for the item below is undefined, it will not be added to the addons menu:')
					console.warn(el)
					return
				}
	
				if (typeof _this.menu.find(action => action.title ==  title && action.category == category) != "undefined") {
					// action already exists
					return
				} 
	
				let newItem = {action: el.action, order: el.order, category: el.category, title:()=> _(elementTitle), grouporder: 100}
	
				// console.log('loading action => ' + newItem)
				_this.menu.push(newItem)
	
			})
	
			return resolve(true)
		}).then(() => _this.pushToUi())
	  },

	pushToUi: function(){
		// pushes the internal menu to the ui

		let _this = this

		return new Promise(function (resolve, reject) {
			_this.sortMenu();
			let menuItems = []
	
			_this.menu.forEach(el => {
				if(!el.hasOwnProperty('action') || !el.hasOwnProperty('order') 
					|| !el.hasOwnProperty('grouporder') || !el.hasOwnProperty('category')){
					return
				}
				menuItems.push({action: el.action, order: el.order, grouporder : el.grouporder, category: el.category})
			})

			return resolve(menuItems)
		})
		.then(menuItems => {

			let newMenu = {
				action: {
					title: function () {
							return _('&Addons');
					},
					visible: !webApp,
					submenu: menuItems
				},
				order: _this.menuOrder,
				grouporder: _this.menuGrouporder,
			}
	
			for (let i = 0; i < window.mainMenuItems.length; i++) {
				const el = window.mainMenuItems[i].action;
				
				if(el.hasOwnProperty('title') && el.title instanceof Function && el.title() == '&Addons'){
					window.mainMenuItems[i] = newMenu
					return
				}
			}

			window.mainMenuItems.push(newMenu)
		})
	},

	getAction: function(title, category){
		// returns a reference to the action with the provided title and category
		return this.menu.find(action => action.title ===  title && action.category === category)		 
	},

	getCategories: function(){
		// returns an array with all categories in the menu
		return [...new Set(this.menu.map(x => x.category))]
	},

	sortMenu: function(){
		// sorts the menu by category

		// get list of all categories and add a sort value
		let cat = this.getCategories().sort()
		let catOrder = {}
		for (let index = 0; index < cat.length; index++) {
			catOrder[cat[index]] = (index + 1) * 100
		}

		// update each menu item with the sort index
		this.menu.forEach(el => {
			el.grouporder = catOrder[el.category]
		});
	},

	importMenuQueue: function(){
		// checks addons.addonsMenuQueue for new entries and adds them to the menu

		if (!addons.hasOwnProperty('addonsMenuQueue')) {
			addons.addonsMenuQueue = []
			return
		}

		this.registerCommands(addons.addonsMenuQueue)
		.then(addons.addonsMenuQueue = [])
	}
}

// addons.addonsMenu.importMenuQueue()


