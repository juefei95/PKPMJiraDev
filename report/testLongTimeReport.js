/*
测试时间过长报告
*/

import { AbstractReport }               from "./abstractReport.js"
import { ULView }                       from "./unorderedListView.js"
import { diffDays, date2String }        from "../model/toolSet.js"
import { Issue }                        from "../model/issue.js"
import { getJiraHost }                  from '../model/toolSet.js'



export class TestLongTimeReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }


    // 根据判断条件生成报告
    _updateContent(event){

        let tbValues = this._getToolBarValues(event);
        let items = {};
        for (const issue of this.model.getIssues()) {
            let status = issue.getStatus();
            if (status === "测试中"){
                let testDate = issue.getLastStatusDate("测试中")
                if (testDate && diffDays(new Date(), testDate) > tbValues.usedDays) {
                    let jiraId = issue.getJiraId();
                    let title = issue.getTitle();
                    let tester = issue.getTester();
                    (items[tester] ||= []).push({
                        "jiraId" : {
                            "link" : getJiraHost() + "browse/",
                            "value" : jiraId,
                        },
                        "testDate" : {
                            "text" : "开始测试日期为",
                            "value" : date2String(testDate),
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
                if (a.testDate.value < b.testDate.value) {
                    return -1;
                }
                if (a.testDate.value > b.testDate.value) {
                    return 1;
                }
                return 0;
            }));
        }

        this.content = new ULView(this.ids.content, items);
        this.content.updateView();
    }
}