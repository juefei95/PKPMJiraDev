/**
 * gridView的ViewModel
 */

import { ViewModel } from "./../common/viewModel.js"


export class GridViewModel extends ViewModel {
    constructor(model, config) {
        super("GridViewModel", model);
        this.config = config;

        this.regModelEvent("SelectedOptions", ()=>{this.trigVMChangeEvent("SelectedOptions")})
        this.regModelEvent("FieldsVisibility", ()=>{this.trigVMChangeEvent("FieldsVisibility")})
    }

    /**
    * 获取所有Filter的json数据描述
    * @returns {json} filters
    */
    getFilters() {
        return this.config.getFiltersDict();
    }

    /**
     * 根据Filter的key，返回给他应该选中的选项
     * 如果是DropDown，则返回Set<string>
     * 如果是FreeText，则返回string
     * 如果是DateRange，则返回Array[from, to]
     * @param {string} key 
     * @returns {*} selectedOptions
     */
    getFilterSelectedOptions(key) {
        return this.model.getFilterSelectedOptions(key);
    }

    /**
    * 获取Filter的可见性
    * @returns {json} filterVis {key : {visible : true/false}}
    */
    getFieldsVisibility() {
        return this.config.getFieldsVisibility()
    }

    /**
     * 获取Grid的各列的定义
     * @returns {json} 对于grid各列情况的描述
     */
    getGrids() {
        return this.config.getGridsDict();
    }

    getRecords(){
        let records = this.model.getRawIssues();
        for (const r of records) {
            r["recid"] = r.jiraId;
        }
        return records;
    }

    setSelectedRecords(ids){
        this.model.setSelectedRecords(ids);
    }
}