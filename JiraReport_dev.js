
class ToolSet{
    // date1-date2的天数
    static diffDays(date1, date2){
        return Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));
    }
}

// 不一致项的基类
class Inconsistency{
    constructor(responsible){
        this.responsible = responsible;
    }
    static check(issue) {
        // do nothing
        return undefined;
    }
    Responsible(){
        return this.responsible;
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
        <b>产品设计逾期：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> 产品 ${this.responsible}，计划日期${this.planDate.toISOString().substring(0, 10)}，标题为${this.title}
        `;
        return html;
    }
}

// Bug长时间没有解决
class BugResolveDelay extends Inconsistency {
    constructor(jiraId, title, assignee, category, createDate, status, tester){
        super(assignee);
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
        <b>Bug解决逾期：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> ${this.tester} 指派给 ${this.responsible}，创建日期${this.createDate.toISOString().substring(0, 10)}，标题为${this.title}
        `;
        return html;
    }
}

var theApp = {
    config : {
        "RequirementReport" : {
            "checkFuncs" : [
                DeveloperDelay.check,
                DesignerDelay.check,
            ],
        },
        "BugReport" : {
            "checkFuncs" : [
                BugResolveDelay.check,
            ],
        },
    },
    initFrame : function(){
        //let copyBtn = document.createElement("button");
        //copyBtn.onclick = function(){
        //    const blobInput = new Blob([document.body.innerHTML], {type: 'text/html'});
        //    const clipboardItemInput = new ClipboardItem({'text/html' : blobInput});
        //    navigator.clipboard.write([clipboardItemInput]);
        //};
        //document.appendChild(copyBtn);
        let qaInconsistency = {};
        let checkFuncs = theApp.config[theModel.currentMode]["checkFuncs"];
        theModel.issues.forEach(i => {
            checkFuncs.forEach(f => {
                let ret = f(i);
                if (ret){
                    if(ret.Responsible() in qaInconsistency){
                        qaInconsistency[ret.Responsible()].push(ret);
                    }else{
                        qaInconsistency[ret.Responsible()] = [ret];
                    }
                }
            });
        });
        document.body.innerHTML = '';   // 清空Body
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
        window.document.body.appendChild(ul);
    },

};