// ==UserScript==
// @name         Jira Tracker Table
// @namespace    http://jira.pkpm.cn/
// @version      0.1.32
// @description  在Jira的搜索页面展示需求跟踪矩阵
// @author       史建鑫
// @match        http://jira.pkpm.cn/*
// @match        https://jira.pkpm.cn/*
// @run-at       document-idle
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @updateURL    https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/jiraTrackerTable.js
// ==/UserScript==


(function() {
    'use strict';

var theToolSet = {
    // 获取当前JQL的所有Issues
    getCurrentIssues : async function(fields){
        let jql = theToolSet.getCurrentJQL();
        let issues = await theToolSet._fetchJqlIssues(jql, fields, 1000);
        return issues.issues;
    },
    // 统一的Date2String yyyy-mm-dd
    date2String : function(date){
        return date.toISOString().substring(0, 10);
    },
    // 获得当前JQL
    getCurrentJQL : function(){
        // 保证当前是高级状态
        if ($('.switcher-item.active').attr('data-id') == 'basic'){
            $('.switcher-item.active')[0].click();
        }

        return $('#advanced-search').val();
    },
//--------------------private--------------------------
    // 获得当前页面的filter ID
    _getFilterId : function(){
        var url = window.location.href;
        const regexpUrl = /https:\/\/jira.pkpm.cn\/.*\/.*\?filter=([0-9]+)/;
        const match = url.match(regexpUrl);
        return match[1];
    },
    // 获取Filter的Json
    _fetchFilterJson : function(filterId){
        var url = 'https://jira.pkpm.cn/rest/api/2/filter/' + filterId;
        return fetch(url, {
            "method": "GET",
            "headers": {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
            },
            "body": null,
            "referrerPolicy": "strict-origin-when-cross-origin",
            "mode": "cors",
            "credentials": "include"
        }).then(response => response.json());
    },
    // 获取Issues
    // 参考 https://docs.atlassian.com/software/jira/docs/api/REST/7.6.1/#api/2/search-search
    _fetchJqlIssues : function(jql, fields, maxResults){
        let fields2 = fields.filter(f => f != "changelog");
        let expand = fields.includes("changelog") ? ["changelog"] : [];
        return fetch('https://jira.pkpm.cn/rest/api/2/search/', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify({jql: jql,
                                maxResults : maxResults,
                                fields: fields2,
                                expand : expand,
                                }), // must match 'Content-Type' header
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json'
            },
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer
        }).then(response => response.json());
    },
};


