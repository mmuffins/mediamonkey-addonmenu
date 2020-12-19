"use strict";

requirejs('viewHandlers.js');
requirejs("Scripts/AddonMenu/addonMenu")
requirejs("controls/addonTree")

window.configInfo = {
    load: function(panel, addon){
        let _this = this;
        // panel.innerHTML = window.loadFile(addon.configFile.replace('config.js','config.html'));
        let pnl = panel.firstElementChild;
        initializeControls(pnl);

        let UI = getAllUIElements(qid('pnlCollectionsRoot'));
        let TV = UI.lvTreeView;
        let ds = TV.controlClass.dataSource;

        addons.addonMenu.discardChanges();
        ds.root.handlerID = 'addonMenuTreeRoot';
        ds.root.dataSource = addons.addonMenu.getEditRootNode();
        TV.controlClass.expandAll()

        app.listen(TV, 'focuschange', function(e){
            _this.handleButtonsDisableState(e);
        });
        
        app.listen(UI.btnNewGroup, 'click', function () {
            let newGroupNode = addons.addonMenu.newGroup("New Group");
            nodeUtils.refreshNodeChildren(TV.controlClass.root);
            let newGroup = TV.controlClass.root.findChild(`addonGroupNode:${newGroupNode.id}`);

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
            addons.addonMenu.resetActionTree();
            let tree = app.createTree();
            tree.root.handlerID = 'addonMenuTreeRoot';
            tree.root.dataSource = addons.addonMenu.getEditRootNode();
            TV.controlClass.dataSource = tree;
            TV.controlClass.expandAll()
        });

        if(ds.root.dataSource.actions.length == 0){
            // No addons were found, disable actions
            UI.btnNewGroup.controlClass.disabled = true;
            UI.btnResetTree.controlClass.disabled = true;
            UI.btnDeleteGroup.controlClass.disabled = true;
            UI.btnRenameGroup.controlClass.disabled = true;
            UI.lblNoAddonsFound.style.display = "block";
            TV.hidden = true;
        }
    },

    save: function(panel, addon){
        addons.addonMenu.applyChanges()
        addons.addonMenu.saveSettings();
        addons.addonMenu.refresh();

        // the config menu runs in a separate context from the main window
        let mainAppWindow = app.dialogs.getMainWindow()._window;
        if(mainAppWindow.addons && mainAppWindow.addons.addonMenu){
            mainAppWindow.addons.addonMenu.refresh();
        }
    },

    handleButtonsDisableState: function(e){
        qid('btnDeleteGroup').controlClass.disabled = 'group' != e.target.controlClass.focusedNode.dataSource.type;
        qid('btnRenameGroup').controlClass.disabled = 'group' != e.target.controlClass.focusedNode.dataSource.type;
    }
}


