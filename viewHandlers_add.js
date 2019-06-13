requirejs('Scripts/ExtensionsMenu/extensionsMenu')

nodeHandlers.extensionsMenuTreeRoot = inheritNodeHandler('extensionsMenuTreeRoot', 'Base', {
    getChildren: function (node) {
        return new Promise(function (resolve, reject) {
            if(!node.datasource){
                resolve();
            }

            node.dataSource.forEach(function(itm){
                node.addChild(itm,'extensionsMenuNode')
            })
            resolve();
        });
    },
    checked: function(node){
        return new Promise(function (resolve, reject) {
            resolve(true);
        });
    }
});

nodeHandlers.extensionsMenuNode = inheritNodeHandler('extensionsMenuNode', 'Base', {
    hideCheckbox: function (node) {
        return node.type == 'group';
    },

    title: function (node) {
        var nodeTitle = node.dataSource.hasOwnProperty('title') ? node.dataSource.title : actions[node.dataSource.action].title();
        return window.uitools.getPureTitle(nodeTitle);
    },

    hasChildren: function(node){
        return (node.dataSource.hasOwnProperty('actions') && node.dataSource.actions.length > 0);
    },

    getChildren: function (node) {
        return new Promise(function (resolve, reject) {
            if(nodeHandlers[node.handlerID].hasChildren(node)){
                node.dataSource.actions.forEach(itm => {
                    node.addChild(itm,'extensionsMenuNode')
                });
            }
            resolve();
        });
    },

    canDrop: node => true,

    drop: function (dataSource, e, index) {
        let srcObject = dnd.getDragObject(e);
        let datatype = dnd.getDropDataType(e);
        
        if (srcObject && (datatype == 'extensionsMenuNode')) {
            if (srcObject.id == dataSource.id){
                // we cannot drop to itself
                return  
            }

            // the details of the datasource will change after it has been
            // moved, save the current details for later
            let ctrl = e.dataTransfer.getSourceControl();
            let targetParent;
            let srcObjectParent

            if(!(srcObject.type == 'group')){
                srcObjectParent = ctrl.controlClass.dataSource.root.findChild(`${datatype}:${srcObject.group}`);
                targetParent = e._dropNode.parent;

                if(dataSource.type == "group"){
                    // element was dropped on a group, use the target node as parent
                    targetParent = e._dropNode;
                } 

            }

            extensions.extensionsMenu.moveAction(srcObject,dataSource);
            ctrl.controlClass.dataSource.notifyChanged();


            // var newLocationNode = targetParent.findChild(`${datatype}:${srcObject.id}`);
            // newLocationNode = srcObject.show;

            nodeUtils.refreshNodeChildren(ctrl.controlClass.root);


            if(!(srcObject.type == "group")){
                nodeUtils.refreshNodeChildren(targetParent);

                if(targetParent.persistentID != srcObjectParent.persistentID){
                    // parent has changed, also update source node
                    nodeUtils.refreshNodeChildren(srcObjectParent);
                }
            }

            // var newLocationNode = targetParent.findChild(`${datatype}:${srcObject.id}`);
            // newLocationNode = srcObject.show;

        }
    },
    checked: function(node){
        return new Promise(function (resolve, reject) {
            resolve(true);
        });
    }

});