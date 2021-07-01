/**
 * 显示设置
 * 1. 记录用户设置哪些字段显示，哪些字段不显示
 * 2. 根据当前搜索结果，初步给出一个显示方案
 */

import {AbstractModel}      from './../common/model.js'
import {Issue}              from './../model/issue.js'
import { date2String }      from './../model/toolSet.js'
import { GridViewModel }      from './gridVM.js'

export function getViewConfig(issues){
    // 统计项目类型和Issue类型
    let projType = {};
    let issueType = {};
    for (const issue of issues) {
        let p = issue.getAttr("projName");
        p in projType ? projType[p] += 1 : projType[p] = 1;
        let t = issue.getAttr("issueType");
        t in issueType ? issueType[t] += 1 : issueType[t] = 1;
    }
    let mostProj = undefined;
    let mostProjCount = 0;
    let mostIssueType = undefined;
    let mostIssueTypeCount = 0;
    for (const [k,v] of Object.entries(projType)) {
        if (v > mostProjCount) {
            mostProjCount = v;
            mostProj = k;
        }
    }
    for (const [k,v] of Object.entries(issueType)) {
        if (v > mostIssueTypeCount) {
            mostIssueTypeCount = v;
            mostIssueType = k;
        }
    }

    if (["故障"].includes(mostIssueType)) {
        if (["PC"].includes(mostProj)) {
            return new PCBugViewConfig();
        }else if(["JGVIRUS", "STS"].includes(mostProj)){
            return new JGBugViewConfig();
        }else if(["BIMMEP"].includes(mostProj)){
            return new MEPBugViewConfig();
        }
    }else if(["故事", "Epic"].includes(mostIssueType)){
        if (["PC"].includes(mostProj)) {
            return new PCStoryViewConfig();
        }else if(["JGVIRUS", "STS"].includes(mostProj)){
            return new JGStoryViewConfig();
        }else if(["BIMMEP"].includes(mostProj)){
            return new MEPStoryViewConfig();
        }
    }
    return new DefaultViewConfig();
}

