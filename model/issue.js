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
}