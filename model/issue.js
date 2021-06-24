/*
这里管理的是跨项目的，通用的字段定义。这个定义和具体使用的是哪个字段无关
*/


export class Issue{

    static emptyText = "Empty Field";
    static invalidDate = new Date('1999-01-01');
    // 获得通用的字段定义
    static getConfig(){
        return {
            "jiraId" : {},
            "category" : {},
            "MEPCategory" : {},
            "affectVersions" : {},
            "fixVersions" : {},
            "title" : {},
            "status" : {},
            "assignee" :{},
            "designer" : {},
            "developer" : {},
            "tester" : {},
            "confluenceLink" : {},
            "docPlanCommitDate" : {},
            "programPlanCommitDate" : {},
            "designerActualCommitTestDate" : {},
            "testPlanEndDate" : {},
            "bugPriority" : {},
            "bugPhase" : {},
            "epicId": {},
            "fixedChangeset": {},
            "testComment" :{},
            "tester" : {},
            "resolution" :{},
            "resolvePerson" :{},
            "createDate" :{},
            "resolutionDate" :{},
        };;
    }

    constructor(issueJson){
        this.issue = issueJson;
    }
    
    getRawIssue(){
        return this.issue;
    }
    
    getAttr(key){
        let getFunc = "get" + key[0].toUpperCase() + key.slice(1,key.length);
        if (getFunc in Issue.prototype) {
            return Issue.prototype[getFunc].call(this);
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

    getMEPCategory(){
        return this.issue.MEPCategory;
    }

    getAffectVersions(){
        return this.issue.affectVersions;
    }

    getFixVersions(){
        return this.issue.fixVersions;
    }

    getTitle(){
        return this.issue.title;
    }

    getConfluenceLink(){
        return this.issue.confluenceLink;
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
        return this.issue.docPlanCommitDate;
    }

    // 程序计划体验时间
    getProgramPlanCommitDate(){
        return this.issue.programPlanCommitDate;
    }

    getDesignerActualCommitTestDate(){
        return this.issue.designerActualCommitTestDate;
    }

    getTestPlanEndDate(){
        return this.issue.testPlanEndDate;
    }

    getBugPriority(){
        return this.issue.bugPriority;
    }

    getBugPhase(){
        return this.issue.bugPhase;
    }

    getEpicId(){
        return this.issue.epicId;
    }

    getFixedChangeset(){
        return this.issue.fixedChangeset;
    }

    getTestComment(){
        return this.issue.testComment;
    }

    getResolution(){
        return this.issue.resolution;
    }

    getResolvePerson(){
        return this.issue.resolvePerson;
    }

    getCreateDate(){
        return this.issue.createDate;
    }

    getResolutionDate(){
        return this.issue.resolutionDate;
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
                        return date;
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
                        return date;
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
}