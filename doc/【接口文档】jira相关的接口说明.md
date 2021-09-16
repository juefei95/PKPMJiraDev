# Jira的Rest API文档在哪

https://docs.atlassian.com/software/jira/docs/api/REST/8.19.0/#issue-editIssue
https://developer.atlassian.com/server/jira/platform/rest-apis/
https://developer.atlassian.com/server/jira/platform/jira-rest-api-example-edit-issues-6291632/

# 如何知道当前Jira站点支持的所有field

- 【GET】 https://jira.pkpm.cn/rest/api/2/field
- 返回的是个json，详细描述了每个field的定义、scheme之类


# 如何知道某个Issue支持哪些field

- 【GET】 https://jira.pkpm.cn/rest/api/2/issue/JGVIRUS-9535/editmeta
- 返回的是个json

# 如何获得某个JQL的结果数目

TODO

# 如何获得某个JQL的搜索结果

TODO

# 如何更新某个Issue的某个field

TODO
