requirejs('Scripts/AddonsMenu/addonsMenu')

nodeHandlers.addonsMenuTreeRoot = inheritNodeHandler('addonsMenuTreeRoot', 'Base', {
    getChildren: function (node) {
        return new Promise(function (resolve, reject) {
            if(!node.datasource){
                resolve();
            }

            node.dataSource.actions.forEach(itm => {
                if(itm.type == "group"){
                    node.addChild(itm,'addonsGroupNode')
                } else{
                    node.addChild(itm,'addonsMenuNode')
                }
            })
            resolve();
        });
    },

    drop: function (dataSource, e, index) {
        let srcObjectNode = dnd.getDragObject(e);
        
        // datatype of the element that was dropped
        let datatype = dnd.getDropDataType(e);
        
        if (srcObjectNode && (datatype == 'addonsGroupNode' || datatype == 'addonsMenuNode')) {

            // the details of the datasource will change after it has been
            // moved, save the current details for later
            let ctrl = e.dataTransfer.getSourceControl();
            let srcObjectParent;
            if(srcObjectNode.group == "root"){
                srcObjectParent =  ctrl.controlClass.dataSource.root;
            } else {
                srcObjectParent = ctrl.controlClass.dataSource.root.findChild(`addonsGroupNode:${srcObjectNode.group}`);
            }

            let targetParent = ctrl.controlClass.dataSource.root;

            if(datatype == 'addonsMenuNode'){
                addons.addonsMenu.moveAction(srcObjectNode,dataSource);
                ctrl.controlClass.dataSource.notifyChanged();
                if(targetParent.persistentID != srcObjectParent.persistentID){
                    // parent has changed, also update source node
                    nodeUtils.refreshNodeChildren(srcObjectParent);
                }
            } else {
                addons.addonsMenu.moveGroup(srcObjectNode,dataSource);
            }

            ctrl.controlClass.dataSource.notifyChanged();
            nodeUtils.refreshNodeChildren(ctrl.controlClass.root);
        }
    },
});

nodeHandlers.addonsGroupNode = inheritNodeHandler('addonsGroupNode', 'Base', {
    hideCheckbox: function (node) {
        return true;
    },

    title: function (node) {
        return node.dataSource.title;
    },

    hasChildren: function(node){
        return (node.dataSource.hasOwnProperty('actions') && node.dataSource.actions.length > 0);
    },

    getChildren: function (node) {
        return new Promise(function (resolve, reject) {
            if(nodeHandlers[node.handlerID].hasChildren(node)){
                node.dataSource.actions.forEach(itm => {
                    node.addChild(itm,'addonsMenuNode')
                });
            }
            resolve();
        });
    },

    canDrop: node => true,
    canEdit: node => true,
    canDelete: node => true,

    setTitle: function (node, newTitle) {
        node.dataSource.title = newTitle;
        nodeUtils.refreshNodeChildren(node.parent);
    },

    drop: function (dataSource, e, index) {
        let srcObjectNode = dnd.getDragObject(e);

        // datatype of the element that was dropped
        let datatype = dnd.getDropDataType(e);
        
        if (srcObjectNode && (datatype == 'addonsGroupNode' || datatype == 'addonsMenuNode')) {
            if (srcObjectNode.id == dataSource.id){
                // we cannot drop to itself
                return  
            }

            // the details of the datasource will change after it has been
            // moved, save the current details for later
            let ctrl = e.dataTransfer.getSourceControl();
            let srcObjectParent;
            if(srcObjectNode.group == "root"){
                srcObjectParent =  ctrl.controlClass.dataSource.root;
            } else {
                srcObjectParent = ctrl.controlClass.dataSource.root.findChild(`addonsGroupNode:${srcObjectNode.group}`);
            }

            let targetParent = e._dropNode.parent;
            if(datatype == "addonsMenuNode"){
                // if the dropped element was an action it will be moved
                // to the item it has been dropped on
                targetParent = e._dropNode;
            } 

            if(datatype == 'addonsMenuNode'){
                addons.addonsMenu.moveAction(srcObjectNode,dataSource);
            } else {
                addons.addonsMenu.moveGroup(srcObjectNode,dataSource);
            }

            ctrl.controlClass.dataSource.notifyChanged();
            nodeUtils.refreshNodeChildren(ctrl.controlClass.root);

            if(datatype == 'addonsMenuNode'){
                nodeUtils.refreshNodeChildren(targetParent);
    
                if(targetParent.persistentID != srcObjectParent.persistentID){
                    // parent has changed, also update source node
                    nodeUtils.refreshNodeChildren(srcObjectParent);
                }
            }
        }
    },

    deleteItems: function (node) {
        addons.addonsMenu.removeGroup(node.dataSource);
        nodeUtils.refreshNodeChildren(node.parent);
    },
    
});

nodeHandlers.addonsMenuNode = inheritNodeHandler('addonsMenuNode', 'Base', {
    hideCheckbox: function (node) {
        return false;
    },

    title: function (node) {
        // var nodeTitle = node.dataSource.hasOwnProperty('title') ? node.dataSource.title : actions[node.dataSource.action].title();
        return window.uitools.getPureTitle(actions[node.dataSource.action].title());
    },

    hasChildren: function(node){
        return (node.dataSource.hasOwnProperty('actions') && node.dataSource.actions.length > 0);
    },

    getChildren: function (node) {
        return new Promise(function (resolve, reject) {
            if(nodeHandlers[node.handlerID].hasChildren(node)){
                node.dataSource.actions.forEach(itm => {
                    node.addChild(itm,'addonsMenuNode')
                });
            }
            resolve();
        });
    },

    canDrop: node => true,
    canDelete: node => false,

    drop: function (dataSource, e, index) {
        let srcObjectNode = dnd.getDragObject(e);

        // datatype of the element that was dropped
        let datatype = dnd.getDropDataType(e);
        
        if (srcObjectNode && (datatype == 'addonsGroupNode' || datatype == 'addonsMenuNode')) {
            if (srcObjectNode.id == dataSource.id){
                // we cannot drop to itself
                return  
            }

            // the details of the datasource will change after it has been
            // moved, save the current details for later
            let ctrl = e.dataTransfer.getSourceControl();
            let srcObjectParent;
            if(srcObjectNode.group == "root"){
                srcObjectParent =  ctrl.controlClass.dataSource.root;
            } else {
                srcObjectParent = ctrl.controlClass.dataSource.root.findChild(`addonsGroupNode:${srcObjectNode.group}`);
            }

            let targetParent;
            if(dataSource.type == "action" ){
                targetParent = e._dropNode.parent;
            } else {
                    alert('how can this even happen?')
                // element was dropped on a group or root, use the target node as parent
                targetParent = e._dropNode;
            }

            if(datatype == 'addonsMenuNode'){
                addons.addonsMenu.moveAction(srcObjectNode,dataSource);
            } else {
                addons.addonsMenu.moveGroup(srcObjectNode,dataSource);
            }

            ctrl.controlClass.dataSource.notifyChanged();
            nodeUtils.refreshNodeChildren(ctrl.controlClass.root);

            if(datatype == 'addonsMenuNode'){
                nodeUtils.refreshNodeChildren(targetParent);
    
                if(targetParent.persistentID != srcObjectParent.persistentID){
                    // parent has changed, also update source node
                    nodeUtils.refreshNodeChildren(srcObjectParent);
                }
            }
        }
    },
});