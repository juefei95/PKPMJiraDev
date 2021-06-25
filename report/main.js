
import { JQL }                      from './../model/jqlParser.js';
import { modifyTitle }              from './../model/titleModifier.js';
import { printInfo }                from "./../model/toolSet.js";
import { JiraIssueReader }          from "./../model/jiraIssueReader.js";
import { EnhancedReportFrame }      from "./enhancedReportFrame.js";
import { getConfig }                from "./configManager.js";
import { Model }                    from "./modelMaganer.js";

export async function helloReport(){

    try {
        // 解析JQL
        let jql = new JQL(window.jql);
        
        // 修改Tab标题
        modifyTitle(jql.getProject(), jql.getIssueType(), window.mode);

        
        // 加载Config
        printInfo(" 加载Config");
        let config = getConfig(jql.getProject(), jql.getIssueType());
        if (!config) { 
            alert("您使用的项目类型或issue类型目前还未配置，请联系史建鑫进行配置。");
            return;
        }

        // 获取数据
        printInfo(" 获取数据");
        let issues = await new JiraIssueReader().read(jql.getRawJQL(), config.getFieldsDict(), true)
        let model = new Model(issues);

        // 展示框架
        printInfo(" 展示框架");
        window.frame = await new EnhancedReportFrame(config, model);
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