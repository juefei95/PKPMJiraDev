/*
产品设计提交逾期报告
*/

import { AbstractReport }               from "./abstractReport.js"
import { ULView }                       from "./unorderedListView.js"
import { diffDays, date2String }        from "../model/toolSet.js"
import { Issue }                  from "../model/issue.js";



export class DocCommitDelayReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }

    // 根据判断条件生成报告
    _updateContent(event){

        let tbValues = this._getToolBarValues(event);
        let items = {};
        for (const issue of this.model.getIssues()) {
            let docPlanCommitDate = issue.getDocPlanCommitDate();
            let designer = issue.getDesigner(); 
            let status = issue.getStatus();
            if (designer !== Issue.emptyText && status === "需求待设计" && docPlanCommitDate !== Issue.invalidDate && diffDays(new Date(), docPlanCommitDate) > tbValues.delayDays) {
                let jiraId = issue.getJiraId();
                let title = issue.getTitle();
                (items[designer] ||= []).push({
                    "jiraId" : {
                        "link" : "https://jira.pkpm.cn/browse/",
                        "value" : jiraId,
                    },
                    "planDate" : {
                        "text" : "，计划日期",
                        "value" : date2String(docPlanCommitDate),
                    },
                    "title" : {
                        "text" : "标题为",
                        "value" : title,
                    }
                });
            }
        }
        // 按计划提验日期排序
        for (const [k,v] of Object.entries(items)) {
            v.sort(((a,b) => {
                if (a.planDate < b.planDate) {
                    return -1;
                }
                if (a.planDate > b.planDate) {
                    return 1;
                }
                return 0;
            }));
        }

        this.content = new ULView(this.ids.content, items);
        this.content.updateView();
    }
}