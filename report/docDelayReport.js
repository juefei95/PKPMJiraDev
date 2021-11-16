/*
产品设计提交逾期报告
*/

import { AbstractReport }               from "./abstractReport.js"
import { ULView }                       from "./unorderedListView.js"
import { diffDays, date2String }        from "../model/toolSet.js"
import { Issue }                  from "../model/issue.js";



export class DocDelayReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }

    // 根据判断条件生成报告
    _updateContent(event){

        let tbValues = this._getToolBarValues(event);
        let items = {};
        for (const issue of this.model.getIssues()) {
            let designer = issue.getDesigner(); 
            let status = issue.getStatus();
            if (tbValues.delayType == "提交逾期") {
                if (designer !== Issue.emptyText && (status === "需求待设计" || status === "需求设计中")){
                    let jiraId = issue.getJiraId();
                    let title = issue.getTitle();
                    let docPlanCommitDate = issue.getDocPlanCommitDate();
                    if (docPlanCommitDate !== Issue.invalidDate && diffDays(new Date(), docPlanCommitDate) > tbValues.delayDays) {
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
                    }else if(docPlanCommitDate === Issue.invalidDate) {
                        (items[designer] ||= []).push({
                            "jiraId" : {
                                "link" : "https://jira.pkpm.cn/browse/",
                                "value" : jiraId,
                            },
                            "planDate" : {
                                "text" : "，计划日期",
                                "value" : "没有填写计划日期",
                            },
                            "title" : {
                                "text" : "标题为",
                                "value" : title,
                            }
                        });
                    }
                }
            }else if(tbValues.delayType == "评审逾期"){
                let jiraId = issue.getJiraId();
                let title = issue.getTitle();
                let docPlanReviewDate = issue.getDocPlanReviewDate();
                if (designer !== Issue.emptyText && status === "需求待评审"){
                    if (docPlanReviewDate !== Issue.invalidDate && diffDays(new Date(), docPlanReviewDate) > tbValues.delayDays) {
                        (items[designer] ||= []).push({
                            "jiraId" : {
                                "link" : "https://jira.pkpm.cn/browse/",
                                "value" : jiraId,
                            }, 
                            "planDate" : {
                                "text" : "，计划日期",
                                "value" : date2String(docPlanReviewDate),
                            },
                            "title" : {
                                "text" : "标题为",
                                "value" : title,
                            }
                        });
                    }else if (docPlanReviewDate === Issue.invalidDate){
                        (items[designer] ||= []).push({
                            "jiraId" : {
                                "link" : "https://jira.pkpm.cn/browse/",
                                "value" : jiraId,
                            }, 
                            "planDate" : {
                                "text" : "，计划日期",
                                "value" : "没有填写计划日期",
                            },
                            "title" : {
                                "text" : "标题为",
                                "value" : title,
                            }
                        });
                    }
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