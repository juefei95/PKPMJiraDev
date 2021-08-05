/**
 * 根据项目名获取issue的读取方案
 * @param {string} projName 项目名，取的是Jira issue的前面部分，即项目的英文缩写，如结构的是JGVIRUS
 */

import { Issue }  from "./issue.js"

export function getIssueReadScheme(projName, issueType){
    if (["JGVIRUS","STS"].includes(projName)) {
        if (issueType === "故事") {
            return JGIssueReadStoryScheme;
        }else if (issueType === "故障") {
            return JGIssueReadBugScheme;
        }
    }else if (projName === "PC") {
        if (issueType === "Epic") {
            return PCIssueReadStoryScheme;
        }else if (issueType === "故障") {
            return PCIssueReadBugScheme;
        }
    }else if (projName === "BIMMEP") {
        if (issueType === "故事") {
            return MEPIssueReadStoryScheme;
        }else if (issueType === "故障") {
            return MEPIssueReadBugScheme;
        }
    }else if (projName === "PBIMSDETAI") {
        if (issueType === "故事") {
            return PBIMsDetailIssueReadStoryScheme;
        }else if (issueType === "故障") {
            return PBIMsDetailIssueReadBugScheme;
        }
    }

    return DeafaultIssueReadScheme;
}


export class IssueReadScheme{
    constructor(){
        // 这里先写一些通用的语义字段的读取位置
        this.jiraId                 = ["key"];
        this.category               = ["fields", "components"]
        this.title                  = ["fields", "summary"];
        this.status                 = ["fields", "status"];
        this.reporter               = ["fields", "reporter"];
        this.assignee               = ["fields", "assignee"];
        this.affectVersions         = ["fields", "versions"];
        this.fixVersions            = ["fields", "fixVersions"];
        this.resolution             = ["fields", "resolution"];
        this.resolutionDate         = ["fields", "resolutiondate"];
        this.createDate             = ["fields", "created"];
    }

    howToReadField(field){
        return this[field];
    }

    getFieldsForJiraSearch(){
        let validFields = Issue.getValidFields();
        let fieldsForJiraSearch = [];
        for (const field of validFields) {
            if (this[field] && this[field][0] == "fields") {
                fieldsForJiraSearch.push(this[field][1])
            }
        }
        return fieldsForJiraSearch;
    }
}

class JGIssueReadScheme extends IssueReadScheme{
    constructor(issueType){
        super()

        this.designer                = ["fields", "customfield_10537"];
        this.developer               = ["fields", "customfield_10538"];
        if (issueType === "故事") {
            this.tester              = ["fields", "customfield_10539"];
        }else if(issueType === "故障"){
            this.tester              = ["fields", "reporter"];
        }
        this.confluenceLink          = ["fields", "customfield_10713"];
        this.docPlanReviewDate       = ["fields", "customfield_11415"];
        this.programPlanCommitDate   = ["fields", "customfield_11408"];
        this.resolvePerson           = ["fields", "customfield_10716"];
        this.bugPriority             = ["fields", "customfield_10510"];
    }
}

class PCIssueReadScheme extends IssueReadScheme{
    constructor(issueType){
        super()

        this.designer                      = ["fields", "reporter"];
        this.developer                     = ["fields", "assignee"];
        if (issueType === "故障") {      
            this.tester                    = ["fields", "reporter"];
        }else if(issueType === "Epic"){
            this.tester                    = ["fields", "customfield_10901"];
        }      
        this.bugPriority                   = ["fields", "priority"];
        this.epicId                        = ["fields", "customfield_10102"];
        this.fixedChangeset                = ["fields", "customfield_10703"];
        this.testComment                   = ["fields", "customfield_11443"];

        this.docPlanReviewDate              = ["fields", "customfield_11307"];           // 产品设计计划评审通过的日期    
        this.docActualReviewDate            = ["fields", "customfield_11306"];           // 产品设计实际评审通过的日期
        this.testCasePlanCommitDate         = ["fields", "customfield_11310"];           // 测试用例计划评审通过日期
        this.testCaseActualCommitDate       = ["fields", "customfield_11313"];           // 测试用例实际评审通过日期
        this.programPlanCommitDate          = ["fields", "customfield_11308"];           // 研发计划提交产品验证日期
        this.programActualCommitDate        = ["fields", "customfield_11302"];           // 研发实际提交产品验证日期
        this.designerPlanCommitTestDate     = ["fields", "customfield_11434"];           // 产品验证通过，计划提测日期
        this.designerActualCommitTestDate   = ["fields", "customfield_11409"];           // 产品验证通过，实际提测日期
        this.testPlanStartDate              = ["fields", "customfield_11311"];           // 测试计划开始日期
        this.testActualStartDate            = ["fields", "customfield_11304"];           // 测试实际开始日期
        this.testPlanEndDate                = ["fields", "customfield_11312"];           // 测试计划结束日期
        this.testActualEndDate              = ["fields", "customfield_11305"];           // 测试实际结束日期

    }
}

class MEPIssueReadScheme extends IssueReadScheme{
    constructor(issueType){
        super()

        this.MEPCategory                   = ["fields", "customfield_10701"];
        this.designer                      = ["fields", "reporter"];
        this.developer                     = ["fields", "assignee"];
        if (issueType === "故事") {      
            this.tester                    = ["fields", "customfield_10539"];
        }else if(issueType === "故障"){
            this.tester                    = ["fields", "reporter"];
        }      
        this.programPlanCommitDate         = ["fields", "customfield_11308"];
        this.designerActualCommitTestDate  = ["fields", "customfield_11409"];
        this.testPlanEndDate               = ["fields", "customfield_11312"];
        this.bugPriority                   = ["fields", "priority"];
        this.bugPhase                      = ["fields", "customfield_10408"];
        this.epicId                        = ["fields", "customfield_10102"];
        this.fixedChangeset                = ["fields", "customfield_10703"];
    
    }
}


class PBIMsDetailIssueReadScheme extends IssueReadScheme{
    constructor(issueType){
        super()

        this.designer                      = ["fields", "customfield_10537"];
        this.developer                     = ["fields", "customfield_10538"];
        if (issueType === "故事") {      
            this.tester                    = ["fields", "customfield_10539"];
        }else if(issueType === "故障"){
            this.tester                    = ["fields", "reporter"];
        }
        this.docPlanCommitDate             = ["fields", "customfield_11415"];
        this.docPlanReviewDate             = ["fields", "customfield_11307"];
        this.docActualReviewDate           = ["fields", "customfield_11301"];
        this.designerPlanCommitTestDate    = ["fields", "customfield_11309"];   
        this.programActualCommitDate       = ["fields", "customfield_11302"];
    }
}

let DeafaultIssueReadScheme          = new IssueReadScheme();
let JGIssueReadStoryScheme           = new JGIssueReadScheme("故事");
let JGIssueReadBugScheme             = new JGIssueReadScheme("故障");
let PCIssueReadStoryScheme           = new PCIssueReadScheme("Epic");
let PCIssueReadBugScheme             = new PCIssueReadScheme("故障");
let MEPIssueReadStoryScheme          = new MEPIssueReadScheme("故事");
let MEPIssueReadBugScheme            = new MEPIssueReadScheme("故障");
let PBIMsDetailIssueReadStoryScheme  = new PBIMsDetailIssueReadScheme("故事");
let PBIMsDetailIssueReadBugScheme    = new PBIMsDetailIssueReadScheme("故障");