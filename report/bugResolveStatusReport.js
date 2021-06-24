/**
 * Bug解决情况
 */

import { AbstractReport }               from "./abstractReport.js"
import { MultiBarView }                from "./multiBarView.js"
import { diffDays, arrayMultisort }          from "../model/toolSet.js"
import { Issue }                        from "../model/issue.js";



export class BugResolveStatusReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }

    
    // 根据判断条件生成报告
    _updateContent(event){

        let tbValues = this._getToolBarValues(event);
        let bugResolvedStatus = {};
        for (const issue of this.model.getIssues()) {
            const [name, date] = issue.getBugResolveDateAndPerson();
            if (name && date) {
                // 只统计最近解决的Bug
                if (diffDays(new Date(), date) < tbValues.nearDays){
                    if (name in bugResolvedStatus) {
                        bugResolvedStatus[name][0].push(issue.getJiraId());
                    }else{
                        bugResolvedStatus[name] = [[issue.getJiraId()], []];
                    }
                }
            }else{
                const assignee = issue.getAssignee();
                if (assignee in bugResolvedStatus) {
                    bugResolvedStatus[assignee][1].push(issue.getJiraId());
                }else{
                    bugResolvedStatus[assignee] = [[], [issue.getJiraId()]];
                }
            }
        }
        
        const label = Object.keys(bugResolvedStatus);
        let bugUnResolved = [];
        let bugUnResolvedId = [];
        let bugResolved = [];
        let bugResolvedId = [];
        label.forEach(name =>{
            bugResolved.push(bugResolvedStatus[name][0].length);
            bugResolvedId.push(bugResolvedStatus[name][0]);
            bugUnResolved.push(bugResolvedStatus[name][1].length);
            bugUnResolvedId.push(bugResolvedStatus[name][1]);
        });
        arrayMultisort(bugUnResolved, 'SORT_DESC', bugUnResolvedId, bugResolved, bugResolvedId, label);

        let datasets = [{
                label: 'Bug积压情况',
                backgroundColor: "blue",
                data: bugUnResolved,
                issueId: bugUnResolvedId,
            },{
                label: '过去15天Bug解决情况',
                backgroundColor: "green",
                data: bugResolved,
                issueId: bugResolvedId,
            },
        ]

        this.content = new MultiBarView(this.ids.content, label, datasets);
        this.content.updateView();
    }
}