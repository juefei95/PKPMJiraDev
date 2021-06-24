/*
Bug解决逾期报告
*/

import { AbstractReport }               from "./abstractReport.js"
import { ULView }                       from "./unorderedListView.js"
import { diffDays, date2String }        from "../model/toolSet.js"
import { Issue }                  from "../model/issue.js";



export class BugResolveDelayReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }

    // 根据判断条件生成报告
    _updateContent(event){

        let tbValues = this._getToolBarValues(event);
        let items = {};
        for (const issue of this.model.getIssues()) {
            let isResolved = ["已解决", "已关闭", "Blocked"].includes(issue.getStatus());
            let createdDate = issue.getCreateDate();

            if (!isResolved && diffDays(new Date(), createdDate) > tbValues.delayDays) {
                let jiraId = issue.getJiraId();
                let title = issue.getTitle();
                let tester = issue.getTester();
                let assignee = issue.getAssignee();
                (items[assignee] ||= []).push({
                    "jiraId" : {
                        "link" : "https://jira.pkpm.cn/browse/",
                        "value" : jiraId,
                    },
                    "tester" : {
                        "text" : "测试人",
                        "value" : tester,
                    },
                    "createdDate" : {
                        "text" : "，创建日期",
                        "value" : date2String(createdDate),
                    },
                    "title" : {
                        "text" : "标题为",
                        "value" : title,
                    },
                });
            }
        }
        // 排序
        for (const [k,v] of Object.entries(items)) {
            v.sort(((a,b) => {
                if (a.createdDate < b.createdDate) {
                    return -1;
                }
                if (a.createdDate > b.createdDate) {
                    return 1;
                }
                return 0;
            }));
        }

        this.content = new ULView(this.ids.content, items);
        this.content.updateView();
    }
}