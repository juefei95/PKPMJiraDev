
// 解析JQL
import {JQL} from './jqlParser.js';
let jql = new JQL(window.jql);

// 修改Tab标题
import {modifyTitle} from './titleModifier.js'
modifyTitle(jql.getProject(), jql.getIssueType(), window.mode);

// 加载Config
console.log(" 加载Config");
import {getConfig}  from './configManager.js';
let config = getConfig(jql.getProject(), jql.getIssueType(), window.mode);
//console.log(config.issueType);

// 获取数据
console.log(" 获取数据");
import {JiraIssueReader} from './jiraIssueReader.js'
import { Model } from "./modelManager.js"
let data = await new JiraIssueReader().read(jql.getRawJQL(), config.getFieldsDict())
let model = new Model(data, config);

// 展示框架
console.log(" 展示框架");
import { EnhancedFilterFrame } from "./enhancedFilterFrame.js?q=2";
window.frame = await new EnhancedFilterFrame(config, model, false);
console.log(" 框架正在准备...");
await window.frame.prepare();
console.log(" 显示框架")
window.frame.show();