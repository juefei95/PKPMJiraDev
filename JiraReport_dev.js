class Issue{
    constructor(i){
        this.issue = i;
    }
    id(){
        return this.issue.recid;
    }
    status(){
        return this.issue.status;
    }
    category(){
        return this.issue.category;
    }
    // 最后一个状态的日期
    lastStatusDate(){
        for (let index = this.issue.changelog.length  - 1; index >= 0; index--) {
            const items = this.issue.changelog[index].items;
            for (let index2 = 0; index2<items.length; index2++){
                if (items[index2].field == "status"){
                    let status = items[index2].toString;
                    let date = this.issue.changelog[index].date;
                    return [status, date];
                }
            }
        }
        return [undefined, undefined];
    }
    // 第一次出现某个状态的日期
    firstStatusDate(status){
        for (let index = 0; index < this.issue.changelog.length; index++) {
            const items = this.issue.changelog[index].items;
            for (let index2 = 0; index2<items.length; index2++){
                if (items[index2].field == "status" && items[index2].toString == status){
                    let status = items[index2].toString;
                    let date = this.issue.changelog[index].date;
                    return date;
                }
            }
        }
        return undefined;
    }
}

class Bug extends Issue{

    constructor(i){
        super(i);
    }
    // Bug经办人
    assignee(){
        return this.issue.assignee_in_bug;
    }
    // Bug的解决日期和解决人
    resolveDatePerson(){
        for (let i = this.issue.changelog.length  - 1; i >= 0; i--) {
            for (let j = 0; j < this.issue.changelog[i].items.length; j++){
                if (this.issue.changelog[i].items[j].field == "status" && this.issue.changelog[i].items[j].toString == "Resolved") {
                    let name = this.issue.changelog[i].author;
                    let date = this.issue.changelog[i].date;
                    return [name, date];
                }
            }
        }
        return [undefined, undefined];
    }
}

class ToolSet{
    // date1-date2的天数
    static diffDays(date1, date2){
        return Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));
    }
}

// 不一致项的基类
class Inconsistency{
    constructor(k){
        this.k = k;
    }
    static check(issue) {
        // do nothing
        return undefined;
    }
    key(){
        return this.k;
    }
    toHtml(){
        return undefined;
    }
}

// 研发逾期
class DeveloperDelay extends Inconsistency {
    constructor(jiraId, title, designer, developer, planDate){
        super(designer);
        this.jiraId = jiraId;
        this.title = title;
        this.developer = developer;
        this.planDate = planDate;
    }
    static check(i){
        if (i.designer !== 'Empty Field' && i.status==="研发中" && i.program_plan_commit_date < new Date().setHours(0,0,0) && i.doc_plan_commit_date.getTime() !== theModel.initStartDate.getTime()) {
            return new DeveloperDelay(i.recid, i.title, i.designer, i.developer, i.program_plan_commit_date);
        }
        return undefined;
    }
    toHtml(){
        
        var html = `
        <b>研发逾期：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> 研发 ${this.developer}，计划提测日期${this.planDate.toISOString().substring(0, 10)}，标题为${this.title}
        `;
        return html;
    }
}

// 产品设计逾期
class DesignerDelay extends Inconsistency {
    constructor(jiraId, title, designer, planDate){
        super(designer);
        this.designer = designer;
        this.jiraId = jiraId;
        this.title = title;
        this.planDate = planDate;
    }
    static check(i){
        if (i.designer !== 'Empty Field' && i.status==="需求待设计" && i.doc_plan_commit_date < new Date().setHours(0,0,0) && i.doc_plan_commit_date.getTime() !== theModel.initStartDate.getTime()) {
            return new DesignerDelay(i.recid, i.title, i.designer, i.doc_plan_commit_date);
        }
        return undefined;
    }
    toHtml(){
        
        var html = `
        <b>产品设计逾期：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> 产品 ${this.designer}，计划日期${this.planDate.toISOString().substring(0, 10)}，标题为${this.title}
        `;
        return html;
    }
}

// 需求验证时间过长
class RequirementVerifyLongTime extends Inconsistency{
    static overdays = 15;      // 超时多少天会计入，可以外部配置
    constructor(jiraId, title, inRequirementVerifyDate, designer){
        super(designer);
        this.jiraId = jiraId;
        this.title = title;
        this.inRequirementVerifyDate = inRequirementVerifyDate;
        this.designer = designer;
    }
    toHtml(){
        
        var html = `
        <b>需求验证时间过长：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> ${this.inRequirementVerifyDate.toISOString().substring(0, 10)}开始需求验证，标题为${this.title}
        `;
        return html;
    }
    static check(i){
        if (i.status==="需求验证" ) {
            const date = new Issue(i).firstStatusDate("需求验证");
            if (ToolSet.diffDays(new Date(), date) > RequirementVerifyLongTime.overdays){
                return new RequirementVerifyLongTime(i.recid, i.title, date, i.designer);
            } 
        }
        return undefined;
    }
}

