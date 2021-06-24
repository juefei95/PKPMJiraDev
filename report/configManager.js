/*
report的配置管理器
*/

import { Issue } from "./../model/issue.js";

// Config 工厂
export function getConfig(projectType, issueType){
    if (projectType === 'JGVIRUS' && issueType === '故事') {
        return new StructStoryReport(projectType, issueType)
    }else if (projectType === 'JGVIRUS' && issueType === '故障') {
        return new StructBugReport(projectType, issueType)
    }else if (projectType === 'PC' && issueType === '故障') {
        return new PCBugReport(projectType, issueType,);
    }else if (projectType === 'PC' && issueType === 'EPIC') {
        return new PCEpicReport(projectType, issueType);
    }else if (projectType === 'BIMMEP' && issueType === '故事') {
        return new MEPStoryReport(projectType, issueType);
    }else if (projectType === 'BIMMEP' && issueType === '故障') {
        return new MEPBugReport(projectType, issueType);
    }
    throw "error: JQL中projectType、issueType有问题"
}

export class Config{
    constructor(issueType){
        this.issueType = issueType;
        this.config = Issue.getConfig();
        this._modifyConfig();     // 给配置补充字段的路径，这个函数由子类实现
    }


    // 获取当前report的展示类集合
    getReports(){
        if (this.issueType === '故事') {
            return {
                "developerCommitDelay" : {
                    "tab" : {
                        "name" : "研发提验逾期",
                    },
                    "report" : {
                        "viewClass" : "DeveloperCommitDelayReport",
                        "toolbar"     : {
                            "delayDays" : {
                                "name" : "逾期天数",
                                "defaultValue" : 1,
                                "parseFunc" : parseInt,
                            },
                        },
                    },
                },
                "docCommitDelay" : {
                    "tab" : {
                        "name" : "产品设计逾期",
                    },
                    "report" : {
                        "viewClass" : "DocCommitDelayReport",
                        "toolbar"     : {
                            "delayDays" : {
                                "name" : "逾期天数",
                                "defaultValue" : 1,
                                "parseFunc" : parseInt,
                            },
                        },
                    },
                },
                "testLongTime" : {
                    "tab" : {
                        "name" : "测试时间过长",
                    },
                    "report" : {
                        "viewClass" : "TestLongTimeReport",
                        "toolbar"     : {
                            "usedDays" : {
                                "name" : "已测试天数",
                                "defaultValue" : 15,
                                "parseFunc" : parseInt,
                            },
                        },
                    },
                },
            };
        }else if(this.issueType === '故障'){

        }
    }


    // 读取哪些字段
    getFieldsDict(){
        let fieldsDict = {};
        for (const [k,v] of Object.entries(this.config)){
            if ("path" in v){
                fieldsDict[k] = v.path;
            }
        }
        return fieldsDict;
    }

}


class StructStoryReport extends Config{
    constructor(projectType, issueType){
        super(issueType);
    }


    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.jiraId["path"]                   = ["key"];
        this.config.category["path"]                = ["fields", "components"];
        this.config.title["path"]                   = ["fields", "summary"];
        this.config.status["path"]                  = ["fields", "status"];
        this.config.designer["path"]                = ["fields", "customfield_10537"];
        this.config.developer["path"]               = ["fields", "customfield_10538"];
        this.config.tester["path"]                  = ["fields", "customfield_10539"];
        this.config.confluenceLink["path"]          = ["fields", "customfield_10713"];
        this.config.docPlanCommitDate["path"]       = ["fields", "customfield_11415"];
        this.config.programPlanCommitDate["path"]   = ["fields", "customfield_11408"];
    }

}

