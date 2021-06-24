/**
 * 各模块未解决的Bug情况
 */

import { AbstractReport }               from "./abstractReport.js"
import { MultiLineView }                from "./multiLineView.js"
import { diffDays, randomRGB, dateRange }          from "../model/toolSet.js"
import { Issue }                        from "../model/issue.js";



export class BugUnresolvedByCategoryReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }

    
    // 根据判断条件生成报告
    _updateContent(event){
        let tbValues = this._getToolBarValues(event);
        let overdays = tbValues.nearDays;
        let startDate = new Date(new Date().setUTCHours(0,0,1) - 86400000 * (overdays-1))
        let endDate = new Date().setUTCHours(23,59,59);
        let bugUnresolved = {};
        for (const issue of this.model.getIssues()) {
            const category = issue.getCategory();
            const createDate = issue.getCreateDate();
            let index1 = Math.max(0, diffDays(createDate, startDate)-1);
            const [name, resolvedDate] = issue.getBugResolveDateAndPerson();
            let index2 = resolvedDate ? Math.max(0, diffDays(resolvedDate, startDate)-1): overdays ;
            if (!(category in bugUnresolved)) {
                bugUnresolved[category] = Array(overdays).fill(0);
            }
            bugUnresolved[category].forEach((x,i,a) => {
                if(i>=index1 && i<index2) a[i]+=1;
            });
        }

        let labels = dateRange(startDate, endDate)
        let dataSets = [];
        for (const [k, v] of Object.entries(bugUnresolved)){
            dataSets.push({
                label : k,
                data : v,
                fill : false,
                borderColor : randomRGB(),
            });
        }

        this.content = new MultiLineView(this.ids.content, labels, dataSets);
        this.content.updateView();
    }
}