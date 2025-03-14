
import { View } from "./../common/view.js";
import { GridControl } from "./gridControl.js"

export class GridPanel extends View{
    
    constructor(id, vm){
        super(vm);
        this.panelId = id;
        this.ids = {
            gridId : "gridId",
            gridName : 'jiraGrid',                       // w2ui grid的名字，用来后续引用
        };
        // 把各种控件Dom和实际的控件类关联起来
        this.grid = undefined;
        
        this.regVMEvent("Grid.SelectedOptions", this.updateView.bind(this));
        this.regVMEvent("Grid.IssueReget", this.resetRecords.bind(this));
        this.regVMEvent("Grid.FieldsVisibility", this.updateFieldsVisibility.bind(this));
        this.regVMEvent("Grid.MergeGridChange", this.mergeGridChange.bind(this));
        this.regVMEvent("Grid.ClearGridChange", this.clearGridChange.bind(this));
        
    }
    createHtml(){
        return '<div id="' + this.ids.gridId + '" style="width: 100%; height: 100%"></div>';
    }
    updateView(){
        this.grid.updateView();
    }

    resetRecords(){
        this.grid.resetRecords();
    }

    updateFieldsVisibility(){
        this.grid.setColumnVisibility();
    }
    // config控件
    configControls(){
        
        // 把各种控件Dom和实际的控件类关联起来
        this.grid = new GridControl(this.vm, this.ids.gridId, this.ids.gridName);
    }
    
    mergeGridChange(){
        this.grid.mergeChange();
    }

    clearGridChange(){
        this.grid.clearChange();
    }
}