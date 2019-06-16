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
        
        app.listen(UI.btnReset, 'click', () => {
            extensions.extensionsMenu.resetActionTree();

            let tree = app.createTree();
            tree.root.handlerID = 'extensionsMenuTreeRoot';
            tree.root.dataSource = extensions.extensionsMenu.getEditRootNode();
            TV.controlClass.dataSource = tree;
            TV.controlClass.expandAll()
        });

        app.listen(editButtons.new, 'click', function () {
            let newGroupNode = extensions.extensionsMenu.newGroup("New Group");
            nodeUtils.refreshNodeChildren(TV.controlClass.root);
            let newGroup = TV.controlClass.root.findChild(`extensionsGroupNode:${newGroupNode.id}`);

            // focus node and enter edit node
            TV.controlClass.focusNode(newGroup);
            TV.controlClass.editStart()
        });

        app.listen(editButtons.edit, 'click', function () {
            TV.controlClass.editStart()
        });

        app.listen(UI.btnInputPluginAbout, 'click', function () {
            TV.controlClass.deleteSelected();
            // nodeUtils.refreshNodeChildren(TV.controlClass.root);
        });
    },

    save: function(panel, addon){
        extensions.extensionsMenu.applyChanges()
        extensions.extensionsMenu.discardChanges();
        extensions.extensionsMenu.saveSettings();
        extensions.extensionsMenu.refresh();
    },
}


