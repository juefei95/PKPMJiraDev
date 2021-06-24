/*
需求验证时间过长报告
*/

import { AbstractReport }               from "./abstractReport.js"
import { ULView }                       from "./unorderedListView.js"
import { diffDays, date2String }        from "../model/toolSet.js"
import { Issue }                        from "../model/issue.js";



export class RequirementVerifyLongTimeReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }

    
    // 根据判断条件生成报告
    _updateContent(event){

        let tbValues = this._getToolBarValues(event);
        let items = {};
        for (const issue of this.model.getIssues()) {
            let status = issue.getStatus();
            if (status === "需求验证"){
                let verifyDate = issue.getFirstStatusDate("需求验证")
                if (verifyDate && diffDays(new Date(), verifyDate) > tbValues.usedDays) {
                    let jiraId = issue.getJiraId();
                    let title = issue.getTitle();
                    let designer = issue.getDesigner();
                    (items[designer] ||= []).push({
                        "jiraId" : {
                            "link" : "https://jira.pkpm.cn/browse/",
                            "value" : jiraId,
                        },
                        "verifyDate" : {
                            "text" : "开始需求验证日期为",
                            "value" : date2String(verifyDate),
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
                if (a.verifyDate.value < b.verifyDate.value) {
                    return -1;
                }
                if (a.verifyDate.value > b.verifyDate.value) {
                    return 1;
                }
                return 0;
            }));
        }

        this.content = new ULView(this.ids.content, items);
        this.content.updateView();
    }
}