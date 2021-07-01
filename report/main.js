
import { JQL }                      from './../model/jqlParser.js';
import { JiraIssueReader }          from './../model/jiraIssueReader.js'
import { printInfo }                from "./../model/toolSet.js";
import { EnhancedReportFrame }      from "./enhancedReportFrame.js";
import { getViewConfig }            from "./viewConfig.js";
import { Model }                    from "./modelMaganer.js";

export async function helloReport(){

    try {
        // 解析JQL
        let jql = new JQL(window.jql);
        
        // 获取数据
        printInfo(" 获取数据");
        let [issues, notReadIssueKey] = await new JiraIssueReader().read(jql.getRawJQL(), true)
        let viewConfig = getViewConfig(issues);
        if (!viewConfig) { 
            alert("目前报告仅支持故事、Epic和Bug，您的筛选结果中还包括其他类型，无法展示。");
            return;
        }
        let model = new Model(issues);

        // 修改Tab标题
        let title = issues.length + "个Issue的报告";
        window.document.title = title;

        // 展示框架
        printInfo(" 展示框架");
        window.frame = await new EnhancedReportFrame(viewConfig, model);
        printInfo(" 框架正在准备...");
        await window.frame.prepare();
        printInfo(" 显示框架")
        window.frame.show();
        
    } catch (err) {
        debugger;
        printInfo("发生错误：");
        printInfo(err.stack);
        return;
    }
}