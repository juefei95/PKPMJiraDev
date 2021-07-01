/**
 * gridView的ViewModel
 */

import { ViewModel } from "./../common/viewModel.js"
import { Model } from "./modelManager.js";
import { Issue } from "./../model/issue.js";


export class GridViewModel extends ViewModel {
    
    static emptyText = "Empty Field"
    static invalidDate = "Empty Field"

    constructor(model, viewConfig) {
        super("GridViewModel");
        this.model = model;
        this.viewConfig = viewConfig;

        this.regModelEvent(this.model, "SelectedOptions", ()=>{this.trigVMChangeEvent("SelectedOptions")})
        this.regModelEvent(this.viewConfig, "FieldsVisibility", ()=>{this.trigVMChangeEvent("FieldsVisibility")})
    }

    /**
    * 获取所有Filter的json数据描述
    * @returns {json} filters
    */
    getFilters() {
        return this.viewConfig.getFiltersDict();
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
        let selOptions = this.model.getFilterSelectedOptions(key);
        if(selOptions instanceof Array){
            if(selOptions.length != 2) return undefined;
            let selOptions2 = selOptions.map((x) => x);     // 深拷贝一份，免得修改了model的数据
            if (selOptions2[0] === undefined) selOptions2[0] = Model.initStartDate;
            if (selOptions2[1] === undefined) selOptions2[1] = Model.initEndDate;
            return selOptions2;
        }else if(selOptions instanceof Set){
            let selOptionsCopy = Array.from(selOptions);
            let selOptionsCopy2 = selOptionsCopy.map(x => x===undefined?"Empty Field":x)
            return new Set(selOptionsCopy2);
        }else{
            return selOptions;
        }
    }

    /**
    * 获取Filter的可见性
    * @returns {json} filterVis {key : {visible : true/false}}
    */
    getFieldsVisibility() {
        return this.viewConfig.getFieldsVisibility()
    }

    /**
     * 获取Grid的各列的定义
     * @returns {json} 对于grid各列情况的描述
     */
    getGrids() {
        return this.viewConfig.getGridsDict();
    }

    getRecords(){
        let issueValidFields = Issue.getValidFields();
        let records = this.model.getRawIssues();
        for (const r of records) {
            r["recid"] = r.jiraId;
            for (const field of issueValidFields) {
                r[field] = r[field] === undefined ? "Empty Field" : r[field];
            }
        }
        return records;
    }

    setSelectedRecords(ids){
        this.model.setSelectedRecords(ids);
    }
}