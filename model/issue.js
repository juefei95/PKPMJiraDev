/*
这里管理的是跨项目的，通用的字段定义。这个定义和具体使用的是哪个字段无关
*/

import { cloneDate }          from "../model/toolSet.js"

export class Issue{

    static emptyText = undefined;
    static invalidDate = undefined;
    // 获得通用的字段定义
    static getValidFields(){
        return [
            "projName",
            "issueType",
            "jiraId",
            "category",
            "MEPCategory",
            "affectVersions",
            "fixVersions",
            "title",
            "status",
            "reporter",
            "assignee",
            "designer",
            "developer",
            "confluenceLink",
            "docDraftPlanCommitDate",               // 产品设计初稿计划提交的日期
            "docDraftActualCommitDate",             // 产品设计初稿实际提交的日期
            "docPlanReviewDate",                    // 产品设计计划评审通过的日期
            "docActualReviewDate",                  // 产品设计实际评审通过的日期
            "docPlanCommitDate",                    // 产品设计计划提交的日期
            "docActualCommitDate",                  // 产品设计实际提交的日期
            "testCasePlanCommitDate",               // 测试用例计划评审通过日期
            "testCaseActualCommitDate",             // 测试用例实际评审通过日期
            "programPlanCommitDate",                // 研发计划提交产品验证日期
            "programActualCommitDate",              // 研发实际提交产品验证日期
            "designerPlanCommitTestDate",           // 产品验证通过，计划提测日期
            "designerActualCommitTestDate",         // 产品验证通过，实际提测日期
            "testPlanStartDate",                    // 测试计划开始日期
            "testActualStartDate",                  // 测试实际开始日期
            "testPlanEndDate",                      // 测试计划结束日期
            "testActualEndDate",                    // 测试实际结束日期
            "bugPriority",
            "bugSeverity",
            "bugPhase",
            "epicId",
            "fixedChangeset",
            "testComment",
            "tester",
            "resolution",
            "resolvePerson",
            "createDate",
            "resolutionDate",
        ];
    }

    // 该字段是不是日期相关的
    static isDateField(field){
        return [
            "docDraftPlanCommitDate",               // 产品设计初稿计划提交的日期
            "docDraftActualCommitDate",             // 产品设计初稿实际提交的日期
            "docPlanCommitDate",                    // 产品设计计划提交的日期
            "docActualCommitDate",                  // 产品设计实际提交的日期
            "docPlanReviewDate",                    // 产品设计计划评审通过的日期
            "docActualReviewDate",                  // 产品设计实际评审通过的日期
            "testCasePlanCommitDate",               // 测试用例计划评审通过日期
            "testCaseActualCommitDate",             // 测试用例实际评审通过日期
            "programPlanCommitDate",                // 研发计划提交产品验证日期
            "programActualCommitDate",              // 研发实际提交产品验证日期
            "designerPlanCommitTestDate",           // 产品验证通过，计划提测日期
            "designerActualCommitTestDate",         // 产品验证通过，实际提测日期
            "testPlanStartDate",                    // 测试计划开始日期
            "testActualStartDate",                  // 测试实际开始日期
            "testPlanEndDate",                      // 测试计划结束日期
            "testActualEndDate",                    // 测试实际结束日期
            "createDate",
            "resolutionDate",
        ].includes(field);
    }

    constructor(issueJson){
        this.issue = issueJson;
    }
    

    // 设置日期字段的值
    setDateField(field, newDate){
        if(newDate instanceof Date && Issue.isDateField(field)){
            this.issue[field] = newDate;
        }
    }

    getRawIssue(){
        return this.issue;
    }
    
    getAttr(key){
        if (key in this.issue) {
            return this.issue[key]
        }else{
            return undefined;
        }
    }

    getJiraId(){
        return this.issue.jiraId;
    }

    getCategory(){
        return this.issue.category;
    }

    getTitle(){
        return this.issue.title;
    }

    getStatus(){
        return this.issue.status;
    }

    getAssignee(){
        return this.issue.assignee;
    }

