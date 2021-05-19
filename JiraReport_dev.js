
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
    // 显示研发逾期的工具条
    _ShowDeveloperDelayToolBar : function(){
        theApp._ShowDeveloperDelayReport();
    },
    // 显示研发逾期的报告
    _ShowDeveloperDelayReport : function(){
        let show = new ULView();
        show.show(DeveloperDelay.check, theConfig.IDS.report);
    },
    // 产品设计逾期
    _ShowDesignerDelayToolBar : function(){
        theApp._ShowDesignerDelayReport();
    },
    _ShowDesignerDelayReport : function(){
        new ULView().show(DesignerDelay.check, theConfig.IDS.report);
    },
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
        new ULView().show(BugResolveDelay.check, theConfig.IDS.report);
    },
    // Bug标题不符合规范
    _ShowBugTitleNotFollowRuleToolBar : function(){
        theApp._ShowBugTitleNotFollowRuleReport();
    },
    _ShowBugTitleNotFollowRuleReport : function(){
        new ULView().show(BugTitleNotFollowRule.check, theConfig.IDS.report);
    },
};


class ULView{
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