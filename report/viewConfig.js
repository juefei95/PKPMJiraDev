
function parseRadio(radioName){
    const rbs = document.querySelectorAll(`input[name="${radioName}"]`);
    let selectedValue;
    for (const rb of rbs) {
        if (rb.checked) {
            selectedValue = rb.value;
            break;
        }
    }
    return selectedValue;
}

let bugReportViewConfig = {
    "bugResolveDelay" : {
        "tab" : {
            "name" : "Bug解决逾期",
        },
        "report" : {
            "viewClass" : "BugResolveDelayReport",
            "toolbar"     : {
                "delayDays" : {
                    "type" : "input",
                    "name" : "逾期天数",
                    "defaultValue" : 15,
                    "parseFunc" : parseInt,
                },
            },
        },
    },
    "bugTitleNotFollowRule" : {
        "tab" : {
            "name" : "Bug标题不符合规定",
        },
        "report" : {
            "viewClass" : "BugTitleNotFollowRuleReport",
        },
    },
    "bugResolveStatus" : {
        "tab" : {
            "name" : "Bug积压和解决情况",
        },
        "report" : {
            "viewClass" : "BugResolveStatusReport",
            "toolbar"     : {
                "nearDays" : {
                    "type" : "input",
                    "name" : "统计最近多少天解决的Bug",
                    "defaultValue" : 15,
                    "parseFunc" : parseInt,
                },
            },
        },
    },
    "bugBlockedStatus" : {
        "tab" : {
            "name" : "Bug各模块Blocked情况",
        },
        "report" : {
            "viewClass" : "BugBlockedStatusReport",
        },
    },
    "bugRetestStatus" : {
        "tab" : {
            "name" : "需要复测的Bug",
        },
        "report" : {
            "viewClass" : "BugRetestStatusReport",
        },
    },
    "bugUnresolvedByCategory" : {
        "tab" : {
            "name" : "各模块未解决Bug情况",
        },
        "report" : {
            "viewClass" : "BugUnresolvedByCategoryReport",
            "toolbar"     : {
                "nearDays" : {
                    "type" : "input",
                    "name" : "统计最近多少天未解决的Bug",
                    "defaultValue" : 15,
                    "parseFunc" : parseInt,
                },
            },
        },
    },
    "bugUnresolvedAndRetestFail" : {
        "tab" : {
            "name" : "未解决且复测失败的Bug",
        },
        "report" : {
            "viewClass" : "BugUnresolvedAndRetestFailReport",
            "toolbar"     : {
                "nearDays" : {
                    "type" : "input",
                    "name" : "统计最近多少天未解决的Bug",
                    "defaultValue" : 15,
                    "parseFunc" : parseInt,
                },
            },
        },
    },
};
let storyReportViewConfig = {
    "developerCommitDelay" : {
        "tab" : {
            "name" : "研发提验逾期",
        },
        "report" : {
            "viewClass" : "DeveloperCommitDelayReport",
            "toolbar"     : {
                "delayDays" : {
                    "type" : "input",
                    "name" : "逾期天数",
                    "defaultValue" : 1,
                    "parseFunc" : parseInt,
                },
            },
        },
    },
    "docDelay" : {
        "tab" : {
            "name" : "产品设计逾期",
        },
        "report" : {
            "viewClass" : "DocDelayReport",
            "toolbar"     : {
                "delayDays" : {
                    "type" : "input",
                    "name" : "逾期天数",
                    "defaultValue" : 1,
                    "parseFunc" : parseInt,
                },
                "delayType" : {
                    "type" : "radio",
                    "name" : "逾期类型",
                    "value" : ["提交逾期", "评审逾期"],
                    "defaultValue" : "评审逾期",
                    "parseFunc" : parseRadio,
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
                    "type" : "input",
                    "name" : "已测试天数",
                    "defaultValue" : 15,
                    "parseFunc" : parseInt,
                },
            },
        },
    },
    "requirementVerifyLongTime" : {
        "tab" : {
            "name" : "需求验证时间过长",
        },
        "report" : {
            "viewClass" : "RequirementVerifyLongTimeReport",
            "toolbar"     : {
                "usedDays" : {
                    "type" : "input",
                    "name" : "已验证天数",
                    "defaultValue" : 15,
                    "parseFunc" : parseInt,
                },
            },
        },
    },
    "storyTimeline" : {
        "tab" : {
            "name" : "项目进展报告",
        },
        "report" : {
            "viewClass" : "StoryTimelineReport",
            "toolbar"     : {
                "timelineDateRange" : {
                    "type" : "dateRange",
                    "name" : "起止时间",
                },
            },
        },
    },
    "dateDiff" : {
        "tab" : {
            "name" : "日期差异比较",
        },
        "report" : {
            "viewClass" : "DateDiffReport",
            "toolbar"     : {
                "date1" : {
                    "type" : "select",
                    "options" : {
                        "产品设计计划提交" : "docPlanCommitDate",           
                        "产品设计实际提交" : "docActualCommitDate",         
                        "产品设计计划评审" : "docPlanReviewDate",           
                        "产品设计实际评审" : "docActualReviewDate",         
                        "测试用例计划评审" : "testCasePlanCommitDate",      
                        "测试用例实际评审" : "testCaseActualCommitDate",    
                        "研发计划提验"     : "programPlanCommitDate",       
                        "研发实际提验"     : "programActualCommitDate",     
                        "产品计划提测"     : "designerPlanCommitTestDate",  
                        "产品实际提测"     : "designerActualCommitTestDate",
                        "测试计划开始"     : "testPlanStartDate",           
                        "测试实际开始"     : "testActualStartDate",         
                        "测试计划结束"     : "testPlanEndDate",             
                        "测试实际结束"     : "testActualEndDate",           
                    },
                    "name" : "日期1",
                    "defaultValue" : ["测试用例实际评审", "testCaseActualCommitDate"],
                },
                "date2" : {
                    "type" : "select",
                    "options" : {
                        "产品设计计划提交" : "docPlanCommitDate",           
                        "产品设计实际提交" : "docActualCommitDate",         
                        "产品设计计划评审" : "docPlanReviewDate",           
                        "产品设计实际评审" : "docActualReviewDate",         
                        "测试用例计划评审" : "testCasePlanCommitDate",      
                        "测试用例实际评审" : "testCaseActualCommitDate",    
                        "研发计划提验"     : "programPlanCommitDate",       
                        "研发实际提验"     : "programActualCommitDate",     
                        "产品计划提测"     : "designerPlanCommitTestDate",  
                        "产品实际提测"     : "designerActualCommitTestDate",
                        "测试计划开始"     : "testPlanStartDate",           
                        "测试实际开始"     : "testActualStartDate",         
                        "测试计划结束"     : "testPlanEndDate",             
                        "测试实际结束"     : "testActualEndDate",           
                    },
                    "name" : "减 日期2",
                    "defaultValue" : ["研发计划提验", "programPlanCommitDate"],
                },
                "daysDiffRange" : {
                    "type" : "inputRange",
                    "name" : "在几天范围内",
                    "defaultValue" : [-2, 5],
                    "parseFunc" : parseInt,
                },
                "person" : {
                    "type" : "select",
                    "options" : {
                        "产品" : "designer",           
                        "研发" : "developer",         
                        "测试" : "tester",           
                        "报告人" : "reporter",         
                        "指派给" : "assignee",       
                    },
                    "name" : "按谁来统计",
                    "defaultValue" : ["产品", "designer"],
                },
                "apply" : {
                    "type" : "applyButton",
                },
                "copyToConf" : {
                    "type" : "button",
                    "name" : "复制到Confluence",
                },
            },
        },
    },
};


// 获取当前report的展示类集合
export function getViewConfig(issues){
    
    // 统计项目类型和Issue类型
    let projType = {};
    let issueType = {};
    for (const issue of issues) {
        let p = issue.getAttr("projName");
        p in projType ? projType[p] += 1 : projType[p] = 1;
        let t = issue.getAttr("issueType");
        t in issueType ? issueType[t] += 1 : issueType[t] = 1;
    }
    let mostProj = undefined;
    let mostProjCount = 0;
    let mostIssueType = undefined;
    let mostIssueTypeCount = 0;
    for (const [k,v] of Object.entries(projType)) {
        if (v > mostProjCount) {
            mostProjCount = v;
            mostProj = k;
        }
    }
    for (const [k,v] of Object.entries(issueType)) {
        if (v > mostIssueTypeCount) {
            mostIssueTypeCount = v;
            mostIssueType = k;
        }
    }

    if (["故障"].includes(mostIssueType)) {
        return bugReportViewConfig;
    }else if(["故事", "Epic"].includes(mostIssueType)){
        return storyReportViewConfig;
    }else{
        return undefined;
    }
}