var theView = {
    Requirements : {
        fields : [
            "recid",
            "category",
            "title",
            "status",
            "designer",
            "developer",
            "tester",
            "confluence_link",
            "doc_plan_commit_date",
            "program_plan_commit_date",
        ],
        filter : {
            status : {
                type : 'DropDown',
                id : 'statusFilter',
                label : '状态',
                width : '400px',
                placeholder : "请选择状态",
                hasChart : true,
                isShowChart : true,
                labelMenu : [{
                    btnName : "自动选中产品相关状态",
                    selects : ["Backlog", "需求待评审", "需求待设计", "需求设计中", "需求验证"],     
                },{
                    btnName : "自动选中测试相关状态",
                    selects : ["测试完成", "测试中", "已提测"],     
                },{    
                    btnName : "自动选中研发相关状态",
                    selects : ["待研发", "研发中"],        
                }]
            },
            category : {
                type : 'DropDown',
                id : 'categoryFilter',
                label : '模块',
                width : '200px',
                placeholder : "请选择模块",
                hasChart : true,
                isShowChart : true,
            },
            designer : {
                type : 'DropDown',
                id : 'designerFilter',
                label : '产品',
                width : '200px',
                placeholder : '请选择产品设计人员',
                hasChart : true,
                isShowChart : false,
            },
            developer : {
                type : 'DropDown',
                id : 'developerFilter',
                label : '研发',
                width : '200px',
                placeholder : '请选择研发人员',
                hasChart : true,
                isShowChart : false,
            },
            tester : {
                type : 'DropDown',
                id : 'testerFilter',
                label : '测试',
                width : '200px',
                placeholder : '请选择测试人员',
                hasChart : true,
                isShowChart : false,
            },
            title : {
                type : 'Text',
                id : 'titleFilter',
                label : '标题',
                width : '400px',
                placeholder : "请输入标题，回车后过滤",
            },
            doc_plan_commit_date : {
                type : 'DateRange',
                id : 'docPlanCommitDateFilter',
                label : '产品计划日期',
                width : '80px',
            },
            program_plan_commit_date : {
                type : 'DateRange',
                id : 'programPlanCommitDateFilter',
                label : '研发计划日期',
                width : '80px',
            },
        },
        grid : {
            recid : {
                caption: 'ID',
                sortable: true,
                size: '100px',
                render: function (record) {
                    return '<div><a target="_blank" href="https://jira.pkpm.cn/browse/' + record.recid + '">' + record.recid + '</a></div>';
                }
            },
            category : {
                caption: '模块',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.category == "Empty Field") {
                        return '<div><i style="color:#A9A9A9">' + record.category + '</i></div>';
                    } else {
                        return '<div>' + record.category + '</div>';
                    }
                },
            },
            status : {
                caption: '状态',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.status == "Empty Field") {
                        return '<div><i style="color:#A9A9A9">' + record.status + '</i></div>';
                    } else {
                        return '<div>' + record.status + '</div>';
                    }
                },
            },
            title : {
                caption: '标题',
                sortable: true,
                size: '200px',
                render: function (record) {
                    if (record.confluence_link == "Empty Field") {
                        return '<div>' + record.title + '</div>';
                    } else {
                        return '<div><a target="_blank" href="' + record.confluence_link + '">' + record.title + '</a></div>';
                    }
                },
            },
            designer : {
                caption: '产品设计负责人',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.designer == "Empty Field") {
                        return '<div><i style="color:#A9A9A9">' + record.designer + '</i></div>';
                    } else {
                        return '<div>' + record.designer + '</div>';
                    }
                },
            },
            doc_plan_commit_date : {
                caption: '产品计划日期',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.doc_plan_commit_date == theModel.invalidDate) {
                        return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                    } else {
                        return '<div>' + theToolSet.date2String(record.doc_plan_commit_date) + '</div>';
                    }
                },
            },
            developer : {
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
            program_plan_commit_date : {
                caption: '研发计划日期',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.program_plan_commit_date == theModel.invalidDate) {
                        return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                    } else {
                        return '<div>' + theToolSet.date2String(record.program_plan_commit_date) + '</div>';
                    }
                },
            },
            tester : {
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
    },
    Bugs : {
        fields : [
            "recid",
            "category",
            "title",
            "status",
            "tester_in_bug",
            "assignee_in_bug",
            "resolve_person",
            "resolution",
            "create_date",
            "resolution_date",
            "bug_level",
        ],
        filter : {
            status : {
                type : 'DropDown',
                id : 'statusFilter',
                label : '状态',
                width : '400px',
                placeholder : "请选择状态",
                hasChart : true,
                isShowChart : true,
            },
            resolution : {
                type : 'DropDown',
                id : 'resolutionFilter',
                label : '解决结果',
                width : '200px',
                placeholder : "请选择解决结果",
                hasChart : true,
                isShowChart : false,
            },
            category : {
                type : 'DropDown',
                id : 'categoryFilter',
                label : '模块',
                width : '200px',
                placeholder : "请选择模块",
                hasChart : true,
                isShowChart : true,
            },
            assignee_in_bug : {
                type : 'DropDown',
                id : 'assigneeInBugFilter',
                label : '指派给',
                width : '200px',
                placeholder : "请选择指派给谁",
                hasChart : true,
                isShowChart : false,
            },
            tester_in_bug : {
                type : 'DropDown',
                id : 'testerInBugFilter',
                label : '测试',
                width : '200px',
                placeholder : "请选择测试人员",
                hasChart : true,
                isShowChart : false,
            },
            resolve_person : {
                type : 'DropDown',
                id : 'resolvePersonFilter',
                label : '解决人',
                width : '200px',
                placeholder : "请选择解决人",
                hasChart : true,
                isShowChart : false,
            },
            title : {
                type : 'Text',
                id : 'titleFilter',
                label : '标题',
                width : '400px',
                placeholder : "请输入标题，回车后过滤",
            },
            create_date : {
                type : 'DateRange',
                id : 'createDateFilter',
                label : '创建日期',
                width : '80px',
            },
            resolution_date : {
                type : 'DateRange',
                id : 'resolutionDateFilter',
                label : '解决日期',
                width : '80px',
            },
        },
        grid : {
            recid : {
                caption: 'ID',
                sortable: true,
                size: '100px',
                render: function (record) {
                    return '<div><a target="_blank" href="https://jira.pkpm.cn/browse/' + record.recid + '">' + record.recid + '</a></div>';
                }
            },
            category : {
                caption: '模块',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.category == "Empty Field") {
                        return theView._greyout(record.category);
                    } else {
                        return '<div>' + record.category + '</div>';
                    }
                },
            },
            status : {
                caption: '状态',
                sortable: true,
                size: '60px',
                render: function (record) {
                    if (record.status == "Empty Field") {
                        return theView._greyout(record.status);
                    } else {
                        return '<div>' + record.status + '</div>';
                    }
                },
            },
            resolution : {
                caption: '解决结果',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.resolution == "Empty Field") {
                        return theView._greyout(record.resolution);
                    } else {
                        return '<div>' + record.resolution + '</div>';
                    }
                },
            },
            bug_level : {
                caption: '严重等级',
                sortable: true,
                size: '70px',
                render: function (record) {
                    if (record.bug_level == "Empty Field") {
                        return theView._greyout(record.bug_level);
                    } else {
                        return '<div>' + record.bug_level + '</div>';
                    }
                },
            },
            title : {
                caption: '标题',
                sortable: true,
                size: '200px',
                render: function (record) {
                    if (record.title == "Empty Field") {
                        return theView._greyout(record.title);
                    } else {
                        return '<div>' + record.title + '</div>';
                    }
                },
            },
            tester_in_bug : {
                caption: '测试',
                sortable: true,
                size: '60px',
                render: function (record) {
                    if (record.tester_in_bug == "Empty Field") {
                        return theView._greyout(record.tester_in_bug);
                    } else {
                        return '<div>' + record.tester_in_bug + '</div>';
                    }
                },
            },
            assignee_in_bug : {
                caption: '指派给',
                sortable: true,
                size: '60px',
                render: function (record) {
                    if (record.assignee_in_bug == "Empty Field") {
                        return theView._greyout(record.assignee_in_bug);
                    } else {
                        return '<div>' + record.assignee_in_bug + '</div>';
                    }
                },
            },
            resolve_person : {
                caption: '解决人',
                sortable: true,
                size: '60px',
                render: function (record) {
                    if (record.resolve_person == "Empty Field") {
                        return theView._greyout(record.resolve_person);
                    } else {
                        return '<div>' + record.resolve_person + '</div>';
                    }
                },
            },
            create_date : {
                caption: '创建日期',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.create_date == theModel.invalidDate) {
                        return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                    } else {
                        return '<div>' + theToolSet.date2String(record.create_date) + '</div>';
                    }
                },
            },
            resolution_date : {
                caption: '解决日期',
                sortable: true,
                size: '100px',
                render: function (record) {
                    if (record.resolution_date == theModel.invalidDate) {
                        return '<div><i style="color:#A9A9A9">Empty Field</i></div>';
                    } else {
                        return '<div>' + theToolSet.date2String(record.resolution_date) + '</div>';
                    }
                },
            },
        },
    },
    RequirementReport : {
        fields : [
            "recid",
            "category",
            "title",
            "status",
            "designer",
            "developer",
            "tester",
            "confluence_link",
            "doc_plan_commit_date",
            "program_plan_commit_date",
            "changelog",
        ],
    },
    BugReport : {
        fields : [
            "recid",
            "category",
            "title",
            "status",
            "tester_in_bug",
            "assignee_in_bug",
            "resolve_person",
            "resolution",
            "create_date",
            "resolution_date",
            "bug_level",
            "changelog",
        ],
    },
    // 各种控件ID定义
    ids : {
        showVersionId 	                : 'showVersion',                    // 显示版本号
        showRequirementsTraceMatId 	    : 'showRequirementsTraceMat',        // “需求跟踪矩阵”按钮的ID
        showBugMatId                    : 'showBugMat',                     // “Bug矩阵”按钮的ID
        showMatDivId                    : 'showMatDiv',                     // “需求跟踪矩阵”div的ID
        frameLayout                     : 'frameLayout',                    // 最外层级的布局，w2ui的布局名，用来后续引用用
        topPanelLayout                  : 'topPanelLayout',                 // Top Panel的布局，w2ui的布局名，用来后续引用用
        gridId                          : 'grid',
        gridName                        : 'jiraGrid',                       // w2ui grid的名字，用来后续引用
        chartContainer                  : 'chartContainer',                 // chart外围的容器，目前是ul，为了可以拖拽
        chartClass                      : 'chartClass',                     // chart被统一选择的class
        filterContainerId               : 'filterContainer',                // 上面一排Filter的容器Div的Id
    },
    _greyout : function(o){
        return '<div><i style="color:#A9A9A9">' + o + '</i></div>';
    },
};


