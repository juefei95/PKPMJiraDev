/*
研发提验逾期报告
*/

import { AbstractReport }               from "./abstractReport.js"
import { ULView }                       from "./unorderedListView.js"
import { diffDays, date2String }        from "./../model/toolSet.js"
import { Issue }                  from "./../model/issue.js";

export class DeveloperCommitDelayReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }


    // 根据判断条件生成报告
    _updateContent(event){

        let tbValues = this._getToolBarValues(event);
        let items = {};
        for (const issue of this.model.getIssues()) {
            if (issue.getStatus() === "研发中"){
                let programPlanCommitDate = issue.getProgramPlanCommitDate();
                let designer = issue.getDesigner();
                if (programPlanCommitDate !== Issue.invalidDate && designer !== Issue.emptyText && diffDays(new Date(), programPlanCommitDate) > tbValues.delayDays) {
                    let developer = issue.getDeveloper();
                    let jiraId = issue.getJiraId();
                    let title = issue.getTitle();
                    (items[designer] ||= []).push({
                        "jiraId" : {
                            "link" : "https://jira.pkpm.cn/browse/",
                            "value" : jiraId,
                        },
                        "developer" : {
                            "text" : "研发",
                            "value" : developer,
                        },
                        "planDate" : {
                            "text" : "计划提测日期",
                            "value" : date2String(programPlanCommitDate),
                        },
                        "title" : {
                            "text" : "标题为",
                            "value" : title,
                        }
                    });
                }
            }
        }
        // 按计划提验日期排序
        for (const [k,v] of Object.entries(items)) {
            v.sort(((a,b) => {
                if (a.planDate.value < b.planDate.value) {
                    return -1;
                }
                if (a.planDate.value > b.planDate.value) {
                    return 1;
                }
                return 0;
            }));
        }

        this.content = new ULView(this.ids.content, items);
        this.content.updateView();
    }
}