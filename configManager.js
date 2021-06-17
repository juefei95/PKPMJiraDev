/// 本JS是根据外部JQL来做对应的配置选择


import { JiraIssueReader } from "./jiraIssueReader.js";
import {date2String} from './toolSet.js'

// Config 工厂
export function getConfig(projectType, issueType, mode){
    if (projectType === 'JGVIRUS' && issueType === '故事' && mode === 'filter') {
        return new StructStoryFilter(projectType, issueType, mode)
    }else if (projectType === 'JGVIRUS' && issueType === '故障' && mode === 'filter') {
        return new StructBugFilter(projectType, issueType, mode)
    }else if (projectType === 'PC' && issueType === '故障' && mode === 'filter') {
        return new PCBugFilter(projectType, issueType, mode);
    }else if (projectType === 'PC' && issueType === 'EPIC' && mode === 'filter') {
        return new PCEpicFilter(projectType, issueType, mode);
    }
    throw "error: projectType=" + projectType + " issueType=" + issueType + " mode=" + mode
    return new Config(projectType, issueType, mode);
}

export class Config{

    constructor(projectType, issueType, mode){
        this.projectType = projectType
        this.issueType = issueType;
        this.mode = mode;

        // 作为一个统一的过滤器展示，不同的项目虽然字段定义不同，但表现是一样的（比如都会有研发提测时间）
        // 所以这里从整体上定义了待展示字段的全集，各个项目根据自己定义的Jira工作流，选择其子集作为展示
        this.config = {
            "recid" : {
                "visible" : true,
                "grid" : {
                    caption: 'ID',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        return '<div><a target="_blank" href="https://jira.pkpm.cn/browse/' + record.recid + '">' + record.recid + '</a></div>';
                    }
                }
            },
            "category" : {
                "visible" : true,
                "chart" : {
                    "visible" : true,
                },
                "filter" : {
                    type : 'DropDown',
                    id : 'categoryFilter',
                    label : '模块',
                    width : '200px',
                    placeholder : "请选择模块",
                },
                "grid" : {
                    caption: '模块',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.category == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.category + '</i></div>';
                        } else {
                            return '<div>' + record.category + '</div>';
                        }
                    },
                },
            },
            "affectVersions" : {
                "visible" : true,
                "chart" : {
                    "visible" : false,
                },
                "filter" : {
                    type : 'DropDown',
                    id : 'affectVersionsFilter',
                    label : '影响版本',
                    width : '200px',
                    placeholder : "请选择影响版本",
                },
                "grid" : {
                    caption: '影响版本',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.affectVersions == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.affectVersions + '</i></div>';
                        } else {
                            return '<div>' + record.affectVersions + '</div>';
                        }
                    },
                },
            },
            "fixVersions" : {
                "visible" : true,
                "chart" : {
                    "visible" : false,
                },
                "filter" : {
                    type : 'DropDown',
                    id : 'fixVersionsFilter',
                    label : '修复版本',
                    width : '200px',
                    placeholder : "请选择修复版本",
                },
                "grid" : {
                    caption: '修复版本',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.fixVersions == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.fixVersions + '</i></div>';
                        } else {
                            return '<div>' + record.fixVersions + '</div>';
                        }
                    },
                },
            },
            "title" : {
                "visible" : true,
                "filter" : {
                    type : 'Text',
                    id : 'titleFilter',
                    label : '标题',
                    width : '400px',
                    placeholder : "请输入标题，回车后过滤",
                },
                "grid" : {
                    caption: '标题',
                    sortable: true,
                    size: '200px',
                    render: function (record) {
                        if (record.confluenceLink == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.title + '</i></div>';
                        } else {
                            if (record.confluenceLink) {
                                return '<div><a target="_blank" href="' + record.confluenceLink + '">' + record.title + '</a></div>';
                            }else{
                                return '<div>' + record.title + '</div>';
                            }
                        }
                    },
                },
            },
            "status" : {
                "visible" : true,
                "chart" : {
                    "visible" : true,
                },
                "filter" : {
                    type : 'DropDown',
                    id : 'statusFilter',
                    label : '状态',
                    width : '300px',
                    placeholder : "请选择状态",
                    labelMenu : [{
                        btnName : "选中产品相关状态",
                        selects : ["Backlog", "需求待评审", "需求待设计", "需求设计中", "需求验证"],     
                    },{
                        btnName : "选中测试相关状态",
                        selects : ["测试完成", "测试中", "已提测"],     
                    },{    
                        btnName : "选中研发相关状态",
                        selects : ["待研发", "研发中"],        
                    }]

                },
                "grid" : {
                    caption: '状态',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.status == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.status + '</i></div>';
                        } else {
                            return '<div>' + record.status + '</div>';
                        }
                    },
                },
            },
            "assignee" :{
                "visible" : true,
                "chart" : {
                    "visible" : false,
                },
                "filter" : {
                    type : 'DropDown',
                    id : 'assigneeFilter',
                    label : '指派给',
                    width : '200px',
                    placeholder : "请选择指派给谁",
                },
                "grid" : {
                    caption: '指派给',
                    sortable: true,
                    size: '60px',
                    render: function (record) {
                        if (record.assignee == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.assignee + '</i></div>';
                        } else {
                            return '<div>' + record.assignee + '</div>';
                        }
                    },
                },

            },
            "designer" : {
                "visible" : true,
                "chart" : {
                    "visible" : false,
                },
                "filter" : {
                    type : 'DropDown',
                    id : 'designerFilter',
                    label : '产品',
                    width : '200px',
                    placeholder : '请选择产品设计人员',
                },
                "grid" : {
                    caption: '产品设计负责人',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.designer == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.designer + '</i></div>';
                        } else {
                            return '<div>' + record.designer + '</div>';
                        }
                    },
                },
            },
            "developer" : {
                "visible" : true,
                "chart" : {
                    "visible" : false,
                },
                "filter" : {
                    type : 'DropDown',
                    id : 'developerFilter',
                    label : '研发',
                    width : '200px',
                    placeholder : '请选择研发人员',
                },
                "grid" : {
                    caption: '研发负责人',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.developer == "Empty Field") {
                            return '<div><i style="color:#A9A9A9">' + record.developer + '</i></div>';
                        } else {
                            return '<div>' + record.developer + '</div>';
                        }
                    },
                },
            },
            "tester" : {
                "visible" : true,
                "chart" : {
                    "visible" : false,
                },
                "filter" : {
                    type : 'DropDown',
                    id : 'testerFilter',
                    label : '测试',
                    width : '200px',
                    placeholder : '请选择测试人员',
                },
                "grid" : {
                    caption: '测试负责人',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.tester == "Empty Field") {
                            return '<div><i style="color:#A9A9A9">' + record.tester + '</i></div>';
                        } else {
                            return '<div>' + record.tester + '</div>';
                        }
                    },
                },
            },
            "confluenceLink" : {
                "visible" : false,

            },
            "docPlanCommitDate" : {
                "visible" : true,
                "filter" : {
                    type : 'DateRange',
                    id : 'docPlanCommitDateFilter',
                    label : '产品计划日期',
                    width : '80px',
                },
                "grid" : {
                    caption: '产品计划日期',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.docPlanCommitDate == JiraIssueReader.invalidDate) {
                            return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                        } else {
                            return '<div>' + date2String(record.docPlanCommitDate) + '</div>';
                        }
                    },
                },

            },
            "programPlanCommitDate" : {
                "visible" : true,
                "filter" : {
                    type : 'DateRange',
                    id : 'programPlanCommitDateFilter',
                    label : '研发计划提测',
                    width : '80px',
                },
                "grid" : {
                    caption: '研发计划提测',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.programPlanCommitDate == JiraIssueReader.invalidDate) {
                            return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                        } else {
                            return '<div>' + date2String(record.programPlanCommitDate) + '</div>';
                        }
                    },
                },

            },
            "programActualCommitDate" : {
                "visible" : true,
                "filter" : {
                    type : 'DateRange',
                    id : 'programActualCommitDateFilter',
                    label : '研发实际提测',
                    width : '80px',
                },
                "grid" : {
                    caption: '研发实际提测',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.programActualCommitDate == JiraIssueReader.invalidDate) {
                            return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                        } else {
                            return '<div>' + date2String(record.programActualCommitDate) + '</div>';
                        }
                    },
                },

            },
            "testPlanEndDate" : {
                "visible" : true,
                "filter" : {
                    type : 'DateRange',
                    id : 'testPlanEndDateFilter',
                    label : '测试计划结束',
                    width : '80px',
                },
                "grid" : {
                    caption: '测试计划结束',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.testPlanEndDate == JiraIssueReader.invalidDate) {
                            return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                        } else {
                            return '<div>' + date2String(record.testPlanEndDate) + '</div>';
                        }
                    },
                },

            },
            "bugPriority" : {
                "visible" : true,
                "chart" : {
                    "visible" : false,
                },
                "filter" : {
                    type : 'DropDown',
                    id : 'bugPriorityFilter',
                    label : '优先级',
                    width : '200px',
                    placeholder : "请选择Bug优先级",
                },
                "grid" : {
                    caption: '优先级',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.bugPriority == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.bugPriority + '</i></div>';
                        } else {
                            return '<div>' + record.bugPriority + '</div>';
                        }
                    },
                },
            },
            "epicId": {
                "visible" : true,
                "filter" : {
                    type : 'Text',
                    id : 'epicIdFilter',
                    label : '史诗',
                    width : '200px',
                    placeholder : "请输入史诗的ID",
                },
                "grid" : {
                    caption: '史诗',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.epicId == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.epicId + '</i></div>';
                        } else {
                            return '<div><a target="_blank" href="https://jira.pkpm.cn/browse/' + record.epicId + '">' + record.epicId + '</a></div>';
                        }
                    },
                },
                
            },
            "fixedChangeset": {
                "visible" : true,
                "filter" : {
                    type : 'Text',
                    id : 'fixedChangesetFilter',
                    label : '变更集',
                    width : '150px',
                    placeholder : "请输入变更集",
                },
                "grid" : {
                    caption: '变更集',
                    sortable: true,
                    size: '200px',
                    render: function (record) {
                        if (record.fixedChangeset == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.fixedChangeset + '</i></div>';
                        } else {
                            return '<div>' + record.fixedChangeset + '</div>';
                        }
                    },
                },
                
            },
            "testComment" :{
                "visible" : true,
                "grid" : {
                    caption: '测试备注',
                    sortable: true,
                    size: '200px',
                    render: function (record) {
                        if (record.testComment == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.testComment + '</i></div>';
                        } else {
                            return '<div>' + record.testComment + '</div>';
                        }
                    },
                },
            },
            "tester" : {
                "visible" : true,
                "chart" : {
                    "visible" : false,
                },
                "filter" : {
                    type : 'DropDown',
                    id : 'testerFilter',
                    label : '测试',
                    width : '200px',
                    placeholder : "请选择测试人员",
                },
                "grid" : {
                    caption: '测试',
                    sortable: true,
                    size: '60px',
                    render: function (record) {
                        if (record.tester == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.tester + '</i></div>';
                        } else {
                            return '<div>' + record.tester + '</div>';
                        }
                    },
                },

            },
            "resolution" :{
                "visible" : true,
                "chart" : {
                    "visible" : false,
                },
                "filter" : {
                    type : 'DropDown',
                    id : 'resolutionFilter',
                    label : '解决结果',
                    width : '200px',
                    placeholder : "请选择解决结果",
                },
                "grid" : {
                    caption: '解决结果',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.resolution == JiraIssueReader.emptyText) {
                            return '<div><i style="color:#A9A9A9">' + record.resolution + '</i></div>';
                        } else {
                            return '<div>' + record.resolution + '</div>';
                        }
                    },
                },

            },
            "resolvePerson" :{
                "visible" : true,
                "chart" : {
                    "visible" : false,
                },
                "filter" : {
                    type : 'DropDown',
                    id : 'resolvePersonFilter',
                    label : '解决人',
                    width : '200px',
                    placeholder : "请选择解决人",
                },
                "grid" : {
                    caption: '解决人',
                    sortable: true,
                    size: '60px',
                    render: function (record) {
                        if (record.resolvePerson == "Empty Field") {
                            return '<div><i style="color:#A9A9A9">' + record.resolvePerson + '</i></div>';
                        } else {
                            return '<div>' + record.resolvePerson + '</div>';
                        }
                    },
                },

            },
            "createDate" :{
                "visible" : true,
                "filter" : {
                    type : 'DateRange',
                    id : 'createDateFilter',
                    label : '创建日期',
                    width : '80px',
                },
                "grid" : {
                    caption: '创建日期',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.createDate == JiraIssueReader.invalidDate) {
                            return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                        } else {
                            return '<div>' + date2String(record.createDate) + '</div>';
                        }
                    },
                },
            },
            "resolutionDate" :{
                "visible" : true,
                "filter" : {
                    type : 'DateRange',
                    id : 'resolutionDateFilter',
                    label : '解决日期',
                    width : '80px',
                },
                "grid" : {
                    caption: '解决日期',
                    sortable: true,
                    size: '100px',
                    render: function (record) {
                        if (record.resolutionDate == JiraIssueReader.invalidDate) {
                            return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                        } else {
                            return '<div>' + date2String(record.resolutionDate) + '</div>';
                        }
                    },
                },

            },
        };

        this._modifyConfig();     // 给配置补充字段的路径，这个函数由子类实现
        this._purge();      // 清理不需要的字段
    }

    // 获得各个字段的从Jira的issue的json里的路径
    getFieldsDict(){
        let fieldsDict = {};
        for (const [k,v] of Object.entries(this.config)){
            if ("path" in v){
                fieldsDict[k] = v.path;
            }
        }
        return fieldsDict;
    }

    // 获取当前配置的所有包含grid的key的标题，包括显示的和隐藏的
    getGridFieldsVisibility(){
        let keys = {};
        for (const [k,v] of Object.entries(this.config)) {
            if ("grid" in v) {
                keys[k] = {};
                keys[k]["visible"] = v["visible"];
                keys[k]["caption"] = "caption" in v["grid"] ? v["grid"]["caption"] : k;
            }
        }
        return keys;
    }

    // 设置当前配置的Key的Visibility
    setGridFieldsVisibility(keys){
        for (const [k,v] of Object.entries(keys)) {
            if (k in this.config && "visible" in v) {
                this.config[k]["visible"] = v["visible"];
            }
        }
    }

    // 获得所有Grid的内容
    getGridsDict(){
        let grids = {};
        for (const [k,v] of Object.entries(this.config)){
            if ("grid" in v) {
                grids[k] = v["grid"];
            }
        }
        return grids;
    }

    // 获取所有Filter
    getFilters(){
        return Object.values(this.getFiltersDict());
    }

    getFiltersDict(){
        let filters = {};
        for (const [k,v] of Object.entries(this.config)){
            if ("grid" in v && "filter" in v) {
                if ("chart" in v) {
                    v["filter"]["hasChart"] = true;
                    if ("visible" in v["chart"] && v["chart"]["visible"]) {
                        v["filter"]["isShowChart"] = true;
                    }else{
                        v["filter"]["isShowChart"] = false;
                    }
                }else{
                    v["filter"]["hasChart"] = false;
                }
                filters[k] = v["filter"];
            }
        }
        return filters;
    }

    // 获取需要展示的chart
    getChartsDict(){
        let charts = {};
        for (const [k,v] of Object.entries(this.config)){
            if ("grid" in v && "filter" in v && "chart" in v) {
                charts[k] = v["chart"];
            }
        }
        return charts;
    }
    
    // 设置Chart的Visible属性
    setChartVisible(key, visible){
        if (typeof visible == "boolean" && key in this.config && "chart" in this.config[key]) {
            this.config[key]["chart"]["visible"] = visible;
        }
    }


    // 获得字段的path
    getFieldPath(field){
        return this.config[field]["path"];
    }

    // 将字段的Value换成JQL搜索时的Value
    getFieldJQLValue(field, value){
        if ("JQLValue" in this.config[field] && value in this.config[field]["JQLValue"]) {
            return this.config[field]["JQLValue"][value];
        }else{
            return value;
        }
    }

    // 清理不需要的字段
    _purge(){
        for (const [k,v] of Object.entries(this.config)){
            if ("path" in v === false) {
                delete this.config[k];
            }
        }
    }

}

