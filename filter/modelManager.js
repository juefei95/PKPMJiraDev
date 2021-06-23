/*
这里主要是管理数据
*/

import {Config}  from './configManager.js';
import {JQL}  from '../model/jqlParser.js';
import {JiraIssueReader} from '../model/jiraIssueReader.js'
import {Issue} from './../model/issue.js'
import {AbstractModel} from './../common/model.js'

export class Model extends AbstractModel{

    // 无效日期的定义
    static initStartDate = new Date('1999-01-01');
    static initEndDate = new Date('2999-01-01');


    constructor(issues, config, jql){
        super("FilterModel");
        this.issues = issues;
        this.config = config;
        this.jql = jql;
        this.filterOptions = {};
        this.filterSelectedOptions = {};
        this.chartVis = {};
        this.selectedIssueId = new Set();
        this._genFilterOptions();
    }


    // 获取issues数组
    getRawIssues(){
        let issues = [];
        for (const iss of this.issues) {
            issues.push(iss.getRawIssue());
        }
        return issues;
    }

    /**
     * 获取某个issue属性的所有可能值
     * @property {string} propName
     * @returns {Set<string>} options
     */
    getIssuesPropSet(propName){
        let options = new Set();
        for (const issue of this.issues) {
            let v = issue.getAttr(propName);
            if (v) options.add(v);
        }
        return options;
    }

    /**
     * 获取所有选中的issue的某个属性的所有值的统计情况
     * @property {string} propName
     * @returns {json} {field的值 : 该值出现的次数}
     */
    getSelectedIssuesPropCount(propName){
        let propCount = {};
        for (const issue of this.issues) {
            if (this.selectedIssueId.has(issue.getJiraId())) {
                let v = issue.getAttr(propName);
                if (v) propCount[v] ? propCount[v]+=1 : propCount[v]=1;
            }
        }
        return propCount;
    }


    // 获取某Filter的Option选项
    getFilterOptions(key){
        if (key in this.filterOptions) {
            return this.filterOptions[key];
        }
        return undefined;
    }

    getFilterSelectedOptions(key){
        
        if (key in this.filterSelectedOptions) {
            return this.filterSelectedOptions[key];
        }
        return undefined;
    }

    getAllFilterSelectedOptions(){
        return this.filterOptions;
    }

    // 更新DropDown类型的Filter的当前被选中项
    // Param:
    //     key(string) - Filter的类型，或者说名称，比如categpry，status
    //     selected(set) - Filter被选中的项
    setFilterSelectedOptions(key, selected){

        // DropDown的选中项
        if (selected instanceof Set && this.filterSelectedOptions[key] instanceof Set){
            this.filterSelectedOptions[key].clear();
            for (const v of selected){
                if (this.filterOptions[key].has(v)) {
                    this.filterSelectedOptions[key].add(v);
                }
            }
        // Text的选中项
        }else if( typeof selected === 'string' && typeof this.filterSelectedOptions[key] === 'string'){
            this.filterSelectedOptions[key] = selected;
        // DateRange的选中项    
        }else if(selected instanceof Array && this.filterSelectedOptions[key] instanceof Array){
            this.filterSelectedOptions[key] = selected;
        }

        // 发送消息，选中项变了
        this.trigModelChangeEvent("SelectedOptions");
    }

    clearFilterSelectedOptions(){
        for (const key of Object.keys(this.config.getFiltersDict())){
            // DropDown的选中项
            if (this.filterSelectedOptions[key] instanceof Set){
                this.filterSelectedOptions[key].clear();
            // Text的选中项
            }else if(typeof this.filterSelectedOptions[key] === 'string'){
                this.filterSelectedOptions[key] = '';
            // DateRange的选中项    
            }else if(this.filterSelectedOptions[key] instanceof Array){
                this.filterSelectedOptions[key] = [Model.initStartDate, Model.initEndDate];
            }
        }
        // 发送消息，选中项变了
        this.trigModelChangeEvent("SelectedOptions");
    }



    // 根据筛选条件生成新的JQL
    genJQLWithSelection(){
        let validSelection = {};
        let reader = new JiraIssueReader();
        for (const key of Object.keys(this.config.getFiltersDict())){
            // DropDown的选中项
            if (this.filterSelectedOptions[key] instanceof Set && this.filterSelectedOptions[key].size !== 0){
                let jqlName = reader.getJQLName(this.config.getFieldPath(key));
                let jqlValues = new Set();
                for (const v of this.filterSelectedOptions[key]) {
                    jqlValues.add(this.config.getFieldJQLValue(key, v));
                }
                validSelection[jqlName] = jqlValues;
            // Text的选中项
            }else if(typeof this.filterSelectedOptions[key] === 'string' && this.filterSelectedOptions[key] !== ""){
                let jqlName = reader.getJQLName(this.config.getFieldPath(key));
                validSelection[jqlName] = this.filterSelectedOptions[key];
            // DateRange的选中项    
            }else if(this.filterSelectedOptions[key] instanceof Array && this.filterSelectedOptions[key][0]!==Model.initStartDate &&  this.filterSelectedOptions[key][0]!==Model.initEndDate){
                let jqlName = reader.getJQLName(this.config.getFieldPath(key));
                validSelection[jqlName] = this.filterSelectedOptions[key];
            }
        }
        return this.jql.genNewJQL(validSelection);
    }
    
    // 根据数据生成Filter字段的选项
    _genFilterOptions(){

        for (const [k,v] of Object.entries(this.config.getFiltersDict())){
            if (v.type == 'DropDown'){
                this.filterOptions[k]                   = new Set();
                this.filterSelectedOptions[k]           = new Set();
            }else if(v.type == 'Text'){
                this.filterSelectedOptions[k]           = "";
            }else if(v.type == 'DateRange'){
                //this.filterSelectedOptions[k]           = [date2String(Model.initStartDate), date2String(Model.initEndDate)];
                this.filterSelectedOptions[k]           = [Model.initStartDate, Model.initEndDate];
            }
        }

        for (const issue of this.issues) {
            for (const [k,v] of Object.entries(this.config.getFiltersDict())){
                let attr = issue.getAttr(k);
                if (attr && v.type == 'DropDown'){
                    this.filterOptions[k].add(attr);
                }
            }
        }

    }

    /**
     * 设置被筛选出的条目
     * @param {Array<string>} ids   筛选出的条目的jiraId
     */
    setSelectedRecords(ids){

        // 定义个辅助函数，检查Set是不是内容一样
        let eqSet = (as, bs) => {
            if (as.size !== bs.size) return false;
            for (let a of as) if (!bs.has(a)) return false;
            return true;
        }
        if (eqSet(new Set(ids), this.selectedIssueId) === false) {
            this.selectedIssueId = new Set(ids);
            // 发送消息，选中项变了
            this.trigModelChangeEvent("SelectedIssues");
        }
    }

    setFieldsVisibility(fieldsVis){
        this.config.setFieldsVisibility(fieldsVis);
        // 发送消息，选中项变了
        this.trigModelChangeEvent("FieldsVisibility");
    }

    setChartVisibility(key, visible){
        this.config.setChartVisibility(key, visible);
        // 发送消息，选中项变了
        this.trigModelChangeEvent("ChartsVisibility");
    }

}