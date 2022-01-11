# Jira的Rest API文档在哪

https://docs.atlassian.com/software/jira/docs/api/REST/8.19.0/#issue-editIssue
https://developer.atlassian.com/server/jira/platform/rest-apis/
https://developer.atlassian.com/server/jira/platform/jira-rest-api-example-edit-issues-6291632/

# 如何知道当前Jira站点支持的所有field

- 【GET】 https://jira.pkpm.cn/rest/api/2/field
- 返回的是个json，详细描述了每个field的定义、scheme之类


# 如何知道某个Issue支持哪些field

- 【GET】 https://jira.pkpm.cn/rest/api/2/issue/YHT-179/editmeta
- 返回的是个json

# 如何获得某个JQL的结果数目

- 【POST】 https://jira.pkpm.cn/rest/api/2/search/
- Body传Json
    ```js
    JSON.stringify({
        jql: jql,
        maxResults : 0,     // 传0表示有多少jql的搜索结果，就返回多少
        })
    ```

# 如何获得某个JQL的搜索结果

- 【POST】 https://jira.pkpm.cn/rest/api/2/search/
- Body传Json
    ```js
    JSON.stringify({
        jql: jql,
        startAt : startAt,      // 起始index，一般传0
        maxResults : maxResults,  // 传0表示有多少jql的搜索结果，就返回多少
        fields: fields2,        // 获取哪些字段
        expand : expand,        // 如果想获得changelog，就传["changelog"]，否则传空数组[]
        })
    ```


# 如何更新某个Issue的某个field

TODO

# 如何获取某个Issue关联的测试用例

- 【GET】 https://jira.pkpm.cn/rest/synapse/latest/public/requirement/BIMSTRU-6373/linkedTestCases
- 返回测试用例列表
    ```json
    [
        {
            "id": 156569,
            "key": "BIMSTRU-8002",
            "summary": "【类型属性管理器优化】验证新建文件默认选择专业的正确性"
        },
        {
            "id": 156570,
            "key": "BIMSTRU-8003",
            "summary": "【类型属性管理器优化】验证从结构专业切换其它专业时，不允许编辑修改项的正确性"
        },
    ]
    ```

# 如何获取某个Issue关联的测试用例产生的Bug

- 【GET】 https://jira.pkpm.cn/rest/synapse/latest/public/requirement/BIMSTRU-6373/getDefects
- 返回Bug列表
    ```json
    [
        {
            "id": 156884,
            "key": "BIMPLANEW-2416",
            "summary": "【类型属性管理器】导入新标准集后原有的标准集会不显示"
        }
    ]
    ```