class StructStoryFilter extends Config{
    constructor(projectType, issueType, mode){
        super(projectType, issueType, mode);
    }



    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.recid["path"]           = ["key"];
        this.config.category["path"]        = ["fields", "components"];
        this.config.title["path"]           = ["fields", "summary"];
        this.config.status["path"]          = ["fields", "status"];
        this.config.status["JQLValue"]          = {"完成" : "Done"};
        this.config.designer["path"]        = ["fields", "customfield_10537"];
        this.config.developer["path"]       = ["fields", "customfield_10538"];
        this.config.tester["path"]          = ["fields", "customfield_10539"];
        this.config.confluenceLink["path"]  = ["fields", "customfield_10713"];
        this.config.docPlanCommitDate["path"]  = ["fields", "customfield_11415"];
        this.config.programPlanCommitDate["path"]  = ["fields", "customfield_11408"];
    }

}

class StructBugFilter extends Config{
    constructor(projectType, issueType, mode){
        super(projectType, issueType, mode);
    }



    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.recid["path"]           = ["key"];
        this.config.category["path"]        = ["fields", "components"];
        this.config.title["path"]           = ["fields", "summary"];
        this.config.status["path"]          = ["fields", "status"];
        this.config.status["JQLValue"]          = {"开放" : "Open", "重新打开" : "Reopened", "已解决" : "Resolved", "已关闭" : "Closed"};
        this.config.tester["path"]          = ["fields", "reporter"];
        this.config.assignee["path"]          = ["fields", "assignee"];
        this.config.resolution["path"]          = ["fields", "resolution"];
        this.config.resolvePerson["path"]          = ["fields", "customfield_10716"];
        this.config.createDate["path"]          = ["fields", "created"];
        this.config.resolutionDate["path"]          = ["fields", "resolutiondate"];
        this.config.bugPriority["path"]          = ["fields", "customfield_10510"];
    }

}

