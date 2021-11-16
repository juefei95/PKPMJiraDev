/**
 * 项目故事进展报告
 */

import { AbstractReport }               from "./abstractReport.js"
import { MultiLineView }                from "./multiLineView.js"
import { diffDays, dateRange }          from "../model/toolSet.js"
import { Issue }                        from "../model/issue.js";
 
 
 
export class StoryTimelineReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
    }

    
    // 根据判断条件生成报告
    _updateContent(event){
        
        let tbValues = this._getToolBarValues(event);
        let storyTimeline = [];
        let minCreateDate = new Date();
        for (const issue of this.model.getIssues()) {
            let createDate = issue.getCreateDate();
            if (createDate && minCreateDate > createDate) minCreateDate = createDate;   // 记录下最早的一个创建时间
            const designEndDate = issue.getDesignEndDate();
            const developEndDate = issue.getDevelopEndDate();
            const testEndDate = issue.getTestEndDate();
            storyTimeline.push({
                createDate : createDate,
                designEndDate : designEndDate,
                developEndDate : developEndDate,
                testEndDate : testEndDate,
            });
        }
        
        // 判断需要多少数组长度
        let timelineStartDate = tbValues["timelineDateRange"] instanceof Array && tbValues["timelineDateRange"].length == 2 && tbValues["timelineDateRange"][0] && tbValues["timelineDateRange"][0] !== ''
                                ? new Date(tbValues["timelineDateRange"][0]) : minCreateDate;
        let timelineEndDate   = tbValues["timelineDateRange"] instanceof Array && tbValues["timelineDateRange"].length == 2 && tbValues["timelineDateRange"][1] && tbValues["timelineDateRange"][1] !== ''
                                ? new Date(tbValues["timelineDateRange"][1]) : new Date();
        let len = diffDays(timelineEndDate, timelineStartDate);
        let totalLine = Array(len).fill(0);
        let designLine = Array(len).fill(0);
        let developLine = Array(len).fill(0);
        let testLine = Array(len).fill(0);
        storyTimeline.forEach(o => {
            let i1 = 0;
            i1 = diffDays(o.createDate, timelineStartDate)-1;
            totalLine.forEach((v,i,a) => {
                if (i>=i1) a[i] += 1;
            });
            if (o.designEndDate) {
                i1 = diffDays(o.designEndDate, timelineStartDate)-1;
                designLine.forEach((v,i,a) => {
                    if (i>=i1) a[i] += 1;
                });
            }
            if (o.developEndDate) {
                i1 = diffDays(o.developEndDate, timelineStartDate)-1;
                developLine.forEach((v,i,a) => {
                    if (i>=i1) a[i] += 1;
                });
            }
            if (o.testEndDate) {
                i1 = diffDays(o.testEndDate, timelineStartDate)-1;
                testLine.forEach((v,i,a) => {
                    if (i>=i1) a[i] += 1;
                });
            }
        });
        let dataRange = dateRange(timelineStartDate, timelineEndDate);
        let datasets = [{
            label : '全部需求',
            data : totalLine,
            fill : false,
            borderColor : 'blue',
        },{
            label : '产品进展',
            data : designLine,
            fill : false,
            borderColor : 'yellow',
        },{
            label : '研发进展',
            data : developLine,
            fill : false,
            borderColor : 'red',
        },{
            label : '测试进展',
            data : testLine,
            fill : false,
            borderColor : 'green',
        }];
        this.content = new MultiLineView(this.ids.content, dataRange, datasets);
        this.content.updateView();
    }
}