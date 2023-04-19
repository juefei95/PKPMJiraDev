/*
创建Jira Issue
*/

import { getJiraHost } from './toolSet.js'

export class JiraIssueCreator{

    // 创建Jira Issue
    // 示例：
    // const epicIssue = {
    //     "fields": {
    //        "project":
    //        {
    //           "key": "JGVIRUS"
    //        },
    //        "summary": "层间板功能优化",
    //        //"description": "描述-测试自动创建史诗",
    //        "customfield_10104": "层间板功能优化",
    //        "components": [{"name":"PM"}],
    //        "versions": [{"name":"main"}],
    //        "issuetype": {
    //           "name": "Epic"
    //        }
    //    }
    // }
    // const storyIssue = {
    //     "fields": {
    //        "project":
    //        {
    //           "key": "JGVIRUS"
    //        },
    //        "summary": "合并标准层后层间板处理",
    //        "description": "",
    //        "components": [{"name":"PM"}],
    //        "versions": [{"name":"main"}],
    //        "customfield_10102": "JGVIRUS-22087",
    //        //"customfield_10538" : {"name": "zhanghonglei" },
    //        "issuetype": {
    //           "name": "故事"
    //        }
    //    }
    // }
    async createJiraIssue(bodyObj){
        return fetch(getJiraHost() + 'rest/api/2/issue/', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify(bodyObj), // must match 'Content-Type' header
            headers: {
                'content-type': 'application/json'
            },
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            //referrer: 'no-referrer', // *client, no-referrer
        }).then(response => response.json());
    }
}