class PCBugFilter extends Config{
    constructor(projectType, issueType, mode){
        super(projectType, issueType, mode);
    }

    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.recid["path"]           = ["key"];
        this.config.category["path"]        = ["fields", "components"];
        this.config.title["path"]           = ["fields", "summary"];
        this.config.status["path"]          = ["fields", "status"];
        this.config.status["JQLValue"]          = {"开放" : "Open", "重新打开" : "Reopened", "已解决" : "Resolved", "已关闭" : "Closed"};
        this.config.bugPriority["path"]     = ["fields", "priority"];
        this.config.affectVersions["path"]     = ["fields", "versions"];
        this.config.fixVersions["path"]     = ["fields", "fixVersions"];
        this.config.epicId["path"]     = ["fields", "customfield_10102"];
        this.config.epicId["visible"]  = false;
        this.config.fixedChangeset["path"]     = ["fields", "customfield_10703"];
    }
}

class PCEpicFilter extends Config{
    constructor(projectType, issueType, mode){
        super(projectType, issueType, mode);
    }

    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.recid["path"]                       = ["key"];
        this.config.category["path"]                    = ["fields", "components"];
        this.config.title["path"]                       = ["fields", "summary"];
        this.config.status["path"]                      = ["fields", "status"];
        this.config.status["JQLValue"]                  = {"处理中" : "In Progress", "完成" : "Done"};
        this.config.programPlanCommitDate["path"]       = ["fields", "customfield_11308"];
        this.config.programActualCommitDate["path"]     = ["fields", "customfield_11409"];
        this.config.testPlanEndDate["path"]             = ["fields", "customfield_11312"];
        this.config.testComment["path"]                 = ["fields", "customfield_11443"];
    }
}