var theModel = {
    fields : {
        recid  : {
            nameInFields : null,        // 在JQL搜索时，指定的字段
            fnGetDataFromIssue : function(i){return i.key;},     // 如何从issue中获取数据
        },
        category  : {
            nameInFields : 'components',
            fnGetDataFromIssue : function(i){return 'components' in i.fields && i.fields.components.length > 0 ? i.fields.components[0].name : 'Empty Field';},
        },
        title  : {
            nameInFields : 'summary',
            fnGetDataFromIssue : function(i){return i.fields.summary;},
        },
        status  : {
            nameInFields : 'status',
            fnGetDataFromIssue : function(i){return i.fields.status.name;},
        },
        designer  : {
            nameInFields : 'customfield_10537',
            fnGetDataFromIssue : function(i){return 'customfield_10537' in i.fields && i.fields.customfield_10537 !== null ? i.fields.customfield_10537.displayName : 'Empty Field';},
        },
        developer  : {
            nameInFields : 'customfield_10538',
            fnGetDataFromIssue : function(i){return 'customfield_10538' in i.fields && i.fields.customfield_10538 !== null ? i.fields.customfield_10538.displayName : 'Empty Field';},
        },
        tester  : {
            nameInFields : 'customfield_10539',
            fnGetDataFromIssue : function(i){return 'customfield_10539' in i.fields && i.fields.customfield_10539 !== null ? i.fields.customfield_10539.displayName : 'Empty Field';},
        },
        confluence_link  : {
            nameInFields : 'customfield_10713',
            fnGetDataFromIssue : function(i){return 'customfield_10713' in i.fields && i.fields.customfield_10713 !== null ? i.fields.customfield_10713 : 'Empty Field';},
        },
        doc_plan_commit_date  : {
            nameInFields : 'customfield_11415',
            fnGetDataFromIssue : function(i){return 'customfield_11415' in i.fields && i.fields.customfield_11415 !== null ? new Date(i.fields.customfield_11415) : theModel.invalidDate;},
        },
        program_plan_commit_date  : {
            nameInFields : 'customfield_11408',
            fnGetDataFromIssue : function(i){return 'customfield_11408' in i.fields && i.fields.customfield_11408 !== null ? new Date(i.fields.customfield_11408) : theModel.invalidDate;},
        },
        tester_in_bug : {
            nameInFields : 'reporter',
            fnGetDataFromIssue : function(i){return 'reporter' in i.fields && i.fields.reporter !== null ? i.fields.reporter.displayName : 'Empty Field';},
        },
        assignee_in_bug : {
            nameInFields : 'assignee',
            fnGetDataFromIssue : function(i){return 'assignee' in i.fields && i.fields.assignee !== null ? i.fields.assignee.displayName : 'Empty Field';},
        },
        resolve_person : {
            nameInFields : 'customfield_10716',
            fnGetDataFromIssue : function(i){return 'customfield_10716' in i.fields && i.fields.customfield_10716 !== null ? i.fields.customfield_10716.displayName : 'Empty Field';},
        },
        resolution : {
            nameInFields : 'resolution',
            fnGetDataFromIssue : function(i){return 'resolution' in i.fields && i.fields.resolution !== null ? i.fields.resolution.name : 'Empty Field';},
        },
        create_date : {
            nameInFields : 'created',
            fnGetDataFromIssue : function(i){return 'created' in i.fields && i.fields.created !== null ? new Date(i.fields.created.slice(0,10)) : theModel.invalidDate;},
        },
        resolution_date : {
            nameInFields : 'resolutiondate',
            fnGetDataFromIssue : function(i){return 'resolutiondate' in i.fields && i.fields.resolutiondate !== null ? new Date(i.fields.resolutiondate.slice(0,10)) : theModel.invalidDate;},
        },
        bug_level : {
            nameInFields : 'customfield_10510',
            fnGetDataFromIssue : function(i){return 'customfield_10510' in i.fields && i.fields.customfield_10510 !== null ? i.fields.customfield_10510.value : 'Empty Field';},
        },
        changelog : {
            nameInFields : 'changelog',
            fnGetDataFromIssue : function(i){
                let cl = [];
                i.changelog["histories"].forEach(h => {
                    cl.push({
                        "author" :  h["author"]["displayName"],
                        "date" :  new Date(h["created"]),
                        "items" :  h["items"],
                    });
                });
                return cl;
            },
        },
    },           // 所有可能使用字段的定义
    currentMode : 'Requirements',       // Requirements or Bugs
    issues : [],
    filter : {},
    initModel : async function(model){
        // 获得所有需要fields
        let fieldsNeedSearch = [];
        for (const f of theView[model.currentMode].fields){
            if (theModel.fields[f].nameInFields != null){
                fieldsNeedSearch.push(theModel.fields[f].nameInFields);
            }
        }
        let searchedIssues = await theToolSet.getCurrentIssues(fieldsNeedSearch)
        // 更新所有field的数据
        for (const i of searchedIssues){
            let issue = {};
            for (const field of theView[model.currentMode].fields){
                issue[field] = theModel.fields[field].fnGetDataFromIssue(i);
            }
            model.issues.push(issue);
        }
        if ("filter" in theView[model.currentMode]){
            // 给filterView建立数据
            for (const f of Object.keys(theView[model.currentMode].filter)){
                if (theView[model.currentMode].filter[f].type == 'DropDown'){
                    model.filter[f + 'Set']         = new Set();
                    model.filter[f + 'Selected']         = new Set();
                }else if(theView[model.currentMode].filter[f].type == 'Text'){
                    model.filter[f + 'Selected']       = "";
                }else if(theView[model.currentMode].filter[f].type == 'DateRange'){
                    model.filter[f + 'Selected']       = [theToolSet.date2String(model.initStartDate), theToolSet.date2String(model.initEndDate)];
                }
            }
            for (const issue of model.issues) {
                for (const [k, v] of Object.entries(theView[model.currentMode].filter)){
                    if (issue[k] && v.type == 'DropDown'){
                        model.filter[k + 'Set'].add(issue[k]);
                    }
                }
            }
        }
    },

    invalidDate : new Date('1999-01-01'),
    /*private*/
};

