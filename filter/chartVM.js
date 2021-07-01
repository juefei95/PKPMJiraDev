
import { ViewModel } from './../common/viewModel.js'
import { Model } from "./modelManager.js";
import { ViewConfig } from "./viewConfig.js"

export class ChartViewModel extends ViewModel {
    constructor(model, viewConfig){
        super("ChartViewModel");
        this.model = model;
        this.viewConfig = viewConfig;

        this.regModelEvent(this.model, "SelectedIssues", ()=>{this.trigVMChangeEvent("SelectedIssues")})
        this.regModelEvent(this.viewConfig, "FieldsVisibility", ()=>{this.trigVMChangeEvent("FieldsVisibility")})
        this.regModelEvent(this.viewConfig, "ChartsVisibility", ()=>{this.trigVMChangeEvent("ChartsVisibility")})
    }

    /**
     * 获得所有选中状态的Issue中该field的值的统计情况
     * @param {string} field issue的字段名
     * @returns {json} {field的值 : 该值出现的次数}
     */
     getSelectedIssuesPropCount(field){
        let propCount = this.model.getSelectedIssuesPropCount(field);
        if (undefined in propCount) {
            propCount["Empty Field"] = propCount[undefined];
            delete propCount[undefined];
        }
        return propCount;
    }

    setFilterSelectedOptions(key, value){
        this.model.setFilterSelectedOptions(key, value.has("Empty Field")?new Set([undefined]):value);
    }

    getCharts(){
        return this.viewConfig.getChartsDict();
    }

    getFieldsVisibility(){
        return this.viewConfig.getFieldsVisibility();
    }
}
