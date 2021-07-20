/**
 * 让用户选择两个时间字段，并且根据差值来排序
 */

 import { AbstractReport }               from "./abstractReport.js"
 import { ULView }                       from "./unorderedListView.js"
 import { diffDays, date2String }        from "../model/toolSet.js"
 import { Issue }                        from "../model/issue.js";
 
 
 
export class DateDiffReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }

    // 根据判断条件生成报告
    _updateContent(event){
        
        let tbValues = this._getToolBarValues(event);
        let date1Attr = tbValues.date1;
        let date2Attr = tbValues.date2;
        let daysDiffRange = tbValues.daysDiffRange;
        let personAttr = tbValues.person;
        let items = {};
        for (const issue of this.model.getIssues()) {

            let date1 = issue.getAttr(date1Attr[1]);
            let date2 = issue.getAttr(date2Attr[1]);
            let person = issue.getAttr(personAttr[1]);
            
            if (person !== Issue.emptyText && date1 !== Issue.invalidDate && date2 !== Issue.invalidDate &&
                daysDiffRange && diffDays(date1, date2) > daysDiffRange[0] && diffDays(date1, date2) < daysDiffRange[1]) {
                let jiraId = issue.getJiraId();
                let title = issue.getTitle();
                (items[person] ||= []).push({
                    "jiraId" : {
                        "link" : "https://jira.pkpm.cn/browse/",
                        "value" : jiraId,
                    },
                    "title" : {
                        "text" : "标题为",
                        "value" : title,
                    },
                    "date1" : {
                        "text" : date1Attr[0],
                        "value" : date2String(date1),
                    },
                    "date2" : {
                        "text" : date2Attr[0],
                        "value" : date2String(date2),
                    },
                    "daysDiff" : {
                        "text" : "过去了",
                        "value" : diffDays(date1, date2),
                    },
                    "daysText" : {
                        "text" : "天",
                        "value" : "",
                    }
                });
            }
        }
        
        this.content = new ULView(this.ids.content, items);
        this.content.updateView();
    }
}