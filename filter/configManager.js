/// 本JS是根据外部JQL来做对应的配置选择


import { date2String }      from './../model/toolSet.js'
import { Issue }            from './../model/issue.js'

// Config 工厂
export function getConfig(projectType, issueType){
    if (projectType === 'JGVIRUS' && issueType === '故事') {
        return new StructStoryFilter(projectType, issueType)
    }else if (projectType === 'JGVIRUS' && issueType === '故障') {
        return new StructBugFilter(projectType, issueType)
    }else if (projectType === 'PC' && issueType === '故障') {
        return new PCBugFilter(projectType, issueType);
    }else if (projectType === 'PC' && issueType === 'EPIC') {
        return new PCEpicFilter(projectType, issueType);
    }else if (projectType === 'BIMMEP' && issueType === '故事') {
        return new MEPStoryFilter(projectType, issueType);
    }else if (projectType === 'BIMMEP' && issueType === '故障') {
        return new MEPBugFilter(projectType, issueType);
    }
    throw "error: JQL中projectType、issueType、mode有问题"
}

export class Config{

    constructor(projectType, issueType){
        this.projectType = projectType
        this.issueType = issueType;

        // 作为一个统一的过滤器展示，不同的项目虽然字段定义不同，但表现是一样的（比如都会有研发提测时间）
        // 所以这里从整体上定义了待展示字段的全集，各个项目根据自己定义的Jira工作流，选择其子集作为展示
        this.config = Issue.getConfig();

        this.config.jiraId["visible"] = true;
        this.config.jiraId["grid"] = {
            caption: 'ID',
            sortable: true,
            size: '100px',
            render: function (record) {
                return '<div><a target="_blank" href="https://jira.pkpm.cn/browse/' + record.jiraId + '">' + record.jiraId + '</a></div>';
            }
        };

        this.config.category["visible"] = true;
        this.config.category["chart"] = {
            "visible" : true,
        };
        this.config.category["filter"] = {
            type : 'DropDown',
            label : '模块',
            width : '200px',
            placeholder : "请选择模块",
        };
        this.config.category["grid"] = {
            caption: '模块',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.category == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.category + '</i></div>';
                } else {
                    return '<div>' + record.category + '</div>';
                }
            },
        };
                
        this.config.MEPCategory["visible"] = true;
        this.config.MEPCategory["chart"] = {
            "visible" : false,
        };
        this.config.MEPCategory["filter"] = {
            type : 'DropDown',
            label : 'MEP专业',
            width : '200px',
            placeholder : "请选择MEP专业",
        };
        this.config.MEPCategory["grid"] = {
            caption: 'MEP专业',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.MEPCategory == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.MEPCategory + '</i></div>';
                } else {
                    return '<div>' + record.MEPCategory + '</div>';
                }
            },
        };

        this.config.affectVersions["visible"] = true;
        this.config.affectVersions["chart"] = {
            "visible" : false,
        };
        this.config.affectVersions["filter"] = {
            type : 'DropDown',
            label : '影响版本',
            width : '200px',
            placeholder : "请选择影响版本",
        };
        this.config.affectVersions["grid"] = {
            caption: '影响版本',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.affectVersions == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.affectVersions + '</i></div>';
                } else {
                    return '<div>' + record.affectVersions + '</div>';
                }
            },
        };


        this.config.fixVersions["visible"] = true;
        this.config.fixVersions["chart"] = {
            "visible" : false,
        };
        this.config.fixVersions["filter"] =  {
            type : 'DropDown',
            label : '修复版本',
            width : '200px',
            placeholder : "请选择修复版本",
        };
        this.config.fixVersions["grid"] =  {
            caption: '修复版本',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.fixVersions == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.fixVersions + '</i></div>';
                } else {
                    return '<div>' + record.fixVersions + '</div>';
                }
            },
        };
                
        this.config.title["visible"] = true;
        this.config.title["filter"] = {
            type : 'Text',
            label : '标题',
            width : '400px',
            placeholder : "请输入标题，回车后过滤",
        };
        this.config.title["grid"] = {
            caption: '标题',
            sortable: true,
            size: '200px',
            render: function (record) {
                if (record.title === Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.title + '</i></div>';
                } else {
                    if (record.confluenceLink && record.confluenceLink  !== Issue.emptyText) {
                        return '<div><a target="_blank" href="' + record.confluenceLink + '">' + record.title + '</a></div>';
                    }else{
                        return '<div>' + record.title + '</div>';
                    }
                }
            },
        };
          
        this.config.status["visible"] = true;
        this.config.status["chart"] = {
            "visible" : true,
        };
        this.config.status["filter"] = {
            type : 'DropDown',
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
        };
        this.config.status["grid"] = {
            caption: '状态',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.status == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.status + '</i></div>';
                } else {
                    return '<div>' + record.status + '</div>';
                }
            },
        };
            
        this.config.assignee["visible"] = true;
        this.config.assignee["chart"] = {
            "visible" : false,
        };
        this.config.assignee["filter"] = {
            type : 'DropDown',
            label : '指派给',
            width : '200px',
            placeholder : "请选择指派给谁",
        };
        this.config.assignee["grid"] = {
            caption: '指派给',
            sortable: true,
            size: '60px',
            render: function (record) {
                if (record.assignee == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.assignee + '</i></div>';
                } else {
                    return '<div>' + record.assignee + '</div>';
                }
            },
        };
        
        this.config.designer["visible"] = true;
        this.config.designer["chart"] = {
            "visible" : false,
        };
        this.config.designer["filter"] = {
            type : 'DropDown',
            label : '产品',
            width : '200px',
            placeholder : '请选择产品设计人员',
        };
        this.config.designer["grid"] = {
            caption: '产品设计负责人',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.designer == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.designer + '</i></div>';
                } else {
                    return '<div>' + record.designer + '</div>';
                }
            },
        };
          
        this.config.developer["visible"] = true;
        this.config.developer["chart"] = {
            "visible" : false,
        };
        this.config.developer["filter"] = {
            type : 'DropDown',
            label : '研发',
            width : '200px',
            placeholder : '请选择研发人员',
        };
        this.config.developer["grid"] = {
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
        };
          
        this.config.tester["visible"] = true;
        this.config.tester["chart"] = {
            "visible" : false,
        };
        this.config.tester["filter"] = {
            type : 'DropDown',
            label : '测试',
            width : '200px',
            placeholder : '请选择测试人员',
        };
        this.config.tester["grid"] = {
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
        };
            
        this.config.confluenceLink["visible"] = false;

        this.config.docPlanCommitDate["visible"] = true;
        this.config.docPlanCommitDate["filter"] = {
            type : 'DateRange',
            label : '产品计划日期',
            width : '80px',
        };
        this.config.docPlanCommitDate["grid"] = {
            caption: '产品计划日期',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.docPlanCommitDate == Issue.invalidDate) {
                    return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                } else {
                    return '<div>' + date2String(record.docPlanCommitDate) + '</div>';
                }
            },
        };

        this.config.programPlanCommitDate["visible"] = true,
        this.config.programPlanCommitDate["filter"] = {
            type : 'DateRange',
            label : '研发计划提验',
            width : '80px',
        };
        this.config.programPlanCommitDate["grid"] = {
            caption: '研发计划提验',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.programPlanCommitDate == Issue.invalidDate) {
                    return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                } else {
                    return '<div>' + date2String(record.programPlanCommitDate) + '</div>';
                }
            },
        };

        this.config.designerActualCommitTestDate["visible"] = true;
        this.config.designerActualCommitTestDate["filter"] = {
            type : 'DateRange',
            label : '产品实际提测',
            width : '80px',
        };
        this.config.designerActualCommitTestDate["grid"] = {
            caption: '产品实际提测',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.designerActualCommitTestDate == Issue.invalidDate) {
                    return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                } else {
                    return '<div>' + date2String(record.designerActualCommitTestDate) + '</div>';
                }
            },
        };

        this.config.testPlanEndDate["visible"] = true;
        this.config.testPlanEndDate["filter"] = {
            type : 'DateRange',
            label : '测试计划结束',
            width : '80px',
        };
        this.config.testPlanEndDate["grid"] = {
            caption: '测试计划结束',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.testPlanEndDate == Issue.invalidDate) {
                    return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                } else {
                    return '<div>' + date2String(record.testPlanEndDate) + '</div>';
                }
            },
        };

        this.config.bugPriority["visible"] = true;
        this.config.bugPriority["chart"] = {
            "visible" : false,
        };
        this.config.bugPriority["filter"] = {
            type : 'DropDown',
            label : '优先级',
            width : '200px',
            placeholder : "请选择Bug优先级",
        };
        this.config.bugPriority["grid"] = {
            caption: '优先级',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.bugPriority == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.bugPriority + '</i></div>';
                } else {
                    return '<div>' + record.bugPriority + '</div>';
                }
            },
        };
          
        this.config.bugPhase["visible"] = true;
        this.config.bugPhase["chart"] = {
            "visible" : false,
        };
        this.config.bugPhase["filter"] = {
            type : 'DropDown',
            label : '发现阶段',
            width : '200px',
            placeholder : "请选择Bug发现阶段",
        };
        this.config.bugPhase["grid"] = {
            caption: '发现阶段',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.bugPhase == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.bugPhase + '</i></div>';
                } else {
                    return '<div>' + record.bugPhase + '</div>';
                }
            },
        };
            
        this.config.epicId["visible"] = true;
        this.config.epicId["filter"] = {
            type : 'Text',
            label : '史诗',
            width : '200px',
            placeholder : "请输入史诗的ID",
        };
        this.config.epicId["grid"] = {
            caption: '史诗',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.epicId == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.epicId + '</i></div>';
                } else {
                    return '<div><a target="_blank" href="https://jira.pkpm.cn/browse/' + record.epicId + '">' + record.epicId + '</a></div>';
                }
            },
        };
                
        this.config.fixedChangeset["visible"] = true;
        this.config.fixedChangeset["filter"] = {
            type : 'Text',
            label : '变更集',
            width : '150px',
            placeholder : "请输入变更集",
        };
        this.config.fixedChangeset["grid"] = {
            caption: '变更集',
            sortable: true,
            size: '200px',
            render: function (record) {
                if (record.fixedChangeset == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.fixedChangeset + '</i></div>';
                } else {
                    return '<div>' + record.fixedChangeset + '</div>';
                }
            },
        };
                
        this.config.testComment["visible"] = true;
        this.config.testComment["grid"] = {
            caption: '测试备注',
            sortable: true,
            size: '200px',
            render: function (record) {
                if (record.testComment == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.testComment + '</i></div>';
                } else {
                    return '<div>' + record.testComment + '</div>';
                }
            },
        };

        this.config.resolution["visible"] = true;
        this.config.resolution["chart"] = {
            "visible" : false,
        };
        this.config.resolution["filter"] = {
            type : 'DropDown',
            label : '解决结果',
            width : '200px',
            placeholder : "请选择解决结果",
        };
        this.config.resolution["grid"] = {
            caption: '解决结果',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.resolution == Issue.emptyText) {
                    return '<div><i style="color:#A9A9A9">' + record.resolution + '</i></div>';
                } else {
                    return '<div>' + record.resolution + '</div>';
                }
            },
        };

        this.config.resolvePerson["visible"] = true;
        this.config.resolvePerson["chart"] = {
            "visible" : false,
        };
        this.config.resolvePerson["filter"] = {
            type : 'DropDown',
            label : '解决人',
            width : '200px',
            placeholder : "请选择解决人",
        };
        this.config.resolvePerson["grid"] = {
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
        };

        this.config.createDate["visible"] = true;
        this.config.createDate["filter"] = {
            type : 'DateRange',
            label : '创建日期',
            width : '80px',
        };
        this.config.createDate["grid"] = {
            caption: '创建日期',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.createDate == Issue.invalidDate) {
                    return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                } else {
                    return '<div>' + date2String(record.createDate) + '</div>';
                }
            },
        };
          
        this.config.resolutionDate["visible"] = true;
        this.config.resolutionDate["filter"] = {
            type : 'DateRange',
            label : '解决日期',
            width : '80px',
        };
        this.config.resolutionDate["grid"] = {
            caption: '解决日期',
            sortable: true,
            size: '100px',
            render: function (record) {
                if (record.resolutionDate == Issue.invalidDate) {
                    return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                } else {
                    return '<div>' + date2String(record.resolutionDate) + '</div>';
                }
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
    getFieldsVisibility(){
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
    setFieldsVisibility(fieldsVis){
        for (const [k,v] of Object.entries(fieldsVis)) {
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
    
    /**
    * 设置chart的可见性
    * @param {string} key chart的key
    * @param {bool} visible chart的可见性
    */
     setChartVisibility(key, visible){
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
    constructor(projectType, issueType){
        super(projectType, issueType);
    }



    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.jiraId["path"]           = ["key"];
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
    constructor(projectType, issueType){
        super(projectType, issueType);
    }



    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.jiraId["path"]           = ["key"];
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
    constructor(projectType, issueType){
        super(projectType, issueType);
    }

    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.jiraId["path"]           = ["key"];
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
    constructor(projectType, issueType){
        super(projectType, issueType);
    }

    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.jiraId["path"]                       = ["key"];
        this.config.category["path"]                    = ["fields", "components"];
        this.config.title["path"]                       = ["fields", "summary"];
        this.config.status["path"]                      = ["fields", "status"];
        this.config.status["JQLValue"]                  = {"处理中" : "In Progress", "完成" : "Done"};
        this.config.designer["path"]                    = ["fields", "reporter"];
        this.config.developer["path"]                   = ["fields", "assignee"];
        this.config.tester["path"]                      = ["fields", "customfield_10901"];
        this.config.programPlanCommitDate["path"]       = ["fields", "customfield_11308"];
        this.config.designerActualCommitTestDate["path"]     = ["fields", "customfield_11409"];
        this.config.testPlanEndDate["path"]             = ["fields", "customfield_11312"];
        this.config.testComment["path"]                 = ["fields", "customfield_11443"];
    }
}

class MEPStoryFilter extends Config{
    constructor(projectType, issueType){
        super(projectType, issueType);
    }

    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.jiraId["path"]                               = ["key"];
        this.config.category["path"]                            = ["fields", "components"];
        this.config.MEPCategory["path"]                         = ["fields", "customfield_10701"];
        this.config.title["path"]                               = ["fields", "summary"];
        this.config.status["path"]                              = ["fields", "status"];
        this.config.status["JQLValue"]                          = {"处理中" : "In Progress", "完成" : "Done"};
        this.config.fixVersions["path"]                         = ["fields", "fixVersions"];
        this.config.designer["path"]                            = ["fields", "reporter"];
        this.config.developer["path"]                           = ["fields", "assignee"];
        this.config.tester["path"]                              = ["fields", "customfield_10539"];
        this.config.programPlanCommitDate["path"]               = ["fields", "customfield_11308"];
        this.config.designerActualCommitTestDate["path"]        = ["fields", "customfield_11409"];
        this.config.testPlanEndDate["path"]                     = ["fields", "customfield_11312"];
    }
}


class MEPBugFilter extends Config{
    constructor(projectType, issueType){
        super(projectType, issueType);
    }

    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.jiraId["path"]                       = ["key"];
        this.config.category["path"]                    = ["fields", "components"];
        this.config.category["chart"]["visible"]        = false;
        this.config.MEPCategory["path"]                 = ["fields", "customfield_10701"];
        this.config.title["path"]                       = ["fields", "summary"];
        this.config.status["path"]                      = ["fields", "status"];
        this.config.status["JQLValue"]                  = {"开放" : "Open", "重新打开" : "Reopened", "已解决" : "Resolved", "已关闭" : "Closed"};
        this.config.bugPriority["path"]                 = ["fields", "priority"];
        this.config.bugPriority["chart"]["visible"]     = true;
        this.config.bugPhase["path"]                    = ["fields", "customfield_10408"];
        this.config.affectVersions["path"]              = ["fields", "versions"];
        this.config.fixVersions["path"]                 = ["fields", "fixVersions"];
        this.config.epicId["path"]                      = ["fields", "customfield_10102"];
        this.config.epicId["visible"]                   = false;
        this.config.fixedChangeset["path"]              = ["fields", "customfield_10703"];
    }
}