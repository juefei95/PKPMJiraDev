import { helloReport } from "./report/main.js";
import { helloFilter } from "./filter/main.js";
import { JiraIssueReader } from "./model/jiraIssueReader.js"

export async function main(){

    try {
        let username = await new JiraIssueReader().getUserName();
        if (!username) {
            alert("您是不是没有登录到Jira，请尝试重新登录。")
            return;
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