class StructBugReport extends Config{
    constructor(projectType, issueType){
        super(issueType);
    }



    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.jiraId["path"]               = ["key"];
        this.config.category["path"]            = ["fields", "components"];
        this.config.title["path"]               = ["fields", "summary"];
        this.config.status["path"]              = ["fields", "status"];
        this.config.tester["path"]              = ["fields", "reporter"];
        this.config.assignee["path"]            = ["fields", "assignee"];
        this.config.resolution["path"]          = ["fields", "resolution"];
        this.config.resolvePerson["path"]       = ["fields", "customfield_10716"];
        this.config.createDate["path"]          = ["fields", "created"];
        this.config.resolutionDate["path"]      = ["fields", "resolutiondate"];
        this.config.bugPriority["path"]         = ["fields", "customfield_10510"];
    }

}

class PCBugReport extends Config{
    constructor(projectType, issueType){
        super(issueType);
    }

    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.jiraId["path"]               = ["key"];
        this.config.category["path"]            = ["fields", "components"];
        this.config.title["path"]               = ["fields", "summary"];
        this.config.status["path"]              = ["fields", "status"];
        this.config.bugPriority["path"]         = ["fields", "priority"];
        this.config.affectVersions["path"]      = ["fields", "versions"];
        this.config.fixVersions["path"]         = ["fields", "fixVersions"];
        this.config.epicId["path"]              = ["fields", "customfield_10102"];
        this.config.fixedChangeset["path"]      = ["fields", "customfield_10703"];
    }
}

class PCEpicReport extends Config{
    constructor(projectType, issueType){
        super(issueType);
    }

    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.jiraId["path"]                           = ["key"];
        this.config.category["path"]                        = ["fields", "components"];
        this.config.title["path"]                           = ["fields", "summary"];
        this.config.status["path"]                          = ["fields", "status"];
        this.config.designer["path"]                        = ["fields", "reporter"];
        this.config.developer["path"]                       = ["fields", "assignee"];
        this.config.tester["path"]                          = ["fields", "customfield_10901"];
        this.config.programPlanCommitDate["path"]           = ["fields", "customfield_11308"];
        this.config.designerActualCommitTestDate["path"]    = ["fields", "customfield_11409"];
        this.config.testPlanEndDate["path"]                 = ["fields", "customfield_11312"];
        this.config.testComment["path"]                     = ["fields", "customfield_11443"];
    }
}

class MEPStoryReport extends Config{
    constructor(projectType, issueType){
        super(issueType);
    }

    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.jiraId["path"]                               = ["key"];
        this.config.category["path"]                            = ["fields", "components"];
        this.config.MEPCategory["path"]                         = ["fields", "customfield_10701"];
        this.config.title["path"]                               = ["fields", "summary"];
        this.config.status["path"]                              = ["fields", "status"];
        this.config.fixVersions["path"]                         = ["fields", "fixVersions"];
        this.config.designer["path"]                            = ["fields", "reporter"];
        this.config.developer["path"]                           = ["fields", "assignee"];
        this.config.tester["path"]                              = ["fields", "customfield_10539"];
        this.config.programPlanCommitDate["path"]               = ["fields", "customfield_11308"];
        this.config.designerActualCommitTestDate["path"]        = ["fields", "customfield_11409"];
        this.config.testPlanEndDate["path"]                     = ["fields", "customfield_11312"];
    }
}


class MEPBugReport extends Config{
    constructor(projectType, issueType){
        super(issueType);
    }

    // 给配置补充字段的路径，有路径的字段才是需要获取jira数据的字段
    _modifyConfig(){
        this.config.jiraId["path"]                       = ["key"];
        this.config.category["path"]                    = ["fields", "components"];
        this.config.MEPCategory["path"]                 = ["fields", "customfield_10701"];
        this.config.title["path"]                       = ["fields", "summary"];
        this.config.status["path"]                      = ["fields", "status"];
        this.config.bugPriority["path"]                 = ["fields", "priority"];
        this.config.bugPhase["path"]                    = ["fields", "customfield_10408"];
        this.config.affectVersions["path"]              = ["fields", "versions"];
        this.config.fixVersions["path"]                 = ["fields", "fixVersions"];
        this.config.epicId["path"]                      = ["fields", "customfield_10102"];
        this.config.fixedChangeset["path"]              = ["fields", "customfield_10703"];
    }
}