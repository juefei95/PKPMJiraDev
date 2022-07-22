/*
未解决且复测失败的Bug
*/

import { AbstractReport }               from "./abstractReport.js"
import { ULView }                       from "./unorderedListView.js"
import { diffDays, date2String }        from "../model/toolSet.js"
import { Issue }                        from "../model/issue.js"
import { getJiraHost }                  from '../model/toolSet.js' 


export class BugUnresolvedAndRetestFailReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }

    // 根据判断条件生成报告
    _updateContent(event){
        let tbValues = this._getToolBarValues(event);
        let nearDays = tbValues.nearDays
        let items = {};
        for (const issue of this.model.getIssues()) {
            const [developer, tester, retestFailDate] = issue.getBugLastRetestFailInfo();
            if (!issue.isBugResolved()    // 仍未解决的Bug
            && developer && retestFailDate && tester && diffDays(new Date(), retestFailDate) < nearDays){
                
                let jiraId = issue.getJiraId();
                let title = issue.getTitle();
                let tester = issue.getTester();
                (items[developer] ||= []).push({
                    "jiraId" : {
                        "link" : getJiraHost() + "browse/",
                        "value" : jiraId,
                    },
                    "tester" : {
                        "text" : "测试人",
                        "value" : tester,
                    },
                    "retestFailDate" : {
                        "text" : "，复测失败日期",
                        "value" : date2String(retestFailDate),
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
                if (a.retestFailDate.value < b.retestFailDate.value) {
                    return -1;
                }
                if (a.retestFailDate.value > b.retestFailDate.value) {
                    return 1;
                }
                return 0;
            }));
        }
        this.content = new ULView(this.ids.content, items);
        this.content.updateView();
    }
}