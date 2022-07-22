/*
Bug标题不符合规定报告
*/

import { AbstractReport }               from "./abstractReport.js"
import { ULView }                       from "./unorderedListView.js"
import { Issue }                        from "../model/issue.js"
import { getJiraHost }                  from '../model/toolSet.js'


export class BugTitleNotFollowRuleReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }

    // 根据判断条件生成报告
    _updateContent(event){
        let items = {};
        for (const issue of this.model.getIssues()) {
            let notFollowRule = !/^【.+】.+$/.test(issue.getTitle());

            if (notFollowRule) {
                let jiraId = issue.getJiraId();
                let title = issue.getTitle();
                let tester = issue.getTester();
                (items[tester] ||= []).push({
                    "jiraId" : {
                        "link" : getJiraHost() + "browse/",
                        "value" : jiraId,
                    },
                    "title" : {
                        "text" : "标题为",
                        "value" : title,
                    },
                });
            }
        }

        this.content = new ULView(this.ids.content, items);
        this.content.updateView();
    }
}