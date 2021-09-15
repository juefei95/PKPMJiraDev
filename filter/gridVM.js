/**
 * gridView的ViewModel
 */

import { ViewModel }            from "./../common/viewModel.js"
import { Model }                from "./modelManager.js";
import { Issue }                from "./../model/issue.js";
import { JiraIssueWriter }      from './../model/jiraIssueWriter.js'
import { getIssueReadScheme }   from './../model/issueReadScheme.js'
import { showToastMessage }     from './../common/toolToastMessage.js'

export class GridViewModel extends ViewModel {
    
    static emptyText = "Empty Field"
    static invalidDate = "Empty Field"

    constructor(model, viewConfig) {
        super("GridViewModel");
        this.model = model;
        this.viewConfig = viewConfig;
        this.regModelEvent(this.model, "SelectedOptions", ()=>{this.trigVMChangeEvent("SelectedOptions")})
        this.regModelEvent(this.model, "IssueReget", ()=>{this.trigVMChangeEvent("IssueReget")})
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
        let gridDict = this.viewConfig.getGridsDict();
        let gridArr = [];
        let counter = 0;
        for (const [k, v] of Object.entries(gridDict)){
            counter += 1;
            let newV = v;
            newV["field"] = k;
            newV["dictIndex"] = counter;
            gridArr.push(newV);
        }
        // 排序
        let sortedGridArr = gridArr.sort((x,y) => {
            let xi = "index" in x ? x.index : x.dictIndex*100;
            let yi = "index" in y ? y.index : y.dictIndex*100;
            return xi-yi;
        })
        return sortedGridArr;
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

    saveColumnSetting(columnSetting){
        this.viewConfig.saveColumnSetting(columnSetting);
    }

    // 设置某个Issue的某个field为新值
    /**
     * 
     * @param {string} issueKey issue的key
     * @param {int} columnIndex 该field在grid的column中的index
     * @param {*} newVal 该field的新值
     * @return bool 是否发送任务去修改该Issue的该Field，但并不保证修改成功
     */
    setIssueFieldValue(issueKey, projName, issueType, field, newVal){
        let scheme = getIssueReadScheme(projName, issueType);
        let fieldInJira = scheme.getFieldNameInJira(field);
        let issue = this.model.getIssue(issueKey);
        if (!fieldInJira) {
            showToastMessage("无法获取该列对应的Jira字段，导致无法设置值");
            return false;
        }
        if (!issue){
            showToastMessage("没有找到该Issue，导致无法设置值");
            return false;
        }
        new JiraIssueWriter().setIssueDateField(issueKey, fieldInJira, newVal
            , ()=>{
                showToastMessage("修改成功");
                issue.setDateField(field, newVal);  // 修改成功则同步修改Model里的数据，就不再重新获取了
                this.trigVMChangeEvent("MergeGridChange");}
            , ()=>{
                showToastMessage("修改失败，已回退");
                this.trigVMChangeEvent("ClearGridChange");}
        );
        return true;
    }



}