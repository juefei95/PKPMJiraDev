
import { JQL }                      from './../model/jqlParser.js';
import { JiraIssueReader }          from './../model/jiraIssueReader.js'
import { printInfo }                from "./../model/toolSet.js";
import { Model }                    from "./modelManager.js"
import { getViewConfig, ViewConfig }               from "./viewConfig.js"
import { EnhancedFilterFrame }      from "./enhancedFilterFrame.js?q=3";

export async function helloFilter(){
    try {
        // 解析JQL
        let jql = new JQL(window.jql);

        // 获取数据
        printInfo(" 获取数据");
        let [issues, notReadIssueKey] = await new JiraIssueReader().read(jql.getRawJQL())
        let viewConfig = getViewConfig(issues);
        viewConfig.setColumnSetting(viewConfig.loadColumnSetting());
        let model = new Model(issues, viewConfig, jql);

        // 展示框架
        printInfo(" 展示框架");
        window.frame = await new EnhancedFilterFrame(viewConfig, model);
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
