
import {JQL}                    from './jqlParser.js';
import {modifyTitle}            from './titleModifier.js'
import {getConfig}              from './configManager.js';
import {JiraIssueReader}        from './jiraIssueReader.js'
import { Model }                from "./modelManager.js"
import { EnhancedFilterFrame }  from "./enhancedFilterFrame.js?q=3";

export async function helloFilter(){
    try {
        // 解析JQL
        let jql = new JQL(window.jql);
        
        // 修改Tab标题
        modifyTitle(jql.getProject(), jql.getIssueType(), window.mode);
        
        // 加载Config
        printInfo(" 加载Config");
        let config = getConfig(jql.getProject(), jql.getIssueType(), window.mode);
        //console.log(config.issueType);
        // 获取数据
        printInfo(" 获取数据");
        let data = await new JiraIssueReader().read(jql.getRawJQL(), config.getFieldsDict())
        let model = new Model(data, config, jql);
        // 展示框架
        printInfo(" 展示框架");
        window.frame = await new EnhancedFilterFrame(config, model, false);
        printInfo(" 框架正在准备...");
        await window.frame.prepare();
        printInfo(" 显示框架")
        window.frame.show();
    }
    catch(err) {
        debugger;
        printInfo("发生错误：" + err);
        return;
    }

}

function printInfo(info){
    let date = new Date().toLocaleString()
    let p = document.createElement('p');
    p.innerHTML = date + " " + info + '<br />';
    document.body.appendChild(p);

}