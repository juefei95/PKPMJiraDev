var theToolSet = {
    // 获取当前JQL的所有Issues
    getCurrentIssues : async function(fields){
        let jql = theToolSet.getCurrentJQL();
        let issues = await theToolSet._fetchJqlIssues(jql, fields, 1000);
        return issues.issues;
    },
    // 获取JQL的Issues
    getJQLIssues : async function(fields, jql){
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
    _fetchJqlIssues : function(jql, fields, maxResults){
        return fetch('https://jira.pkpm.cn/rest/api/2/search/', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify({jql: jql,
                                maxResults : maxResults,
                                fields: fields,
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
    currentMode : 'Requirements',       // Requirements or Bugs
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
    },           // 所有可能使用字段的定义
    issues : [],
    filter : {},
    initModel : async function(){
        // 获得所有需要fields
        let fieldsNeedSearch = [];
        for (const f of theView[theModel.currentMode].fields){
            if (theModel.fields[f].nameInFields != null){
                fieldsNeedSearch.push(theModel.fields[f].nameInFields);
            }
        }
        let searchedIssues = await theToolSet.getJQLIssues(window.jql, fieldsNeedSearch)
        // 更新所有field的数据
        for (const i of searchedIssues){
            let issue = {};
            for (const field of theView[theModel.currentMode].fields){
                issue[field] = theModel.fields[field].fnGetDataFromIssue(i);
            }
            theModel.issues.push(issue);
        }
        // 给filterView建立数据
        for (const f of Object.keys(theView[theModel.currentMode].filter)){
            if (theView[theModel.currentMode].filter[f].type == 'DropDown'){
                theModel.filter[f + 'Set']         = new Set();
                theModel.filter[f + 'Selected']         = new Set();
            }else if(theView[theModel.currentMode].filter[f].type == 'Text'){
                theModel.filter[f + 'Selected']       = "";
            }else if(theView[theModel.currentMode].filter[f].type == 'DateRange'){
                theModel.filter[f + 'Selected']       = [theToolSet.date2String(theModel.initStartDate), theToolSet.date2String(theModel.initEndDate)];
            }
        }
        for (const issue of theModel.issues) {
            for (const [k, v] of Object.entries(theView[theModel.currentMode].filter)){
                if (issue[k] && v.type == 'DropDown'){
                    theModel.filter[k + 'Set'].add(issue[k]);
                }
            }
        }
    },
    // 设置当前模式，是需求展示还是Bug展示
    setMode : function(mode){
        theModel.currentMode = mode;
    },
    // 无效日期的定义
    invalidDate : new Date('1999-01-01'),
    initStartDate : new Date('1999-01-01'),
    initEndDate : new Date('2999-01-01'),

    /*private*/
};


var theApp = {

    showRequirementFrame : function(){
        theModel.setMode('Requirements');
        theApp._initFrame();
    },
    initBugFrame : function(){
        theModel.setMode('Bugs');
        theApp._initFrame();
    },

    /**
     *
     * Description. 更新各个视图
     *
     * @param {Set} notUpdateView     哪些视图不想更新，可能的值('filter', 'grid', 'chart')
     * @return None
     */
    updateView : function(notUpdateView) {
        theGridView.showGrid(); // 显示表格
        theChartView.showChart();
        if(!notUpdateView || !notUpdateView.has('filter')) theFilterView.showFilter();
        theApp._updateLayoutSize();        // 更新布局尺寸
    },


    /**
     *
     * Description. 更新筛选器
     *
     * @param {Object} u     描述筛选器的变化
     *     u.operation - 'add' 某个筛选器添加了u.value
     *                 - 'replace' 某个筛选器完全替换为u.value
     *     u.type      - 'status' 状态筛选器
     *                 - 'designer' 产品设计人员筛选器
     *
     * @return None
     */
    updateFilter : function (u) {
        if (u.operation == 'add') {
            if(theModel.filter[u.type + 'Selected'].has(u.value) == false && theModel.filter[u.type + 'Set'].has(u.value)){
                m[u.type].selected.add(u.value);
            }
        }else if(u.operation == 'replace'){
            if (theView[theModel.currentMode].filter[u.type].type == "Text"){
                theModel.filter[u.type + 'Selected'] = u.value;
            }else if(theView[theModel.currentMode].filter[u.type].type == "DropDown"){
                theModel.filter[u.type + 'Selected'].clear();
                for (const v of u.value){
                    if (theModel.filter[u.type + 'Set'].has(v)) {
                        theModel.filter[u.type + 'Selected'].add(v);
                    }
                }
            }else if(theView[theModel.currentMode].filter[u.type].type == "DateRange"){
                theModel.filter[u.type + 'Selected'] = u.value;
            }
        }
        var notUpdateView = new Set();
        if (u.fromView) notUpdateView.add(u.fromView);
        theApp.updateView(notUpdateView);
    },


    // 重置筛选器，都置为空
    resetFilter : function (){
        for (const  f of  Object.keys(theView[theModel.currentMode].filter)){
            if (theView[theModel.currentMode].filter[f].type == 'DropDown'){
                theModel.filter[f + 'Selected'].clear();
            }else if(theView[theModel.currentMode].filter[f].type == 'Text'){
                theModel.filter[f + 'Selected'] = '';
            }else if(theView[theModel.currentMode].filter[f].type == 'DateRange'){
                theModel.filter[f + 'Selected'] = [theToolSet.date2String(theModel.initStartDate), theToolSet.date2String(theModel.initEndDate)];
            }
        }
        theApp.updateView();
    },



//--------------------private--------------------------
    _initFrame : async function(){
        try{
            await theModel.initModel();
            alert(theModel.issues.length);
            //w2utils.settings.dateFormat = 'yyyy-mm-dd';
            //theApp._initLayout();
        }catch{
            alert('无法获取Jira的数据');
        }
    },
    _initLayout : function(){
        // 删除默认展示的表格
        $('body').empty();
        // 增加新的div用来展示需求跟踪矩阵
        $('body').append(
            '<div id="' + theView.ids.showMatDivId + '" style="width: 100%; height: 100vh;"></div>'
        );
        var _pstyle = 'border: 1px solid #dfdfdf; padding: 5px;';
        var w2uiLayout = {
            name: theView.ids.frameLayout,
            padding: 4,
            panels: [
                { type: 'top', size: 120, resizable: true, style: _pstyle, content: 'top' },
                { type: 'left', size: 350, resizable: true, style: _pstyle, content: 'left' },
                { type: 'main', resizable: true, style: _pstyle, content: 'main' },
            ],
            onResize: function(event) {
            },
        };
        $('#' + theView.ids.showMatDivId).w2layout(w2uiLayout);
        w2ui[theView.ids.frameLayout].content('main', '<div id="' + theView.ids.gridId + '" style="width: 100%; height: 100%"></div>');

        // 左侧Chart区
        var chartH5 = `
            <style>
                #${theView.ids.chartContainer} {
                    list-style-type:none;
                    justify-content: center;
                    padding: 0px;
                }
                #${theView.ids.chartContainer} li{
                    display: list-item;
                    padding: 5px 5px;
                    margin: 0px;
                }
                #${theView.ids.chartContainer} li p{
                    text-align: center;
                }
                #${theView.ids.chartContainer} li div canvas{
                    margin-right: auto;
                    margin-left: auto;
                    display: block;
                }
            </style>
            <ul id="${theView.ids.chartContainer}">
                <li style="list-style-type:none">
                    <p style="font-size: large;font-weight: bold;">以下图片可以拖拽改变排序</p>
                </li>
        `;
        for (const f of Object.values(theView[theModel.currentMode].filter)){
            if (f.hasChart && f.isShowChart){
                chartH5 +=  `
                    <li style="list-style-type:none">
                        <div class="${theView.ids.chartClass}" id="${f.id}Div" style="width: 100%;">
                            <canvas id="${f.id}Canvas"></canvas>
                        </div>
                    </li>
                `;
            }
        }
        chartH5 += '</ul>';
        w2ui[theView.ids.frameLayout].content('left', chartH5);

        var _pstyle2 = 'border: 0px solid #dfdfdf; padding: 0px;';
        var w2uiLayoutInTop = {
            name: theView.ids.topPanelLayout,
            padding: 0,
            panels: [
                { type: 'left', size: 100, resizable: false, style: _pstyle2, content: 'left' },
                { type: 'main', resizable: true, style: _pstyle2, content: 'main' },
            ],
        };
        $().w2layout(w2uiLayoutInTop);
        w2ui[theView.ids.frameLayout].content('top', w2ui[theView.ids.topPanelLayout]);

        // Top里的Filter
        w2ui[theView.ids.topPanelLayout].content('left', `
            <div style="float:left;margin:4px">
                <button class="w2ui-btn" id="resetFilter">重置筛选 </button>
            </div>
        `);
        var filterH5 = `
			<div id='${theView.ids.filterContainerId}'>
			<style>
				#filterContainer div {
					//height: 30px;
					margin-bottom: 10px;
				}
				#filterContainer label {	/* label的高度保证和#filterContainer div一致，以实现label居中 */ 
					//line-height: 30px;
				}
				#filterContainer input:not([type="checkbox"]) {
					margin: 0px;
					padding: 0px;
					width: 100%;
					outline: none;
					height: 30px;
					border-radius: 5px;
				}
				#filterContainer select {
					margin: 0px;
					padding: 0px;
					width: 100%;
					outline: none;
					//height: 30px;
					border-radius: 5px;
                }
				#filterContainer .select2-search {
					width: auto;    /*让输入框不再另占一行*/
                }
				  
			</style>
		`;
        for (const f of Object.values(theView[theModel.currentMode].filter)){
            if (f.type == "DropDown"){
                filterH5 += `
					<div style="display:inline-block;">
						<div style="display:inline;margin:4px;">
                        `;
                if (f.hasChart){
                    if (f.isShowChart){
                        filterH5 += `
                            <input type="checkbox" id="${f.id}Check" checked></input>
                            `;
                    }else{
                        filterH5 += `
                            <input type="checkbox" id="${f.id}Check"></input>
                            `;
                    }
                }
                filterH5 += `
							<label for="${f.id}">${f.label}</label>
						</div>
						<div style="display:inline-block;margin:4px;width:${f.width};">
							<select  id="${f.id}" multiple="multiple"/>
						</div>
                    </div>
                `;
            }else if(f.type == "Text"){
                filterH5 += `
					<div style="display:inline-block;">
						<div style="display:inline;margin:4px;">
							<label for="${f.id}">${f.label}</label>
						</div>
						<div style="display:inline-block;margin:4px;width:${f.width};">
							<select id="${f.id}"  multiple="multiple"/>
						</div>
                    </div>
                `;
            }else if(f.type == "DateRange"){
                filterH5 += `
					<div style="display:inline-block;">
						<div style="display:inline;margin:4px;">
							<label for="${f.id}">${f.label}</label>
						</div>
						<div style="display:inline-block;margin:4px;">
                            <input id="${f.id}1" style="width:${f.width};"> - <input id="${f.id}2" style="width:${f.width};">
						</div>
                    </div>
                `;
            }
        }
		filterH5 += '</div>';
		
        w2ui[theView.ids.topPanelLayout].content('main', filterH5);
        w2ui[theView.ids.topPanelLayout].on('render', function(event) {
            event.onComplete = function(){
                // chart可拖拽
                $( "#" + theView.ids.chartContainer ).sortable();
                $( "#" + theView.ids.chartContainer ).disableSelection();

                // 重置筛选绑定回调函数
                $('#resetFilter').on( "click", theApp.resetFilter );
                
                // 绑定点击菜单
                for (const [k, v] of Object.entries(theView[theModel.currentMode].filter)){
                    if (v.type == "DropDown" && 'labelMenu' in v){
                        let menu = [];
                        for (const lm of v.labelMenu){
                            menu.push({
                                name : lm.btnName,
                                title : lm.btnName + '按钮',
                                fun : function(){
                                    theApp.updateFilter({operation:'replace', type: k, value:lm.selects})
                                }
                            });
                        }
                        $('#' + v.id).contextMenu(menu);
                    }
                }
                
                // 绑定Checkbox的回调
                for (const [k, v] of Object.entries(theView[theModel.currentMode].filter)){
                    if (v.type == "DropDown" && v.hasChart){
                        $("#" + v.id + "Check").on('click', function(){
                            if ($("#" + v.id + "Check").is(':checked')){
                                $(`
                                    <li style="list-style-type:none; opacity: 0.25;">
                                        <div class="${theView.ids.chartClass}" id="${v.id}Div" style="width: 100%;">
                                            <canvas id="${v.id}Canvas"></canvas>
                                        </div>
                                    </li>
                                `).insertAfter($( "#" + theView.ids.chartContainer + "> li:first-child" ));
                                
                                $("#" + v.id + "Div").parent().animate({
                                        opacity: 1,
                                    }, 1000, function() {
                                        // Animation complete.
                                });
                                v.isShowChart = true;
                                theChartView.showChart();       // 更新视图
                            }else{
                                
                                $("#" + v.id + "Div").parent().animate({
                                        opacity: 0,
                                    }, 1000, function() {
                                        // Animation complete.
                                    $("#" + v.id + "Div").parent().remove();
                                });
                                v.isShowChart = false;
                            }
                        });
                    }
                }

                // 更新视图
                theApp.updateView();   
            };
        });
    },
    // 更新布局的尺寸，目前只是更新Top Panel的高度
    _updateLayoutSize : function(){
        let height = $('#'+theView.ids.filterContainerId).height();
        let currentHeight = w2ui[theView.ids.frameLayout].get('top').size;
        if (currentHeight - height < 15 || currentHeight - height > 20){
            w2ui[theView.ids.frameLayout].sizeTo('top', height + 15, true);
        }
    },
};
