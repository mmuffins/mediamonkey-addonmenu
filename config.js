"use strict";

requirejs('viewHandlers.js');
requirejs("Scripts/AddonsMenu/addonsMenu")
requirejs("controls/addonTree")

window.configInfo = {
    load: function(panel, addon){
        let _this = this;
        panel.innerHTML = window.loadFile(addon.configFile.replace('config.js','config.html'));
        // let pnl = panel.firstElementChild;
        let pnl = panel.children[1];
        initializeControls(pnl);

        let UI = getAllUIElements(qid('pnlCollectionsRoot'));
        let TV = UI.lvTreeView;
        let ds = TV.controlClass.dataSource;

        addons.addonsMenu.discardChanges();
        ds.root.handlerID = 'addonsMenuTreeRoot';
        ds.root.dataSource = addons.addonsMenu.getEditRootNode();
        
        TV.controlClass.expandAll()
        
        app.listen(UI.btnNewGroup, 'click', function () {
            let newGroupNode = addons.addonsMenu.newGroup("New Group");
            nodeUtils.refreshNodeChildren(TV.controlClass.root);
            let newGroup = TV.controlClass.root.findChild(`addonsGroupNode:${newGroupNode.id}`);

            // focus node and enter edit node
            TV.controlClass.focusNode(newGroup);
            TV.controlClass.editStart()
        });

        app.listen(UI.btnDeleteGroup, 'click', function () {
            TV.controlClass.deleteSelected();
        });

        app.listen(UI.btnRenameGroup, 'click', function () {
            TV.controlClass.editStart()
        });

        app.listen(UI.btnResetTree, 'click', () => {
            addons.addonsMenu.resetActionTree();
            let tree = app.createTree();
            tree.root.handlerID = 'addonsMenuTreeRoot';
            tree.root.dataSource = addons.addonsMenu.getEditRootNode();
            TV.controlClass.dataSource = tree;
            TV.controlClass.expandAll()
        });
    },

    save: function(panel, addon){
        addons.addonsMenu.applyChanges()
        addons.addonsMenu.saveSettings();
        addons.addonsMenu.refresh();

        // the config menu runs in a separate context from the main window
        let mainAppWindow = app.dialogs.getMainWindow()._window;
        mainAppWindow.addons.addonsMenu.refresh();
    },
}