// 测试时间过长
class TestLongTime extends Inconsistency{
    static overdays = 15;      // 超时多少天会计入，可以外部配置
    constructor(jiraId, title, inTestDate, tester){
        super(tester);
        this.jiraId = jiraId;
        this.title = title;
        this.inTestDate = inTestDate;
        this.tester = tester;
    }
    toHtml(){
        
        var html = `
        <b>测试时间过长：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> ${this.inTestDate.toISOString().substring(0, 10)}开始测试，标题为${this.title}
        `;
        return html;
    }
    static check(i){
        if (i.status==="测试中" ) {
            const [status, date] = new Issue(i).lastStatusDate();
            if (status && date) {
                if (ToolSet.diffDays(new Date(), date) > TestLongTime.overdays){
                    return new TestLongTime(i.recid, i.title, date, i.tester);
                } 
            }
        }
        return undefined;
    }
}

// Bug长时间没有解决
class BugResolveDelay extends Inconsistency {
    constructor(jiraId, title, assignee, category, createDate, status, tester){
        super(assignee);
        this.assignee = assignee;
        this.jiraId = jiraId;
        this.title = title;
        this.category = category;
        this.createDate = createDate;
        this.status = status;
        this.tester = tester;
    }
    static overdays = 15;      // 超时多少天会计入，可以外部配置
    static check(i){
        if (i.assignee_in_bug !== 'Empty Field' 
        && ["开放", "重新打开", "已确认"].includes(i.status)    // 仍未解决的Bug
        && ToolSet.diffDays(new Date(), i.create_date) > BugResolveDelay.overdays){ // 超时
            return new BugResolveDelay(i.recid, i.title, i.assignee_in_bug, i.category, i.create_date, i.status, i.tester_in_bug);
        }
        return undefined;
    }
    toHtml(){
        
        var html = `
        <b>Bug解决逾期：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> ${this.tester} 指派给 ${this.assignee}，创建日期${this.createDate.toISOString().substring(0, 10)}，标题为 ${this.title}
        `;
        return html;
    }
}

// 没有按照约定给Bug标题命名的Bug——【功能名】Bug描述
class BugTitleNotFollowRule extends Inconsistency{
    constructor(jiraId, title, tester){
        super(tester);
        this.jiraId = jiraId;
        this.title = title;
        this.tester = tester;
    }
    static check(i){
        if (i.tester_in_bug !== 'Empty Field' 
        && !/^【.+】.+$/.test(i.title)){ // 标题格式测试不通过
            return new BugTitleNotFollowRule(i.recid, i.title, i.tester_in_bug);
        }
        return undefined;
    }
    toHtml(){
        
        var html = `
        <b>Bug标题不符合规范：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> 标题为 ${this.title}
        `;
        return html;
    }
}

var theConfig = {
    IDS : {
        tabs : "tabs",
        toolbar : "toolbar",
        report : "report",
        DeveloperDelay : "DeveloperDelay",
        DesignerDelay : "DesignerDelay",
        BugResolveDelay : "BugResolveDelay",
        BugResolveDelayDays : "BugResolveDelayDays",
        BugTitleNotFollowRule : "BugTitleNotFollowRule",
        TestLongTime : "TestLongTime",
        TestLongTimeDays : "TestLongTimeDays",
        RequirementVerifyLongTime : "RequirementVerifyLongTime",
        RequirementVerifyLongTimeDays : "RequirementVerifyLongTimeDays",
        BugResolveStatus : "BugResolveStatus",
        BugBlockedStatus : "BugBlockedStatus",
    },
}

