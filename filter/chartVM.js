
import { ViewModel } from './../common/viewModel.js'
import { Model } from "./modelManager.js";
import { Config } from "./configManager.js"

export class ChartViewModel extends ViewModel {
    constructor(model, config){
        super("ChartViewModel", model);
        this.config = config;

        this.regModelEvent("SelectedIssues", ()=>{this.trigVMChangeEvent("SelectedIssues")})
        this.regModelEvent("FieldsVisibility", ()=>{this.trigVMChangeEvent("FieldsVisibility")})
        this.regModelEvent("ChartsVisibility", ()=>{this.trigVMChangeEvent("ChartsVisibility")})
    }

    /**
     * 获得所有选中状态的Issue中该field的值的统计情况
     * @param {string} field issue的字段名
     * @returns {json} {field的值 : 该值出现的次数}
     */
     getSelectedIssuesPropCount(field){
        return this.model.getSelectedIssuesPropCount(field);
    }

    setFilterSelectedOptions(key, value){
        this.model.setFilterSelectedOptions(key, value);
    }

    getCharts(){
        return this.config.getChartsDict();
    }

    getFieldsVisibility(){
        return this.config.getFieldsVisibility();
    }
}