export class ViewConfig extends AbstractModel{
    constructor(){
        super("FilterViewConfig");

        //#region  配置各字段的显示
        this["jiraId"] = {
            "grid" : {
                caption: 'ID',
                sortable: true,
                size: '100px',
                render: function (record) {
                    return '<div><a target="_blank" href="https://jira.pkpm.cn/browse/' + record.jiraId + '">' + record.jiraId + '</a></div>';
                }
            }
        };
        
        this["category"] = {
            "chart" : {
                "visible" : true,
            },
            "filter" : {
                type : 'DropDown',
                label : '模块',
                width : '200px',
                placeholder : "请选择模块",
            },
            "grid" : {
                caption: '模块',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.category === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.category + '</div>';
                    }
                },
            }
        };
        this["MEPCategory"] = {
            "chart" : {
                "visible" : false,
            },
            "filter" : {
                type : 'DropDown',
                label : 'MEP专业',
                width : '200px',
                placeholder : "请选择MEP专业",
            },
            "grid" : {
                caption: 'MEP专业',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.MEPCategory === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.MEPCategory + '</div>';
                    }
                },
            },
        };
        this["affectVersions"] = {
            "chart" : {
                "visible" : false,
            },
            "filter" : {
                type : 'DropDown',
                label : '影响版本',
                width : '200px',
                placeholder : "请选择影响版本",
            },
            "grid" : {
                caption: '影响版本',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.affectVersions === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.affectVersions + '</div>';
                    }
                },
            },
        };
        this["fixVersions"] = {
            "chart" : {
                "visible" : false,
            },
            "filter" :  {
                type : 'DropDown',
                label : '修复版本',
                width : '200px',
                placeholder : "请选择修复版本",
            },
            "grid" : {
                caption: '修复版本',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.fixVersions === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.fixVersions + '</div>';
                    }
                },
            },
        };
        this["title"] = {
            "filter" : {
                type : 'Text',
                label : '标题',
                width : '400px',
                placeholder : "请输入标题，回车后过滤",
            },
            "grid" : {
                caption: '标题',
                sortable: true,
                size: '200px',
                render: function (record) {
                    if (record.title === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        if (record.confluenceLink && record.confluenceLink  !== GridViewModel.emptyText) {
                            return '<div><a target="_blank" href="' + record.confluenceLink + '">' + record.title + '</a></div>';
                        }else{
                            return '<div>' + record.title + '</div>';
                        }
                    }
                },
            },
        };
        this["status"] = {
            "chart" : {
                "visible" : true,
            },
            "filter" : {
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
            },
            "grid" : {
                caption: '状态',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.status === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.status + '</div>';
                    }
                },
            },
        };
        this["reporter"] = {
            "chart" : {
                "visible" : false,
            },
            "filter" : {
                type : 'DropDown',
                label : '报告人',
                width : '200px',
                placeholder : "请选择报告人",
            },
            "grid" : {
                caption: '报告人',
                sortable: true,
                size: '60px',
                render: function (record) {
                    if (record.reporter === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.reporter + '</div>';
                    }
                },
            },
        };
        this["assignee"] = {
            "chart" : {
                "visible" : false,
            },
            "filter" : {
                type : 'DropDown',
                label : '指派给',
                width : '200px',
                placeholder : "请选择指派给谁",
            },
            "grid" : {
                caption: '指派给',
                sortable: true,
                size: '60px',
                render: function (record) {
                    if (record.assignee === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.assignee + '</div>';
                    }
                },
            },
        };
        this["designer"] = {
            "chart" : {
                "visible" : false,
            },
            "filter" : {
                type : 'DropDown',
                label : '产品',
                width : '200px',
                placeholder : '请选择产品设计人员',
            },
            "grid" : {
                caption: '产品设计负责人',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.designer === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.designer + '</div>';
                    }
                },
            },
        };
        this["developer"] = {
            "chart" : {
                "visible" : false,
            },
            "filter" : {
                type : 'DropDown',
                label : '研发',
                width : '200px',
                placeholder : '请选择研发人员',
            },
            "grid" :{
                caption: '研发负责人',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.developer === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.developer + '</div>';
                    }
                },
            },
        };
        this["confluenceLink"] = {

        };
        this["docPlanCommitDate"] = {
            "filter" : {
                type : 'DateRange',
                label : '产品计划日期',
                width : '80px',
            },
            "grid" : {
                caption: '产品计划日期',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.docPlanCommitDate === GridViewModel.invalidDate) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + date2String(record.docPlanCommitDate) + '</div>';
                    }
                },
            },
        };
        this["programPlanCommitDate"] = {
            "filter" : {
                type : 'DateRange',
                label : '研发计划提验',
                width : '80px',
            },
            "grid" : {
                caption: '研发计划提验',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.programPlanCommitDate === GridViewModel.invalidDate) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + date2String(record.programPlanCommitDate) + '</div>';
                    }
                },
            },
        };
        this["designerActualCommitTestDate"] = {
            "filter" : {
                type : 'DateRange',
                label : '产品实际提测',
                width : '80px',
            },
            "grid" : {
                caption: '产品实际提测',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.designerActualCommitTestDate === GridViewModel.invalidDate) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + date2String(record.designerActualCommitTestDate) + '</div>';
                    }
                },
            },
        };
        this["testPlanEndDate"] = {
            "filter" : {
                type : 'DateRange',
                label : '测试计划结束',
                width : '80px',
            },
            "grid" : {
                caption: '测试计划结束',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.testPlanEndDate === GridViewModel.invalidDate) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + date2String(record.testPlanEndDate) + '</div>';
                    }
                },
            },
        };
        this["bugPriority"] = {
            "chart" : {
                "visible" : false,
            },
            "filter" : {
                type : 'DropDown',
                label : '优先级',
                width : '200px',
                placeholder : "请选择Bug优先级",
            },
            "grid" : {
                caption: '优先级',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.bugPriority === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.bugPriority + '</div>';
                    }
                },
            },
        };
        this["bugPhase"] = {
            "chart" : {
                "visible" : false,
            },
            "filter" : {
                type : 'DropDown',
                label : '发现阶段',
                width : '200px',
                placeholder : "请选择Bug发现阶段",
            },
            "grid" : {
                caption: '发现阶段',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.bugPhase === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.bugPhase + '</div>';
                    }
                },
            },
        };
        this["epicId"] = {
            "filter" : {
                type : 'Text',
                label : '史诗',
                width : '200px',
                placeholder : "请输入史诗的ID",
            },
            "grid" : {
                caption: '史诗',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.epicId === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div><a target="_blank" href="https://jira.pkpm.cn/browse/' + record.epicId + '">' + record.epicId + '</a></div>';
                    }
                },
            },
        };
        this["fixedChangeset"] = {
            "filter" : {
                type : 'Text',
                label : '变更集',
                width : '150px',
                placeholder : "请输入变更集",
            },
            "grid" : {
                caption: '变更集',
                sortable: true,
                size: '200px',
                render: function (record) {
                    if (record.fixedChangeset === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.fixedChangeset + '</div>';
                    }
                },
            },
        };
        this["testComment"] = {
            "grid" : {
                caption: '测试备注',
                sortable: true,
                size: '200px',
                render: function (record) {
                    if (record.testComment === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.testComment + '</div>';
                    }
                },
            },
        };
        this["tester"] = {
            "chart" : {
                "visible" : false,
            },
            "filter" : {
                type : 'DropDown',
                label : '测试',
                width : '200px',
                placeholder : '请选择测试人员',
            },
            "grid" : {
                caption: '测试负责人',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.tester === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.tester + '</div>';
                    }
                },
            },
        };
        this["resolution"] = {
            "chart" : {
                "visible" : false,
            },
            "filter" : {
                type : 'DropDown',
                label : '解决结果',
                width : '200px',
                placeholder : "请选择解决结果",
            },
            "grid" : {
                caption: '解决结果',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.resolution === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.resolution + '</div>';
                    }
                },
            },
        };
        this["resolvePerson"] = {
            "chart" : {
                "visible" : false,
            },
            "filter" : {
                type : 'DropDown',
                label : '解决人',
                width : '200px',
                placeholder : "请选择解决人",
            },
            "grid" : {
                caption: '解决人',
                sortable: true,
                size: '60px',
                render: function (record) {
                    if (record.resolvePerson === GridViewModel.emptyText) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + record.resolvePerson + '</div>';
                    }
                },
            },
        };
        this["createDate"] = {
            "filter" : {
                type : 'DateRange',
                label : '创建日期',
                width : '80px',
            },
            "grid" : {
                caption: '创建日期',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.createDate === GridViewModel.invalidDate) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + date2String(record.createDate) + '</div>';
                    }
                },
            },
        };
        this["resolutionDate"] = {
            "filter" : {
                type : 'DateRange',
                label : '解决日期',
                width : '80px',
            },
            "grid" : {
                caption: '解决日期',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.resolutionDate === GridViewModel.invalidDate) {
                        return ViewConfig.renderEmptyField();
                    } else {
                        return '<div>' + date2String(record.resolutionDate) + '</div>';
                    }
                },
            },
        };
        //#endregion 配置各字段的显示
    }

    static renderEmptyField(){
        return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
    }

    // 获取当前配置的所有包含grid的key的标题，包括显示的和隐藏的
    getFieldsVisibility(){
        let issueValidFields = Issue.getValidFields();
        let fieldsVisibility = {}
        for (const field of issueValidFields) {
            if ("grid" in this[field]) {    // 可以显示的field一定有grid的定义
                fieldsVisibility[field] = {
                    "visible" : this[field]["visible"] ? true : false,     // 如果有指定visible，且为true，则表示true，否则就是false
                    "caption" : "caption" in this[field]["grid"] ? this[field]["grid"]["caption"] : field,
                };
            }
        }
        return fieldsVisibility;
    }

    // 设置当前配置的Key的Visibility
    setFieldsVisibility(fieldsVisibility){
        let issueValidFields = Issue.getValidFields();
        for (const field of issueValidFields) {
            // 显式的设置了field的visible为true，则记下来；设置为false或者没设置的，都视为false
            if (field in fieldsVisibility && fieldsVisibility[field] && "visible" in fieldsVisibility[field] & fieldsVisibility[field]["visible"]) {
                this[field]["visible"] = true;
            }else{
                this[field]["visible"] = false;
            }
        }
        // 发送消息，选中项变了
        this.trigModelChangeEvent("FieldsVisibility");
    }

    // 获得所有Grid的内容
    getGridsDict(){
        let issueValidFields = Issue.getValidFields();
        let grids = {};
        for (const field of issueValidFields) {
            if ("grid" in this[field]) {
                grids[field] = this[field]["grid"];
            }
        }
        return grids;
    }

    
    getFiltersDict(){
        let issueValidFields = Issue.getValidFields();
        let filters = {};
        for (const field of issueValidFields) {
            if ("grid" in this[field] && "filter" in this[field]) {
                filters[field] = {};
                filters[field]["filter"] = this[field]["filter"];
                filters[field]["chart"] = this[field]["chart"];
            }
        }
        return filters;
    }

    
    // 获取需要展示的chart
    getChartsDict(){
        let issueValidFields = Issue.getValidFields();
        let charts = {};
        for (const field of issueValidFields) {
            if ("grid" in this[field] && "filter" in this[field] && "chart" in this[field]) {
                charts[field] = this[field]["chart"];
            }
        }
        return charts
    }

    /**
    * 设置chart的可见性
    * @param {string} field chart的field
    * @param {bool} visible chart的可见性
    */
    setChartVisibility(field, visible){
        let issueValidFields = Issue.getValidFields();
        if (typeof visible == "boolean" && issueValidFields.includes(field) && "grid" in this[field] && "filter" in this[field] && "chart" in this[field]) {
            this[field]["chart"]["visible"] = visible;
        }
        // 发送消息，选中项变了
        this.trigModelChangeEvent("ChartsVisibility");
    }
}