var theApp = {
    initFrame : function(){
        theApp._initLayout();
    },
    // private
    _initLayout : function(){
        // 清空Body
        document.body.innerHTML = '';   
        // 创建容器div
        let tabs = document.createElement('div');
        tabs.id = theConfig.IDS.tabs;
        tabs.style.width = "100%";
        document.body.appendChild(tabs);
        let toolbar = document.createElement('div');
        toolbar.id = theConfig.IDS.toolbar;
        document.body.appendChild(toolbar);
        let report = document.createElement('div');
        report.id = theConfig.IDS.report;
        document.body.appendChild(report);

        // 设置tabs
        if (theModel.currentMode == "RequirementReport") {
            $('#'+theConfig.IDS.tabs).w2tabs({
                name: 'tabs',
                active: theConfig.IDS.DeveloperDelay,
                tabs: [
                    { id: theConfig.IDS.DeveloperDelay, text: '研发提测逾期' },
                    { id: theConfig.IDS.DesignerDelay, text: '产品设计逾期' },
                    { id: theConfig.IDS.TestLongTime, text: '测试时间过长' },
                    { id: theConfig.IDS.RequirementVerifyLongTime, text: '需求验证时间过长' },
                ],
                onClick: function (event) {
                    $('#'+theConfig.IDS.toolbar).w2destroy(theConfig.IDS.toolbar);
                    theApp["_Show" + event.target + "ToolBar"]();
                },
            });
    
            // 设置初始的toolbar
            theApp._ShowDeveloperDelayToolBar();
            
        }
        else if (theModel.currentMode == "BugReport") {
            $('#'+theConfig.IDS.tabs).w2tabs({
                name: 'tabs',
                active: theConfig.IDS.BugResolveDelay,
                tabs: [
                    { id: theConfig.IDS.BugResolveDelay, text: 'Bug解决逾期' },
                    { id: theConfig.IDS.BugTitleNotFollowRule, text: 'Bug标题不符规定' },
                    { id: theConfig.IDS.BugResolveStatus, text: 'Bug积压和解决情况' },
                    { id: theConfig.IDS.BugBlockedStatus, text: 'Bug各模块Blocked情况' },
                ],
                onClick: function (event) {
                    $('#'+theConfig.IDS.toolbar).w2destroy(theConfig.IDS.toolbar);
                    theApp["_Show" + event.target + "ToolBar"]();
                }
            });
    
            // 设置初始的toolbar
            theApp._ShowBugResolveDelayToolBar();
            
        }
    },
    
    //#region 产品迭代报告 
    // 显示研发逾期的工具条
    _ShowDeveloperDelayToolBar : function(){
        theApp._ShowDeveloperDelayReport();
    },
    // 显示研发逾期的报告
    _ShowDeveloperDelayReport : function(){
        let show = new ULViewQAInconsistency();
        show.show(DeveloperDelay.check, theConfig.IDS.report);
    },
    // 产品设计逾期
    _ShowDesignerDelayToolBar : function(){
        theApp._ShowDesignerDelayReport();
    },
    _ShowDesignerDelayReport : function(){
        new ULViewQAInconsistency().show(DesignerDelay.check, theConfig.IDS.report);
    },
    // 需求验证太长时间
    _ShowRequirementVerifyLongTimeToolBar : function(){
        $('#'+theConfig.IDS.toolbar).w2toolbar({
            name: theConfig.IDS.toolbar,
            items: [
                { type: 'break' },
                { type: 'html',
                    html: function (item) {
                        var html =`
                            <div style="padding: 3px 10px;">
                            逾期天数:<input id="${theConfig.IDS.RequirementVerifyLongTimeDays}" value=${RequirementVerifyLongTime.overdays} size="10" style="padding: 3px; border-radius: 2px; border: 1px solid silver"/>
                            </div>
                        `;
                        return html;
                    }
                },
                { type: 'break' },
                { type: 'button', text: '应用', onClick : theApp._ShowRequirementVerifyLongTimeReport },
                { type: 'break' },
            ],
            onRender: function(event) {
                event.onComplete = theApp._ShowRequirementVerifyLongTimeReport();
                
            },
        });        
    },
    _ShowRequirementVerifyLongTimeReport : function(){
        let days = parseInt($("#"+theConfig.IDS.RequirementVerifyLongTimeDays).val());
        if ($.isNumeric(days)) RequirementVerifyLongTime.overdays = days;
        new ULViewQAInconsistency().show(RequirementVerifyLongTime.check, theConfig.IDS.report);
    },
    // 测试中太长时间
    _ShowTestLongTimeToolBar : function(){
        $('#'+theConfig.IDS.toolbar).w2toolbar({
            name: theConfig.IDS.toolbar,
            items: [
                { type: 'break' },
                { type: 'html',
                    html: function (item) {
                        var html =`
                            <div style="padding: 3px 10px;">
                            逾期天数:<input id="${theConfig.IDS.TestLongTimeDays}" value=${TestLongTime.overdays} size="10" style="padding: 3px; border-radius: 2px; border: 1px solid silver"/>
                            </div>
                        `;
                        return html;
                    }
                },
                { type: 'break' },
                { type: 'button', text: '应用', onClick : theApp._ShowTestLongTimeReport },
                { type: 'break' },
            ],
            onRender: function(event) {
                event.onComplete = theApp._ShowTestLongTimeReport();
                
            },
        });        
    },
    _ShowTestLongTimeReport : function(){
        let days = parseInt($("#"+theConfig.IDS.TestLongTimeDays).val());
        if ($.isNumeric(days)) TestLongTime.overdays = days;
        new ULViewQAInconsistency().show(TestLongTime.check, theConfig.IDS.report);
    },
    //#endregion 产品迭代报告 

    
    //#region 测试迭代报告
    // Bug解决逾期
    _ShowBugResolveDelayToolBar : function(){
        $('#'+theConfig.IDS.toolbar).w2toolbar({
            name: theConfig.IDS.toolbar,
            items: [
                { type: 'break' },
                { type: 'html',
                    html: function (item) {
                        var html =`
                            <div style="padding: 3px 10px;">
                            逾期天数:<input id="${theConfig.IDS.BugResolveDelayDays}" value=${BugResolveDelay.overdays} size="10" style="padding: 3px; border-radius: 2px; border: 1px solid silver"/>
                            </div>
                        `;
                        return html;
                    }
                },
                { type: 'break' },
                { type: 'button', text: '应用', onClick : theApp._ShowBugResolveDelayReport },
                { type: 'break' },
            ],
            onRender: function(event) {
                event.onComplete = theApp._ShowBugResolveDelayReport();
                
            },
        });        
    },
    _ShowBugResolveDelayReport : function(){
        let days = parseInt($("#"+theConfig.IDS.BugResolveDelayDays).val());
        if ($.isNumeric(days)) BugResolveDelay.overdays = days;
        new ULViewQAInconsistency().show(BugResolveDelay.check, theConfig.IDS.report);
    },
    // Bug标题不符合规范
    _ShowBugTitleNotFollowRuleToolBar : function(){
        theApp._ShowBugTitleNotFollowRuleReport();
    },
    _ShowBugTitleNotFollowRuleReport : function(){
        new ULViewQAInconsistency().show(BugTitleNotFollowRule.check, theConfig.IDS.report);
    },
    // Bug积压和解决情况
    _ShowBugResolveStatusToolBar : function(){
        theApp._ShowBugResolveStatusReport();
    },
    _ShowBugResolveStatusReport : function(){
        let bugResolvedStatus = {};
        theModel.issues.forEach(i => {
            let bug = new Bug(i);
            try {
                const [name, date] = bug.resolveDatePerson();
                if (name && date) {
                    // 只统计最近解决的Bug
                    if (ToolSet.diffDays(new Date(), date) < 15){
                        if (name in bugResolvedStatus) {
                            bugResolvedStatus[name][0].push(bug.id());
                        }else{
                            bugResolvedStatus[name] = [[bug.id()], []];
                        }
                    }
                }else if (bug.status() != "Blocked"){   // 忽略Blocked的Bug，Blocked的Bug另外展示
                    const assignee = bug.assignee();
                    if (assignee in bugResolvedStatus) {
                        bugResolvedStatus[assignee][1].push(bug.id());
                    }else{
                        bugResolvedStatus[assignee] = [[], [bug.id()]];
                    }
                }
            } catch (error) {
                let s = "Bug" + bug.id() + "获取解决情况出错。";
                console.error(s);
            }
        });
        const label = Object.keys(bugResolvedStatus);
        let bugUnResolved = [];
        let bugUnResolvedId = [];
        let bugResolved = [];
        let bugResolvedId = [];
        label.forEach(name =>{
            bugResolved.push(bugResolvedStatus[name][0].length);
            bugResolvedId.push(bugResolvedStatus[name][0]);
            bugUnResolved.push(bugResolvedStatus[name][1].length);
            bugUnResolvedId.push(bugResolvedStatus[name][1]);
        });
        
        $("#"+theConfig.IDS.report).empty();
        let canvas = document.createElement("canvas");
        $("#"+theConfig.IDS.report).append(canvas);
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: label,
                datasets: [{
                        label: 'Bug积压情况',
                        backgroundColor: "blue",
                        data: bugUnResolved,
                        issueId: bugUnResolvedId,
                    },{
                        label: '过去15天Bug解决情况',
                        backgroundColor: "green",
                        data: bugResolved,
                        issueId: bugResolvedId,
                    },
                ],
            },
            options: {
                responsive: true,
                //maintainAspectRatio: true,
                //showTooltips: true,
                //tooltips: {
                //    enabled: true,
                //    mode: 'nearest',
                //    callbacks: {
                //        //title: function(tooltipItems, data) { 
                //        //    return "helo";
                //        //},
                //        label: function(tooltipItem, data) {
                //            return '<a href="www.baidu.com">hel</a>';
                //        },
                //    }
                //}, 
                scales: {
                    yAxes: [{
                        ticks: {
                            precision: 0
                        }
                    }]
                },
                onClick: function (e, data) {
                    let bar = this.getElementAtEvent(e)[0];
                    if (bar) {
                        let index = bar._index;
                        let datasetIndex = bar._datasetIndex;
                        let issueIds = bar._chart.data.datasets[datasetIndex].issueId[index];
                        let url = encodeURI("https://jira.pkpm.cn/issues/?jql=key in ("+issueIds.join(",")+") ORDER BY createdDate ASC");
                        window.open(url, '_blank').focus();
                    }
                }
            }
        });
    },
    // Bug各模块Blocked的情况
    _ShowBugBlockedStatusToolBar : function(){
        theApp._ShowBugBlockedStatusReport();
    },
    _ShowBugBlockedStatusReport : function(){
        let bugBlockedStatus = {};
        theModel.issues.forEach(i => {
            let bug = new Bug(i);
            try {
                if (bug.status() === "Blocked") {
                    let category = bug.category();
                    if (category in bugBlockedStatus) {
                        bugBlockedStatus[category].push(bug.id());
                    }else{
                        bugBlockedStatus[category] = [bug.id()];
                    }
                }
            } catch (error) {
                let s = "Bug" + bug.id() + "获取Blocked情况出错。";
                console.error(s);
            }
        });

        const label = Object.keys(bugBlockedStatus);
        let bugBlocked = [];
        let bugBlockedId = [];
        label.forEach(name =>{
            bugBlocked.push(bugBlockedStatus[name].length);
            bugBlockedId.push(bugBlockedStatus[name]);
        });
        
        $("#"+theConfig.IDS.report).empty();
        let canvas = document.createElement("canvas");
        $("#"+theConfig.IDS.report).append(canvas);
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: label,
                datasets: [{
                        label: 'Bug各模块Blocked情况',
                        backgroundColor: "blue",
                        data: bugBlocked,
                        issueId: bugBlockedId,
                    },
                ],
            },
            options: {
                responsive: true,
                //maintainAspectRatio: true,
                //showTooltips: true,
                //tooltips: {
                //    enabled: true,
                //    mode: 'nearest',
                //    callbacks: {
                //        //title: function(tooltipItems, data) { 
                //        //    return "helo";
                //        //},
                //        label: function(tooltipItem, data) {
                //            return '<a href="www.baidu.com">hel</a>';
                //        },
                //    }
                //},  
                scales: {
                    yAxes: [{
                        ticks: {
                            precision: 0
                        }
                    }]
                },
                onClick: function (e, data) {
                    let bar = this.getElementAtEvent(e)[0];
                    if (bar) {
                        let index = bar._index;
                        let datasetIndex = bar._datasetIndex;
                        let issueIds = bar._chart.data.datasets[datasetIndex].issueId[index];
                        let url = encodeURI("https://jira.pkpm.cn/issues/?jql=key in ("+issueIds.join(",")+") ORDER BY createdDate ASC");
                        window.open(url, '_blank').focus();
                    }
                }
            }
        });
    },
    //#endregion 测试迭代报告
};

// 列表展示QA不一致项
class ULViewQAInconsistency{
    show(checkFunc, reportId){
        let qaInconsistency = {};
        theModel.issues.forEach(i => {
            let ret = checkFunc(i);
            if (ret){
                if(ret.key() in qaInconsistency){
                    qaInconsistency[ret.key()].push(ret);
                }else{
                    qaInconsistency[ret.key()] = [ret];
                }
            }
        });
        let ul = document.createElement("ul");
        for (const [k, v] of Object.entries(qaInconsistency)){
            let li = document.createElement("li");
            li.innerText = k;
            {
                let li_ui = document.createElement("ul");
                v.forEach(function(x){
                    let li_ui_li = document.createElement("li");
                    li_ui_li.innerHTML = x.toHtml();
                    li_ui.appendChild(li_ui_li);
                });
                li.appendChild(li_ui)
            }
            ul.appendChild(li)
        }
        $("#"+reportId).empty();
        $("#"+reportId).append(ul);
    }
}