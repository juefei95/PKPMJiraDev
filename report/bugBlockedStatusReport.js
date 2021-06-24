/**
 * Bug Block的情况
 */

import { AbstractReport }               from "./abstractReport.js"
import { MultiBarView }                from "./multiBarView.js"
import { diffDays, arrayMultisort }          from "../model/toolSet.js"
import { Issue }                        from "../model/issue.js";



export class BugBlockedStatusReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }

    
    // 根据判断条件生成报告
    _updateContent(event){
        
        let bugBlockedStatus = {};
        for (const issue of this.model.getIssues()) {
            if (issue.getStatus() === "Blocked") {
                let category = issue.getCategory();
                (bugBlockedStatus[category] ||=[]).push(issue.getJiraId())
            }
        }
        
        const label = Object.keys(bugBlockedStatus);
        let bugBlocked = [];
        let bugBlockedId = [];
        label.forEach(name =>{
            bugBlocked.push(bugBlockedStatus[name].length);
            bugBlockedId.push(bugBlockedStatus[name]);
        });

        let datasets = [{
                label: 'Bug各模块Blocked情况',
                backgroundColor: "blue",
                data: bugBlocked,
                issueId: bugBlockedId,
            }
        ]
        
        this.content = new MultiBarView(this.ids.content, label, datasets);
        this.content.updateView();
    }
}