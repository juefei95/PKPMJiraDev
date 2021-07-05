import { helloReport } from "./report/main.js";
import { helloFilter } from "./filter/main.js";
import { JiraIssueReader } from "./model/jiraIssueReader.js"

export async function main(){

    try {
        let jira = new JiraIssueReader();
        let username = await jira.getUserName();
        if (!username) {
            alert("您是不是没有登录到Jira，请尝试重新登录。")
            return;
        }else{
            if (!window.isDebug) {
                let msg = username + "于" + new Date(new Date().getTime()+ 8 * 3600 * 1000).toISOString().substring(0, 16) + "使用了" + window.mode + "，JQL为" + window.jql;
                jira.addComment("EPGEE-9", msg);
            }
        }
    } catch (error) {
        alert("您是不是没有登录到Jira，请尝试重新登录。")
        return;
    }

    
    if (window.mode === "report") {
        helloReport();
    }else if (window.mode === "filter") {
        helloFilter();
    }else{
        alert("mode参数传递错误");
    }

}