class DefaultViewConfig extends ViewConfig{
    constructor(){
        super();
        this["jiraId"]["visible"] = true;
        this["category"]["visible"] = true;
        this["title"]["visible"] = true;
        this["status"]["visible"] = true;
        this["reporter"]["visible"] = true;
        this["assignee"]["visible"] = true;
        this["resolution"]["visible"] = true;
        this["createDate"]["visible"] = true;
        this["resolutionDate"]["visible"] = true;
        this["affectVersions"]["visible"] = true;
        this["fixVersions"]["visible"] = true;
    }
}

class JGStoryViewConfig extends ViewConfig{
    constructor(){
        super();
        this["jiraId"]["visible"] = true;
        this["category"]["visible"] = true;
        this["title"]["visible"] = true;
        this["status"]["visible"] = true;
        this["designer"]["visible"] = true;
        this["developer"]["visible"] = true;
        this["docPlanCommitDate"]["visible"] = true;
        this["programPlanCommitDate"]["visible"] = true;
        this["tester"]["visible"] = true;
    }
}


class JGBugViewConfig extends ViewConfig{
    constructor(){
        super();
        this["jiraId"]["visible"] = true;
        this["category"]["visible"] = true;
        this["title"]["visible"] = true;
        this["status"]["visible"] = true;
        this["assignee"]["visible"] = true;
        this["bugPriority"]["visible"] = true;
        this["tester"]["visible"] = true;
        this["resolution"]["visible"] = true;
        this["resolvePerson"]["visible"] = true;
        this["createDate"]["visible"] = true;
        this["resolutionDate"]["visible"] = true;
    }
}

