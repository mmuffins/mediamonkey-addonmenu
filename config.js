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

        var editButtons = qid('lvEditButtons').controlClass.buttons;
        setVisibility(editButtons.up, false);
        setVisibility(editButtons.down, false);
        setVisibility(editButtons.new, true);
        setVisibility(editButtons.edit, true);
        setVisibility(editButtons.delete, true);
    
        let TV = UI.lvTreeView;
        let ds = TV.controlClass.dataSource;

        extensions.extensionsMenu.discardChanges();
        ds.root.handlerID = 'extensionsMenuTreeRoot';
        ds.root.dataSource = extensions.extensionsMenu.getEditRootNode();

        TV.controlClass.expandAll()
        
        app.listen(UI.btnInputPluginAbout, 'click', async () => await _this.getTreeItems());
        app.listen(UI.btnReset, 'click', () => {
            extensions.extensionsMenu.resetActionTree();

            let tree = app.createTree();
            tree.root.handlerID = 'extensionsMenuTreeRoot';
            tree.root.dataSource = extensions.extensionsMenu.getEditRootNode();
            TV.controlClass.dataSource = tree;
            TV.controlClass.expandAll()
        });

        app.listen(editButtons.new, 'click', function () {
            extensions.extensionsMenu.addGroup();
            nodeUtils.refreshNodeChildren(TV.controlClass.root);
        });

        app.listen(editButtons.edit, 'click', function () {
            extensions.extensionsMenu.setTitle();
            nodeUtils.refreshNodeChildren(TV.controlClass.root);
        });

    },

    save: function(panel, addon){
        extensions.extensionsMenu.applyChanges()
        extensions.extensionsMenu.discardChanges();
        extensions.extensionsMenu.saveSettings();
        extensions.extensionsMenu.refresh();
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


