/*
这里主要是管理数据
*/

import {Config}  from './configManager.js';
import {JQL}  from './jqlParser.js';
import {date2String} from './toolSet.js'
import {JiraIssueReader} from './jiraIssueReader.js'

export class Model{

    // 无效日期的定义
    static initStartDate = new Date('1999-01-01');
    static initEndDate = new Date('2999-01-01');


    constructor(issues, config, jql){
        this.issues = issues;
        this.config = config;
        this.jql = jql;
        this.filterOptions = {};
        this.filterSelectedOptions = {};
        
        this._genFilterOptions();
    }

    // 获取issues数组
    getIssues(){
        return this.issues;
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
                if (issue[k] && v.type == 'DropDown'){
                    this.filterOptions[k].add(issue[k]);
                }
            }
        }

    }
}