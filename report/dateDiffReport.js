/**
 * 让用户选择两个时间字段，并且根据差值来排序
 */

 import { AbstractReport }               from "./abstractReport.js"
 import { genHtmlTable }                 from "./genHtmlTable.js"
 import { GridView }                     from "./gridView.js"
 import { diffDays, date2String }        from "../model/toolSet.js"
 import { Issue }                        from "../model/issue.js"
 import { getJiraHost }                  from '../model/toolSet.js'
 
 
export class DateDiffReport extends AbstractReport{
    constructor(reportName, id, config, model){
        super(reportName, id, config, model);
        window.addEventListener("onButtonClick"+this.reportName+"copyToConf", this._copyToConf.bind(this));
    }

    _genTableData(event){

        let tbValues = this._getToolBarValues(event);
        let date1Attr = tbValues.date1;
        let date2Attr = tbValues.date2;
        let daysDiffRange = tbValues.daysDiffRange;
        let personAttr = tbValues.person;
        let records = [];
        let counter = 0;
        for (const issue of this.model.getIssues()) {

            let date1 = issue.getAttr(date1Attr[1]);
            let date2 = issue.getAttr(date2Attr[1]);
            let person = issue.getAttr(personAttr[1]);
            
            if (person !== Issue.emptyText && date1 !== Issue.invalidDate && date2 !== Issue.invalidDate &&
                daysDiffRange && diffDays(date1, date2) >= daysDiffRange[0] && diffDays(date1, date2) <= daysDiffRange[1]) {
                let jiraId = issue.getJiraId();
                let title = issue.getTitle();
                records.push(
                    {
                        "recid" : counter,
                        "user" : person,
                        "jiraId" : jiraId,
                        "title" : title,
                        "date1" : date2String(date1),
                        "date2" : date2String(date2),
                        "daysDiff" : diffDays(date1, date2),
                    }
                );
                counter += 1;
            }
        }
        
        let columns = [{
            field : "user", caption : "User", sortable : true, size : '100px',
        },{
            field : "jiraId", caption : "JiraID", sortable : true, size : '100px', render : function (record) {
                return '<div><a target="_blank" href="' + getJiraHost() + 'browse/' + record.jiraId + '">' + record.jiraId + '</a></div>';
            }
        },{
            field : "title", caption : "标题", sortable : true, size : '200px',
        },{
            field : "date1", caption : date1Attr[0], sortable : true, size : '100px',
        },{
            field : "date2", caption : date2Attr[0], sortable : true, size : '100px',
        },{
            field : "daysDiff", caption : "相差", sortable : true, size : '100px',
        }];

        records = records.sort((x,y) => x.user.localeCompare(y.user));

        return [columns, records];
    }

    // 根据判断条件生成报告
    _updateContent(event){
        const [columns, records] = this._genTableData(event);
        $('#' + this.ids.content).css("height", "70%");
        $('#' + this.ids.content).css("width", "60%");
        this.content = new GridView(this.ids.content, columns, records);
        this.content.updateView();
    }

    async _copyToConf(event){
        const [columns, records] = this._genTableData(event);
        let tableHtml = genHtmlTable(columns, records);

        $("#" + this.id).append(`<div id="helloTable" style="width:60%;height:70%;"><p>把下面这段复制到Confluence即可</p></br>${tableHtml}</div>`);

    }
}