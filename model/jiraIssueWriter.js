/*
写入Jira数据
*/


export class JiraIssueWriter{

    /**
     * 设置某个issue的某个field的值
     * @param {string} issueKey issue的Key
     * @param {string} field 待设置的field
     * @param {*} dateStr field的值
     * @param {*} successCallBack 如果response.ok为true，则执行的回调
     * @param {*} failCallBack 如果response.ok为false，则执行的回调
     */
    async setIssueDateField(issueKey, field, dateStr, successCallBack, failCallBack){

        fetch('https://jira.pkpm.cn/rest/api/2/issue/'+issueKey+'/', {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify(
            {
                "update" : {
                    [field] : [{"set" : dateStr}]
                }
            }),
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json'
            },
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            //referrer: 'no-referrer', // *client, no-referrer
        }).then(function (res) {
            if (res.ok){
                if(successCallBack) successCallBack();
            }else{
                if(failCallBack) failCallBack();
            }
        });
    }


    /**
     * 设置某个issue的某个field的值
     * @param {string} issueKey issue的Key
     * @param {string} field 待设置的field
     * @param {*} username field的值
     * @param {*} successCallBack 如果response.ok为true，则执行的回调
     * @param {*} failCallBack 如果response.ok为false，则执行的回调
     */
    async setIssueUserField(issueKey, field, username, successCallBack, failCallBack){

        fetch('https://jira.pkpm.cn/rest/api/2/issue/'+issueKey+'/', {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify({ "fields": {
                [field]: { "name": username }},
            }), // must match 'Content-Type' header
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json'
            },
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            //referrer: 'no-referrer', // *client, no-referrer
        }).then(function (res) {
            if (res.ok){
                if(successCallBack) successCallBack();
            }else{
                if(failCallBack) failCallBack();
            }
        });
    }
}