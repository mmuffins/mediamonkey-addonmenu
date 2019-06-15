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
        extensions.extensionsMenu.saveSettings();
        extensions.extensionsMenu.refresh();
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