class PCStoryViewConfig extends ViewConfig{
    constructor(){
        super();
        this["jiraId"]["visible"] = true;
        this["category"]["visible"] = true;
        this["title"]["visible"] = true;
        this["status"]["visible"] = true;
        this["designer"]["visible"] = true;
        this["developer"]["visible"] = true;
        this["programPlanCommitDate"]["visible"] = true;
        this["designerActualCommitTestDate"]["visible"] = true;
        this["testPlanEndDate"]["visible"] = true;
        this["testComment"]["visible"] = true;
        this["tester"]["visible"] = true;
    }
}

class PCBugViewConfig extends ViewConfig{
    constructor(){
        super();
        this["jiraId"]["visible"] = true;
        this["category"]["visible"] = true;
        this["affectVersions"]["visible"] = true;
        this["fixVersions"]["visible"] = true;
        this["title"]["visible"] = true;
        this["status"]["visible"] = true;
        this["bugPriority"]["visible"] = true;
        this["fixedChangeset"]["visible"] = true;
    }
}

class MEPStoryViewConfig extends ViewConfig{
    constructor(){
        super();
        this["jiraId"]["visible"] = true;
        this["category"]["visible"] = true;
        this["MEPCategory"]["visible"] = true;
        this["title"]["visible"] = true;
        this["status"]["visible"] = true;
        this["fixVersions"]["visible"] = true;
        this["designer"]["visible"] = true;
        this["developer"]["visible"] = true;
        this["tester"]["visible"] = true;
        this["programPlanCommitDate"]["visible"] = true;
        this["designerActualCommitTestDate"]["visible"] = true;
        this["testPlanEndDate"]["visible"] = true;
    }
}

class MEPBugViewConfig extends ViewConfig{
    constructor(){
        super();
        this["jiraId"]["visible"] = true;
        this["category"]["visible"] = true;
        this["MEPCategory"]["visible"] = true;
        this["title"]["visible"] = true;
        this["status"]["visible"] = true;
        this["affectVersions"]["visible"] = true;
        this["bugPriority"]["visible"] = true;
        this["bugPhase"]["visible"] = true;
        this["affectVersions"]["visible"] = true;
        this["fixVersions"]["visible"] = true;
        this["epicId"]["visible"] = true;
        this["fixedChangeset"]["visible"] = true;
    }
}