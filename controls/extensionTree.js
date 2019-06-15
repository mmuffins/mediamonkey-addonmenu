/**
@module UI snippets
*/

requirejs('controls/checkboxTree');

/**
@class ExtensionTree
@constructor
@extends CheckboxTree
*/

inheritClass('ExtensionTree', CheckboxTree, {
    _onExpanded: function (e) {
        var node = e.detail.currentNode;
        if (this.dataSource.keepChildrenWhenCollapsed && node.expandCount > 1)
            return;

        let childCheckedCount = 0;
        if ((node.checked) && ((resolveToValue(nodeHandlers[node.handlerID].checkboxRule) != 'parent_independent') || node.modified))
            node.children.setAllChecked(true);
        else{

            node.children.forEach(child =>{
                child.checked = child.dataSource.show;
                childCheckedCount++;
            })

            if(childCheckedCount == 0){
                node.checked = false;
            }
            else{
                if(childCheckedCount == node.children.count){
                    node.checked = true
                }
            }
        }
    },

    // runFuncOnHittest: function (e) {
    //     // console.log(window.dnd.getFocusedItemHandler.call(this, e))
    //     // console.log(this.getItemFromRelativePosition.call(this,offsetX, offsetY))
    //     // console.log(dnd.getDropDataType(e))
    //     console.log(this.findDNDHandler(e));
    //     return window.dnd.getFocusedItemHandler.call(this, e);
    // },

    // canDrop: function (e) {
    //     // return TreeView.prototype.runFuncOnHittest.call(this,e);
        
    //     return this.runFuncOnHittest(e) ? true : true;
    // },


    drop: function (e) {

        if (this._lastDropNodeResult /* this property is from window.dnd.getFocusedItemHandler */ ) {
            let handler = nodeHandlers[this._dropNode.handlerID];
            if (handler && handler.drop) {
                e._dropNode = this._dropNode;
                handler.drop(this._dropNode.dataSource, e);
            }
        }

        if(e.path[0].classList[0] == "lvViewport"){
            // object was dropped inside the treeview element but not on a node
            // move the element to the top level
            let handler = nodeHandlers['extensionsMenuTreeRoot'];
            if (handler && handler.drop) {
                e._dropNode = this.dataSource.root;
                handler.drop(this.dataSource.root.dataSource, e);
            }
        }

        let srcObjectNode = dnd.getDragObject(e);
        let datatype = dnd.getDropDataType(e);

        if(srcObjectNode.type == 'action'){
            // Nodes tend to forget their checked status when they are moved between
            // parents, set their status again
            let ctrl = e.dataTransfer.getSourceControl();

            let parentType = srcObjectNode.group.split(".")[0]
            let targetParent = this.dataSource.root;

            if(parentType == "groups"){
                targetParent = ctrl.controlClass.dataSource.root.findChild(`extensionsGroupNode:${srcObjectNode.group}`);
            }
    
            let srcObject = targetParent.findChild(`${datatype}:${srcObjectNode.id}`);
            srcObject.checked = srcObjectNode.show;
        }

        this.cancelDrop();
    },
}, {
});
