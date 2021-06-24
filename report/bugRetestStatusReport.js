/**
 * Bug 需要复测的情况
 */

import { AbstractReport }               from "./abstractReport.js"
import { MultiBarView }                from "./multiBarView.js"
import { arrayMultisort }          from "../model/toolSet.js"
import { Issue }                        from "../model/issue.js";



export class BugRetestStatusReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }

    
    // 根据判断条件生成报告
    _updateContent(event){
        
        let bugNeedRetest = {};
        for (const issue of this.model.getIssues()) {
            if (issue.getStatus() === "已解决") {
                let tester = issue.getTester();
                (bugNeedRetest[tester] ||=[]).push(issue.getJiraId())
            }
        }

        
        const label = Object.keys(bugNeedRetest);
        let bugNeedRetestNum = [];
        let bugNeedRetestId = [];
        label.forEach(name =>{
            bugNeedRetestNum.push(bugNeedRetest[name].length);
            bugNeedRetestId.push(bugNeedRetest[name]);
        });
        arrayMultisort(bugNeedRetestNum, 'SORT_DESC', bugNeedRetestId, label);

        
        let datasets = [{
                label: '需要复测的Bug情况',
                backgroundColor: "blue",
                data: bugNeedRetestNum,
                issueId: bugNeedRetestId,
            },
        ]

    this.content = new MultiBarView(this.ids.content, label, datasets);
    this.content.updateView();
    }
}
         