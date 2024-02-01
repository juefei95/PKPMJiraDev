/**
 * 项目故事进展报告
 */

import { AbstractReport }                            from "./abstractReport.js"
import { MultiLineView }                             from "./multiLineView.js"
import { diffDays, dateRange, leastSquare }          from "../model/toolSet.js"
import { Issue }                                     from "../model/issue.js";
 
 
 
export class StoryTimelineReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);

        this.totalLine = [];
        this.designLine = [];
        this.developLine = [];
        this.testLine = [];
        this.timelineStartDate = new Date();
        this.timelineEndDate = new Date();
        window.addEventListener("onButtonClickStoryTimelineReportsaveData", ()=>{this._saveDataToCSV();});
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
        this.timelineStartDate = tbValues["timelineDateRange"] instanceof Array && tbValues["timelineDateRange"].length == 2 && tbValues["timelineDateRange"][0] && tbValues["timelineDateRange"][0] !== ''
                                ? new Date(tbValues["timelineDateRange"][0]) : minCreateDate;
        this.timelineEndDate   = tbValues["timelineDateRange"] instanceof Array && tbValues["timelineDateRange"].length == 2 && tbValues["timelineDateRange"][1] && tbValues["timelineDateRange"][1] !== ''
                                ? new Date(tbValues["timelineDateRange"][1]) : new Date();
        let len = diffDays(this.timelineEndDate, this.timelineStartDate);

        // 从预测终止日期往前使用的最近天数
        let predDateLen = 14
        // 预测终止日期
        let predStartDate = tbValues["timelineDateRangePred"] instanceof Array && tbValues["timelineDateRangePred"].length == 2 && tbValues["timelineDateRangePred"][0] && tbValues["timelineDateRangePred"][0] !== ''
                            ? new Date(tbValues["timelineDateRangePred"][0]) : new Date(this.timelineEndDate - 86400000*predDateLen)
        let predEndDate = tbValues["timelineDateRangePred"] instanceof Array && tbValues["timelineDateRangePred"].length == 2 && tbValues["timelineDateRangePred"][1] && tbValues["timelineDateRangePred"][1] !== ''
                            ? new Date(tbValues["timelineDateRangePred"][1]) : this.timelineEndDate;

        this.totalLine = Array(len).fill(0);
        this.designLine = Array(len).fill(0);
        this.developLine = Array(len).fill(0);
        this.testLine = Array(len).fill(0);
        this.designLinePred = []
        this.developLinePred = []
        this.testLinePred = []

        let dRange = dateRange(this.timelineStartDate, this.timelineEndDate);
        let dRangeNum = dateRange(this.timelineStartDate, this.timelineEndDate, 1, 'number');

        storyTimeline.forEach(o => {
            let i1 = 0;
            i1 = diffDays(o.createDate, this.timelineStartDate)-1;
            this.totalLine.forEach((v,i,a) => {
                if (i>=i1) a[i] += 1;
            });
            if (o.designEndDate) {
                i1 = diffDays(o.designEndDate, this.timelineStartDate)-1;
                this.designLine.forEach((v,i,a) => {
                    if (i>=i1) a[i] += 1;
                });
            }
            if (o.developEndDate) {
                i1 = diffDays(o.developEndDate, this.timelineStartDate)-1;
                this.developLine.forEach((v,i,a) => {
                    if (i>=i1) a[i] += 1;
                });
            }
            if (o.testEndDate) {
                i1 = diffDays(o.testEndDate, this.timelineStartDate)-1;
                this.testLine.forEach((v,i,a) => {
                    if (i>=i1) a[i] += 1;
                });
            }
        });
        // 生成预测数据
        let endPredIndex = diffDays(predEndDate, this.timelineStartDate)
        let startPredIndex = diffDays(predStartDate, this.timelineStartDate)
        let designPredLr = leastSquare(this.designLine.slice(startPredIndex, endPredIndex), dRangeNum.slice(startPredIndex, endPredIndex))
        let developPredLr = leastSquare(this.developLine.slice(startPredIndex, endPredIndex), dRangeNum.slice(startPredIndex, endPredIndex))
        let testPredLr = leastSquare(this.testLine.slice(startPredIndex, endPredIndex), dRangeNum.slice(startPredIndex, endPredIndex))
        let fillPredArray = (predLr, predArray) => {
            for (let index = startPredIndex; index < len; index++) {
                let predValue = predLr['slope'] * dRangeNum[index] + predLr['intercept']
                if (predValue <= this.totalLine[len-1]) {
                    predArray.push({
                        x: dRange[index],
                        y: predValue
                    })
                }else{
                    break
                }
            }
        }
        fillPredArray(designPredLr, this.designLinePred)
        fillPredArray(developPredLr, this.developLinePred)
        fillPredArray(testPredLr, this.testLinePred)
        let datasets = [{
            label : '全部需求',
            data : this.totalLine.map((x) => x),    // clone not shallow copy
            fill : false,
            borderColor : 'blue',
            pluginShowEndLabel: true
        },{
            label : '产品进展',
            data : this.designLine.map((x) => x),    // clone not shallow copy
            fill : false,
            borderColor : 'yellow',
            pluginShowEndLabel: true
        },{
            label : '产品进展预测',
            data : this.designLinePred,    // clone not shallow copy
            fill : false,
            borderDash: [10,5],
            borderColor : 'yellow',
            borderWidth : 4,
            pointRadius: 0,
        },{
            label : '研发进展',
            data : this.developLine.map((x) => x),    // clone not shallow copy
            fill : false,
            borderColor : 'red',
            pluginShowEndLabel: true
        },{
            label : '研发进展预测',
            data : this.developLinePred,    // clone not shallow copy
            fill : false,
            borderDash: [10,5],
            borderColor : 'red',
            borderWidth : 4,
            pointRadius: 0,
        },{
            label : '测试进展',
            data : this.testLine.map((x) => x),    // clone not shallow copy
            fill : false,
            borderColor : 'green',
            pluginShowEndLabel: true
        },{
            label : '测试进展预测',
            data : this.testLinePred,    // clone not shallow copy
            fill : false,
            borderDash: [10,5],
            borderColor : 'green',
            borderWidth : 4,
            pointRadius: 0,
        }];
        this.content = new MultiLineView(this.ids.content, dRange, datasets);
        this.content.updateView();
    }

    // 存储数据到CSV文件
    _saveDataToCSV(){

        let csv = "Date,Totle,Design,Develop,Test\n";
        for (let i = 0; i < this.totalLine.length; i++) {
            
            csv += new Date(this.timelineStartDate.getTime() + 86400000*i).toLocaleDateString(); // + 1 day in ms
            csv += ",";
            csv += this.totalLine[i];
            csv += ",";
            csv += this.designLine[i];
            csv += ",";
            csv += this.developLine[i];
            csv += ",";
            csv += this.testLine[i];
            csv += "\n";
        }
        window.open('data:text/csv;charset=utf-8,' + escape(csv));
    }
}