class JiraModel{
    constructor(mode){
        this.currentMode = mode;
        this.issues = [];
        this.filter = {};
        // 无效日期的定义
        this.initStartDate = new Date('1999-01-01');
        this.initEndDate = new Date('2999-01-01');
    }
}

var theApp = {
    version : GM_info.script.version,

    modifyWeb : function(){
        // 增加“需求跟踪矩阵”按钮
        $('div.aui-item.search-wrap').append(
			`
			<div class="search-options-container" style="margin-top: 10px;padding: 5px;background-color: #ecedf0;width: 660px;border-radius: 3px;">
				<button id="showRequirementsTraceMat" class="aui-button aui-button-primary" type="button" original-title="需求跟踪矩阵">需求跟踪矩阵</button>
				<span style="display:inline-block; width:12px;"></span>
				<button id="showBugMat" class="aui-button aui-button-primary" type="button" original-title="Bug大屏展示">Bug大屏展示</button>
				<span style="display:inline-block; width:12px;"></span>
				<button id="showRequirementReport" class="aui-button aui-button-primary" type="button" original-title="需求迭代报告">需求迭代报告</button>
				<span style="display:inline-block; width:12px;"></span>
				<button id="showBugReport" class="aui-button aui-button-primary" type="button" original-title="测试迭代报告">测试迭代报告</button>
				<span style="display:inline-block; width:12px;"></span>
				<button id="showVersion" class="aui-button aui-button-primary" type="button" original-title="当前版本">当前版本</button>
				<span style="display:inline-block; width:12px;"></span>
				<a href="https://confluence.pkpm.cn/pages/viewpage.action?pageId=36054515">帮助文档</a>
			</div>
			`
            );
        $('#showRequirementsTraceMat').on( "click", this.initRequirementFrame );
        $('#showBugMat').on( "click", this.initBugFrame );
        $('#showRequirementReport').on( "click", this.initRequirementReportFrame );
        $('#showBugReport').on( "click", this.initBugReportFrame );
        $('#showVersion').on( "click", function(){alert("当前版本为" + theApp.version)} );
    },
    initRequirementFrame : async function(){
        let loadList = [
            // ------------------- 依赖jquery和jquery-ui
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/jquery-2.2.4.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/jquery-ui.min.js",
            // ------------------- 依赖w2ui------------------
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/w2ui_v1.5_modify.min.js?q=1",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/w2ui-1.5.min.css",
            //-------- chart.js，用于chart的绘制，目前必须用2.9版本的，因为chartlabel这个js还没适配V3以上的chart.js--
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/Chart.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/chartjs-plugin-datalabels.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/Chart.min.css",
            // ------------------- 加载 Select2，用于筛选器 ------------------
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/select2.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/select2.min.css",
            //-------- 加载 contextMenu，用于控件菜单--------------
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/contextMenu.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/contextMenu.min.css",
            //-------- 加载 pinyin，用于拼音过滤 -------------
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/pinyin_dict_notone.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/pinyinUtil.js",
            //
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/JiraBI.js?q=7",
        ];
        await theApp.initFrame("Requirements", "需求跟踪矩阵", loadList);
    },
    initBugFrame : async function(){
        let loadList = [
            // ------------------- 依赖jquery和jquery-ui
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/jquery-2.2.4.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/jquery-ui.min.js",
            // ------------------- 依赖w2ui------------------
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/w2ui_v1.5_modify.min.js?q=1",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/w2ui-1.5.min.css",
            //-------- chart.js，用于chart的绘制，目前必须用2.9版本的，因为chartlabel这个js还没适配V3以上的chart.js--
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/Chart.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/chartjs-plugin-datalabels.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/Chart.min.css",
            // ------------------- 加载 Select2，用于筛选器 ------------------
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/select2.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/select2.min.css",
            //-------- 加载 contextMenu，用于控件菜单--------------
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/contextMenu.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/contextMenu.min.css",
            //-------- 加载 pinyin，用于拼音过滤 -------------
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/pinyin_dict_notone.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/pinyinUtil.js",
            //
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/JiraBI.js?q=7",
        ];
        await theApp.initFrame("Bugs", "Bug大屏展示", loadList);
    },
    initRequirementReportFrame : async function(){
        let loadList = [
            // ------------------- 依赖jquery和jquery-ui
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/jquery-2.2.4.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/jquery-ui.min.js",
            // ------------------- 依赖w2ui------------------
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/w2ui_v1.5_modify.min.js?q=1",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/w2ui-1.5.min.css",
            //-------- chart.js，用于chart的绘制，目前必须用2.9版本的，因为chartlabel这个js还没适配V3以上的chart.js--
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/Chart.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/Chart.min.css",

            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/JiraReport.js?q=1",
        ];
        await theApp.initFrame("RequirementReport", "需求迭代报告", loadList);
    },
    initBugReportFrame : async function(){
        let loadList = [
            // ------------------- 依赖jquery和jquery-ui
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/jquery-2.2.4.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/jquery-ui.min.js",
            // ------------------- 依赖w2ui------------------
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/w2ui_v1.5_modify.min.js?q=1",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/w2ui-1.5.min.css",
            //-------- chart.js，用于chart的绘制，目前必须用2.9版本的，因为chartlabel这个js还没适配V3以上的chart.js--
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/Chart.min.js",
            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/Chart.min.css",

            "https://gitlab.it.pkpm.cn/shijianxin/pkpmjiradev/-/raw/main/JiraReport.js?q=1",
        ];
        await theApp.initFrame("BugReport", "测试迭代报告", loadList);
    },
    /* private */
    _infoDisplay : undefined,       // 展示输出信息的element
    _displayInfo : function(info){
        if(theApp._infoDisplay){
            let timestamp = new Date().toLocaleTimeString();
            theApp._infoDisplay(timestamp + info);
        }
    },
    initFrame : async function(modelName, newTabTitle, loadList){
        try{
            let w = window.open();
            if (!w){
                alert("弹出窗口失败，请允许jira.pkpm.cn弹出窗口。");;
                return;
            }
            // 修改新打开页面的title
            let tt = document.createElement("title");
            tt.innerHTML = newTabTitle;
            w.document.head.appendChild(tt);
            // 增加信息展示text
            let p = document.createElement("p");
            w.document.body.appendChild(p);
            theApp._infoDisplay = function(info){
                p.innerHTML += info + '<br>';
            };
            theApp._displayInfo("正在读取Jira数据");
            let model = new JiraModel(modelName);
            await theModel.initModel(model);
            w.theModel = model;
            w.theView = theView;
            theApp._displayInfo("正在加载第三方库");
            for (const s of loadList) {
                await theApp._addPageDepends(w, s);
            }
            w.theApp.initFrame();
        }catch{
            alert('初始化失败');
        }
    },
    _addPageDepends : async function(w, s){
        if (/\.js(\?.*)*$/g.test(s)){
            await theApp._loadScript(w.document.head, s);
        }else if(/\.css(\?.*)*$/g.test(s)){
            await theApp._loadCss(w.document.head, s);
        }
    },
    _loadScript : async function(dom, scriptUrl) {
        theApp._displayInfo(scriptUrl);
        const script = document.createElement('script');
        script.src = scriptUrl;
        dom.appendChild(script);
        
        return new Promise((res, rej) => {
            script.onload = function() {
                res();
            }
            script.onerror = function () {
                rej();
            }
        });
    },
    _loadCss : async function(dom, cssUrl) {
        theApp._displayInfo(cssUrl);
        const link = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = cssUrl;
        link.media = 'all';
        dom.appendChild(link);
        
        return new Promise((res, rej) => {
            link.onload = function() {
                res();
            }
            link.onerror = function () {
                rej();
            }
        });
    },
};

$(document).ready(function() { //When document has loaded

    theApp.modifyWeb();

});



})();