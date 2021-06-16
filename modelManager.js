/*
这里主要是管理数据
*/

import {Config}  from './configManager.js';
import {date2String} from './toolSet.js'

export class Model{

    // 无效日期的定义
    static initStartDate = new Date('1999-01-01');
    static initEndDate = new Date('2999-01-01');


    constructor(issues, config){
        this.issues = issues;
        this.config = config;
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