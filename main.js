
import {JQL} from './jqlParser.js';
import {modifyTitle} from './titleModifier.js'
import {getConfig}  from './configManager.js';
import {JiraIssueReader} from './jiraIssueReader.js'
import { Model } from "./modelManager.js"
import { EnhancedFilterFrame } from "./enhancedFilterFrame.js?q=2";

export function main(){
    // 解析JQL
    let jql = new JQL(window.jql);
    
    // 修改Tab标题
    modifyTitle(jql.getProject(), jql.getIssueType(), window.mode);
    
    // 加载Config
    console.log(" 加载Config");
    let config = getConfig(jql.getProject(), jql.getIssueType(), window.mode);
    //console.log(config.issueType);
    
    // 获取数据
    console.log(" 获取数据");
    let data = await new JiraIssueReader().read(jql.getRawJQL(), config.getFieldsDict())
    let model = new Model(data, config);
    
    // 展示框架
    console.log(" 展示框架");
    window.frame = await new EnhancedFilterFrame(config, model, false);
    console.log(" 框架正在准备...");
    await window.frame.prepare();
    console.log(" 显示框架")
    window.frame.show();

}