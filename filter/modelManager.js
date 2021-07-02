/*
这里主要是管理数据
*/

import {ViewConfig}  from './viewConfig.js';
import {JQL}  from '../model/jqlParser.js';
import {JiraIssueReader} from '../model/jiraIssueReader.js'
import {getIssueReadScheme} from '../model/issueReadScheme.js'
import {Issue} from './../model/issue.js'
import {AbstractModel} from './../common/model.js'

export class Model extends AbstractModel{

    // 无效日期的定义
    static initStartDate = new Date('1999-01-01');
    static initEndDate = new Date('2999-01-01');


    constructor(issues, viewConfig, jql){
        super("FilterModel");
        this.issues = issues;
        this.issuesAllReadScheme = undefined;
        this.viewConfig = viewConfig;
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

    // 获取issue的数目
    getIssuesNum(){
        return this.issues.length;
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
            options.add(v);
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
                propCount[v] ? propCount[v]+=1 : propCount[v]=1;
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

    // 获取某Filter被选中的项
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

        // 发送消息，选中项变了
        this.trigModelChangeEvent("SelectedOptions");
    }

    clearFilterSelectedOptions(){
        for (const key of Object.keys(this.viewConfig.getFiltersDict())){
            // DropDown的选中项
            if (this.filterSelectedOptions[key] instanceof Set){
                this.filterSelectedOptions[key].clear();
            // Text的选中项
            }else if(typeof this.filterSelectedOptions[key] === 'string'){
                this.filterSelectedOptions[key] = '';
            // DateRange的选中项    
            }else if(this.filterSelectedOptions[key] instanceof Array){
                this.filterSelectedOptions[key] = new Array();
            }
        }
        // 发送消息，选中项变了
        this.trigModelChangeEvent("SelectedOptions");
    }

    // 根据JQL重新获取issue
    async regetAllIssues(){
        let [issues, notReadIssueKey] = await new JiraIssueReader().read(this.jql.getRawJQL())
        this.issues = issues;

        // 检测Filter的Option，适配新的issues
        let filters = this.viewConfig.getFiltersDict()
        for (const [k,v] of Object.entries(filters)){
            if (v["filter"].type == 'DropDown'){
                this.filterOptions[k] = new Set();
            }
        }
        for (const issue of this.issues) {
            for (const [k,v] of Object.entries(filters)){
                if (v["filter"].type == 'DropDown'){
                    let attr = issue.getAttr(k);
                    this.filterOptions[k].add(attr);
                }
            }
        }
        let isFilterSelectedOptionChange = false;       // 是不是issues的改变会带来已选项的改变
        for (const [k,v] of Object.entries(filters)){
            if (v["filter"].type == 'DropDown'){
                if(this.filterSelectedOptions[k].size > 0){
                    for (const option of this.filterSelectedOptions[k]) {
                        if (!this.filterOptions[k].has(option)) {
                            this.filterSelectedOptions[k].delete(option);
                            isFilterSelectedOptionChange = true;
                        }
                    }
                }
            }
        }

        // 发送消息，重新获取issue
        this.trigModelChangeEvent("IssueReget");
        if (isFilterSelectedOptionChange) {
            this.trigModelChangeEvent("SelectedOptions");
        }
    }

    // 根据筛选条件生成新的JQL
    genJQLWithSelection(){
        // 先确保从所有的Issue那找到了用了哪几个ReadScheme
        this._getIssuesAllReadScheme();
        // 有哪些选项是可以选择的
        let filterConfig = this.viewConfig.getFiltersDict();
        // 定义一个比较Array of string的lambda函数
        let isSamePath = (a,b) => {
            if(a.length != b.length) return false;
            for(let i=0; i<a.length; ++i){
                if(a[i] != b[i]) return false;
            }
            return true;
        }
        // 循环所有已选项
        let validSelection = {};
        let reader = new JiraIssueReader();
        for (const [k,v] of Object.entries(this.filterSelectedOptions)) {
            // 跳过没有筛选项的filter
            if(v instanceof Set && v.size === 0) continue;
            if(typeof v === 'string' && v === '') continue;
            if(v instanceof Array && v.length === 0) continue;
            // 循环每一个ReadScheme，如果出现当前key的读取Path不一致，则无法构造JQL
            let path = undefined;
            for (const scheme of this.issuesAllReadScheme) {
                let p = scheme.howToReadField(k);
                if(!p) continue;
                if(!path){
                    path = p;
                }else if(!isSamePath(path, p)){
                    return [false, "字段\"" + filterConfig[k]["filter"]["label"] + "\"有多种读取方法，无法构造JQL，请联系史建鑫查看原因。"];
                }
            }
            if(!path) return [false, "字段\"" + filterConfig[k]["filter"]["label"] + "\"找不到读取字段，无法构造JQL，请联系史建鑫查看原因。"];
            let jqlName = reader.getJQLName(path);

            
            // DropDown的选中项
            if (v instanceof Set){
                let jqlValues = new Set();
                for (const vv of v) {
                    if (k === "status") {
                        let valueReplace = {"处理中" : "In Progress", "完成" : "Done", "开放" : "Open", "重新打开" : "Reopened", "已解决" : "Resolved", "已关闭" : "Closed"};
                        if (vv in valueReplace) {
                            jqlValues.add(valueReplace[vv])
                        }else{
                            jqlValues.add(vv)
                        }
                    }else{
                        jqlValues.add(vv)
                    }
                }
                validSelection[jqlName] = jqlValues;
            // Text的选中项
            }else if(typeof v === 'string'){
                validSelection[jqlName] = v;
            // DateRange的选中项    
            }else if(v instanceof Array){
                validSelection[jqlName] = v;
            }
        }
        return [true, this.jql.genNewJQL(validSelection)];
    }

    // 根据所有的Issue，找到他们的ReadScheme
    _getIssuesAllReadScheme(){
        if(this.issuesAllReadScheme) return;
        this.issuesAllReadScheme = new Set();
        for (const issue of this.issues) {
            let projName = issue.getAttr("projName");
            let issueType = issue.getAttr("issueType");
            let scheme = getIssueReadScheme(projName, issueType)
            this.issuesAllReadScheme.add(scheme);
        }
    }
    
    // 根据数据生成Filter字段的选项
    _genFilterOptions(){

        for (const [k,v] of Object.entries(this.viewConfig.getFiltersDict())){
            if (v["filter"].type == 'DropDown'){
                this.filterOptions[k]                   = new Set();
                this.filterSelectedOptions[k]           = new Set();
            }else if(v["filter"].type == 'Text'){
                this.filterSelectedOptions[k]           = "";
            }else if(v["filter"].type == 'DateRange'){
                this.filterSelectedOptions[k]           = new Array();
            }
        }

        let filters = this.viewConfig.getFiltersDict()
        for (const issue of this.issues) {
            for (const [k,v] of Object.entries(filters)){
                if (v["filter"].type == 'DropDown'){
                    let attr = issue.getAttr(k);
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


}