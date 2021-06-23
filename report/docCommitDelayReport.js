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
                    "jiraId" : jiraId,
                    "planDate" : docPlanCommitDate,
                    "title" : title,
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
        // 输出
        let itemsOutput = {};
        for (const [k,v] of Object.entries(items)) {
            for (const ii of v) {
                (itemsOutput[k] ||= []).push(`
                <a href="https://jira.pkpm.cn/browse/${ii.jiraId}"  target="_blank">${ii.jiraId}</a> ，计划日期${date2String(ii.planDate)}，标题为${ii.title}
                `);
            }
        }


        this.content = new ULView(this.ids.content, itemsOutput);
        this.content.updateView();
    }
}