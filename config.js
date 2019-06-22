"use strict";

requirejs('viewHandlers.js');
requirejs("Scripts/ExtensionsMenu/extensionsMenu")
requirejs("controls/extensionTree")

window.configInfo = {
    load: function(panel, addon){
        let _this = this;
        panel.innerHTML = window.loadFile(addon.configFile.replace('config.js','config.html'));
        let pnl = panel.firstElementChild;
        initializeControls(pnl);

        let UI = getAllUIElements(qid('pnlCollectionsRoot'));
        let TV = UI.lvTreeView;
        let ds = TV.controlClass.dataSource;

        extensions.extensionsMenu.discardChanges();
        ds.root.handlerID = 'extensionsMenuTreeRoot';
        ds.root.dataSource = extensions.extensionsMenu.getEditRootNode();

        TV.controlClass.expandAll()
        
        app.listen(UI.btnNewGroup, 'click', function () {
            let newGroupNode = extensions.extensionsMenu.newGroup("New Group");
            nodeUtils.refreshNodeChildren(TV.controlClass.root);
            let newGroup = TV.controlClass.root.findChild(`extensionsGroupNode:${newGroupNode.id}`);

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
            extensions.extensionsMenu.resetActionTree();
            let tree = app.createTree();
            tree.root.handlerID = 'extensionsMenuTreeRoot';
            tree.root.dataSource = extensions.extensionsMenu.getEditRootNode();
            TV.controlClass.dataSource = tree;
            TV.controlClass.expandAll()
        });
    },

    save: function(panel, addon){
        extensions.extensionsMenu.applyChanges()
        extensions.extensionsMenu.saveSettings();
        extensions.extensionsMenu.refresh();

        // the config menu runs in a separate context from the main window
        let mainAppWindow = app.dialogs.getMainWindow()._window;
        mainAppWindow.extensions.extensionsMenu.refresh();
    },
}


