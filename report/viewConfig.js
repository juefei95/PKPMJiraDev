
let bugReportViewConfig = {
    "bugResolveDelay" : {
        "tab" : {
            "name" : "Bug解决逾期",
        },
        "report" : {
            "viewClass" : "BugResolveDelayReport",
            "toolbar"     : {
                "delayDays" : {
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
                    "name" : "逾期天数",
                    "defaultValue" : 1,
                    "parseFunc" : parseInt,
                },
            },
        },
    },
    "docReviewDelay" : {
        "tab" : {
            "name" : "产品设计评审逾期",
        },
        "report" : {
            "viewClass" : "DocReviewDelayReport",
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
    "requirementVerifyLongTime" : {
        "tab" : {
            "name" : "需求验证时间过长",
        },
        "report" : {
            "viewClass" : "RequirementVerifyLongTimeReport",
            "toolbar"     : {
                "usedDays" : {
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
