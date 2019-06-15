"use strict";

requirejs('viewHandlers.js');
requirejs("controls/listview");
requirejs("controls/gridview");
requirejs("Scripts/ExtensionsMenu/extensionsMenu")
requirejs("controls/extensionTree")



let UI = null;
let collectionList = null;
let treeItemsList = null;
let collections = null;

window.configInfo = {
    load: function(panel, addon){
        let _this = this;
        panel.innerHTML = window.loadFile(addon.configFile.replace('config.js','config.html'));
        let pnl = panel.firstElementChild;
        initializeControls(pnl);

        UI = getAllUIElements(qid('pnlCollectionsRoot'));
        let TV = UI.lvTreeView;
        let ds = TV.controlClass.dataSource;

        ds.root.handlerID = 'extensionsMenuTreeRoot';
        ds.root.dataSource = extensions.extensionsMenu.getRootNode();

        TV.controlClass.expandAll()
        
        app.listen(UI.btnInputPluginAbout, 'click', async () => await _this.getTreeItems());
        app.listen(UI.btnInputPluginConf, 'click', async () => await _this.saveHandler());
        app.listen(UI.btnReset, 'click', () => {
            extensions.extensionsMenu.resetActionTree();

            let tree = app.createTree();
            tree.root.handlerID = 'extensionsMenuTreeRoot';
            tree.root.dataSource = extensions.extensionsMenu.getRootNode();
            TV.controlClass.dataSource = tree;
            TV.controlClass.expandAll()
        });
    },

    save: function(panel, addon){
        alert('save')
        extensions.extensionsMenu.saveSettings();
        extensions.extensionsMenu.refresh();
    },


    saveHandler: async function(){
        alert('savehandler')

        let _this = this;
        let nodeTree = await _this.getTreeItems();
        let extensionTree = _this.convertToExtensionTree(nodeTree);
    },

    convertToExtensionTree: function(nodeTree){
        // converts a node tree to an extension tree

        let extensionTree = nodeTree.map(node => {
            let nodeChildren = node.children.map(child => {
                return {
                    id: child.id.replace(`${child.handlerID}:`,""),
                    action: child.id.replace(`${child.handlerID}:`,"").replace('actions.',''),
                    order: child.order,
                    show: child.checked,
                    // title: child.title
                }
            });

            return {
                id: node.id.replace(`${node.handlerID}:`,""),
                order: node.order,
                action: {
                    title: () => `_(&${node.title})`,
                    actions: nodeChildren
                }
            };
        })

        return extensionTree;
    },

    getTreeItems: async function(){
        // returns full tree of all items in the treeview

        const _this = this;
        const ds = UI.lvTreeView.controlClass.dataSource;

        let nodeTree = [];
        let order = 0;

        // workaround because ds.root.children is not iterable
        var childArr = [];
        ds.root.children.forEach(child => childArr.push(child));

        for (const child of childArr) {
            const childNode = await _this.getRecursiveChildren(child);
            childNode.order = (order += 10);
            nodeTree.push(childNode);
        }

        return nodeTree;
    },

    getRecursiveChildren: async function(node){
        // recursively traverses the children of the provided node and returns a full tree of them

        let _this = this;
        let resultNode = {
            id: node.persistentID,
            nodePath: node.nodePath,
            title: nodeHandlers[node.handlerID].title(node),
            globalIndex: node.globalIndex,
            deleted: node.deleted,
            checked: node.checked,
            hasChildren: false,
            children: [],
            handlerID: node.handlerID,
            dataSource: node.dataSource
        };

        await nodeUtils.loadChildren(node);
        
        if(node.children.count > 0){
            let order = 0;
            resultNode.hasChildren = true;

            // workaround because node.children is not iterable
            var childArr = [];
            node.children.forEach(child => childArr.push(child));

            for (const child of childArr) {
                const childNode = await _this.getRecursiveChildren(child);
                childNode.order = (order += 10);
                resultNode.children.push(childNode);
            }
        }

        return resultNode;
    },
    
    
     newCollection: function() {    
        var newItem = collections.getNewCollection();
        var dlg = uitools.openDialog('dlgCollectionOptions', {
            item: newItem,
            isNew: true,
            modal: true,
        });
        dlg.closed = function () {
            if (dlg.modalResult == 1) {
                collectionList.add(newItem);
                var newPos = treeItemsList.count + 1;
                var newTreeItem = {
                    new: true,
                    itemType: 'collection',
                    id: newItem.id,
                    name: newItem.name,
                    visible: 1,
                    pos: newPos,
                    newItem: newItem
                };
                newTreeItem.collection = newItem;
                treeItemsList.insert(treeItemsList.count - 1, newTreeItem);
                newItem.pos = newPos;
            }
        };
        app.listen(dlg, 'closed', dlg.closed);
    }
}