    getDesigner(){
        return this.issue.designer;
    }

    getDeveloper(){
        return this.issue.developer;
    }

    getTester(){
        return this.issue.tester;        
    }


    getDocPlanCommitDate(){
        return cloneDate(this.issue.docPlanCommitDate);
    }

    getDocPlanReviewDate(){
        return cloneDate(this.issue.docPlanReviewDate);
    }

    // 程序计划体验时间
    getProgramPlanCommitDate(){
        return cloneDate(this.issue.programPlanCommitDate);
    }

    getCreateDate(){
        return cloneDate(this.issue.createDate);
    }

    /**
     * 返回issue的changelog里最后一次出现某个状态的日期
     * @param {string} status 状态名
     * @returns Date or undefined
     */
    getLastStatusDate(status){
        if ("changelog" in this.issue) {
            for (let index = this.issue.changelog.length  - 1; index >= 0; index--) {
                const items = this.issue.changelog[index].items;
                for (let index2 = 0; index2<items.length; index2++){
                    if (items[index2].field === "status" && items[index2].toString === status){
                        let date = this.issue.changelog[index].date;
                        return cloneDate(date);
                    }
                }
            }
        }
        return undefined;
    }

    
    // 第一次出现某个状态的日期
    getFirstStatusDate(status){
        if ("changelog" in this.issue) {
            for (let index = 0; index < this.issue.changelog.length; index++) {
                const items = this.issue.changelog[index].items;
                for (let index2 = 0; index2<items.length; index2++){
                    if (items[index2].field === "status" && items[index2].toString === status){
                        let status = items[index2].toString;
                        let date = this.issue.changelog[index].date;
                        return cloneDate(date);
                    }
                }
            }
        }
        return undefined;
    }

    
    // 产品设计结束时间
    getDesignEndDate(){
        let toDesign = this.getLastStatusDate("待研发");
        let designing = this.getLastStatusDate("研发中");
        return toDesign ? toDesign : designing;
    }

    // 研发结束时间
    getDevelopEndDate(){
        return this.getLastStatusDate('已提测');
    }

    // 测试结束时间
    getTestEndDate(){
        return this.getLastStatusDate('测试完成');
    }

    // Bug是否解决
    isBugResolved(){
        return ["已解决", "已关闭", "Blocked"].includes(this.getStatus())
    }

    getBugResolveDateAndPerson(){
        if (!this.isBugResolved()) return [undefined, undefined];
            
        for (let i = this.issue.changelog.length  - 1; i >= 0; i--) {
            for (let j = 0; j < this.issue.changelog[i].items.length; j++){
                if (this.issue.changelog[i].items[j].field === "status" && ["Resolved","Blocked"].includes(this.issue.changelog[i].items[j].toString)) {
                    let name = this.issue.changelog[i].author;
                    let date = this.issue.changelog[i].date;
                    return [name, cloneDate(date)];
                }
            }
        }
        return [undefined, undefined];
    }

    
    // Bug的最后一次复测失败情况
    getBugLastRetestFailInfo(){
        let mark = false;
        let date = undefined;
        let developer = undefined;
        let tester = undefined;
        for (let i=this.issue.changelog.length - 1; i >= 0; i--){
            for (let j=0; j<this.issue.changelog[i].items.length; j++){
                if (!mark) {
                    if (this.issue.changelog[i].items[j].field === "status" &&
                        this.issue.changelog[i].items[j].fromString === "Resolved" &&
                        this.issue.changelog[i].items[j].toString !== "Closed"
                    ){
                        mark = true;
                        date = this.issue.changelog[i].date;
                        tester = this.issue.changelog[i].author;
                    }
                }else{
                    if (this.issue.changelog[i].items[j].field === "status" &&
                        this.issue.changelog[i].items[j].toString === "Resolved"
                    ){
                        developer = this.issue.changelog[i].author;
                        return [developer, tester, cloneDate(date)];
                    }
                }
            }
        }
        return [undefined, undefined, undefined];
    }
}