/*
读取Jira数据
*/

import { Issue } from "./issue.js";
import { getIssueReadScheme, IssueReadScheme } from "./issueReadScheme.js";
import { getJiraHost } from './toolSet.js'

export class JiraIssueReader{

    // 这里记录了Jira的所有字段怎么读，Jira里所有项目是共享一整套字段ID的(即下面的fieldReadConfig)
    // 不同的项目对于同样的字段（比如“计划提测时间”），两个项目可以能一个人用的是不同的字段ID
    static fieldReadConfig = {
        'key' : {
            'f' : i => i.key,
            'jqlName' : 'key',
        },
        'fields' : {
            'issuetype'         : {
                'f' : i => 'issuetype' in i.fields && i.fields.issuetype && i.fields.issuetype.name ? i.fields.issuetype.name                       : Issue.emptyText,
                'jqlName' : 'issuetype',
            },
            'components'        : {
                'f' : i => 'components' in i.fields && i.fields.components.length > 0               ? i.fields.components[0].name                   : Issue.emptyText,
                'jqlName' : 'component',
            },
            'summary'           : {
                'f' : i => 'summary' in i.fields                                                    ? i.fields.summary                              : Issue.emptyText,
                'jqlName' : 'summary',
            },
            'status'            : {
                'f' : i => 'status' in i.fields && 'name' in i.fields.status                        ? i.fields.status.name                          : Issue.emptyText,
                'jqlName' : 'status',
            },
            // 同时也作为结构流程中Bug的测试人员
            'reporter'          : {
                'f' : i => 'reporter' in i.fields && i.fields.reporter !== null                     ? i.fields.reporter.displayName                 : Issue.emptyText,
                'jqlName' : 'reporter',
            },
            'assignee'          : {
                'f' : i => 'assignee' in i.fields && i.fields.assignee !== null                     ? i.fields.assignee.displayName                 : Issue.emptyText,
                'jqlName' : 'assignee',
            },
            'resolution'        : {
                'f' : i => 'resolution' in i.fields && i.fields.resolution !== null                 ? i.fields.resolution.name                      : Issue.emptyText,
                'jqlName' : 'resolution',
            },
            'created'           : {
                'f' : i => 'created' in i.fields && i.fields.created !== null                       ? new Date(i.fields.created.slice(0,10))        : Issue.invalidDate,
                'jqlName' : 'created',
            },
            'resolutiondate'    : {
                'f' : i => 'resolutiondate' in i.fields && i.fields.resolutiondate !== null         ? new Date(i.fields.resolutiondate.slice(0,10)) : Issue.invalidDate,
                'jqlName' : 'resolutiondate',
            },
            // 相关联的其他issue，比如故事关联的bug
            'issuelinks'        : {
                'f' : i => 'issuelinks' in i.fields && i.fields.issuelinks !== null                 ? i.fields.issuelinks                           : [],
                'jqlName' : undefined,
            },
            // 结构、深化流程的designer
            'customfield_10537' : {
                'f' : i => 'customfield_10537' in i.fields && i.fields.customfield_10537 !== null   ? i.fields.customfield_10537.displayName        : Issue.emptyText,
                'jqlName' : '需求人员',
            },
            // 结构、深化、机电流程的developer
            'customfield_10538' : {
                'f' : i => 'customfield_10538' in i.fields && i.fields.customfield_10538 !== null   ? i.fields.customfield_10538.displayName        : Issue.emptyText,
                'jqlName' : '研发人员',
            },
            // 结构、深化流程的tester
            'customfield_10539' : {
                'f' : i => 'customfield_10539' in i.fields && i.fields.customfield_10539 !== null   ? i.fields.customfield_10539.displayName        : Issue.emptyText,
                'jqlName' : '测试人员',
            },
            // confluence_link
            'customfield_10713' : {
                'f' : i => 'customfield_10713' in i.fields && i.fields.customfield_10713 !== null   ? i.fields.customfield_10713                    : Issue.emptyText,
                'jqlName' : 'Confluence链接 ',
            },
            // 结构流程（深化流程）的产品设计初稿计划提交时间
            'customfield_11415' : {
                'f' : i => 'customfield_11415' in i.fields && i.fields.customfield_11415 !== null   ? new Date(i.fields.customfield_11415)          : Issue.invalidDate,
                'jqlName' : '产品计划提交时间',
            },
            // 结构流程的研发提测时间
            'customfield_11408' : {
                'f' : i => 'customfield_11408' in i.fields && i.fields.customfield_11408 !== null   ? new Date(i.fields.customfield_11408)          : Issue.invalidDate,
                'jqlName' : '研发计划提测时间',
            },
            // 解决人
            'customfield_10716' : {
                'f' : i => 'customfield_10716' in i.fields && i.fields.customfield_10716 !== null   ? i.fields.customfield_10716.displayName        : Issue.emptyText,
                'jqlName' : '解决人',
            },
            // Bug等级 
            'customfield_10510' : {
                'f' : i => 'customfield_10510' in i.fields && i.fields.customfield_10510 !== null   ? i.fields.customfield_10510.value              : Issue.emptyText,
                'jqlName' : 'bug严重等级',
            },
            // 优先级
            'priority'          : {
                'f' : i => 'priority'          in i.fields && i.fields.priority !== null            ? i.fields.priority.name                        : Issue.emptyText,
                'jqlName' : 'priority',
            },
            // 影响版本
            'versions'          : {
                'f' : i => {
                    if('versions' in i.fields == false || i.fields.versions.length <= 0) return Issue.emptyArray;
                    let affectVersions = [];
                    for (let index = 0; index < i.fields.versions.length; index++) {
                        affectVersions.push(i.fields.versions[index].name);
                    }
                    return affectVersions;
                },
                'jqlName' : 'affectedVersion',
            },
            // 修复版本
            'fixVersions'       : {
                'f' : i => 'fixVersions'       in i.fields && i.fields.fixVersions.length > 0       ? i.fields.fixVersions[0].name                  : Issue.emptyText,
                'jqlName' : 'fixVersion',
            },
            // 史诗链接
            'customfield_10102' : {
                'f' : i => 'customfield_10102' in i.fields && i.fields.customfield_10102 !== null   ? i.fields.customfield_10102                    : Issue.emptyText,
                'jqlName' : '史诗链接',
            },
            // 史诗名称
            'epicName' : {
                'f' : async function(i){
                    let epicId = 'customfield_10102' in i.fields && i.fields.customfield_10102 !== null ? i.fields.customfield_10102 : Issue.emptyText;
                    if (epicId == Issue.emptyText) return Issue.emptyText;
                    let epicIssues = await new JiraIssueReader()._fetchJqlIssues("id="+epicId, 1, 0, false, ["summary"]);
                    let epicName = 'summary' in epicIssues.issues[0].fields ? epicIssues.issues[0].fields.summary : Issue.emptyText;
                    return epicName;
                },
                'jqlName' : undefined,
            },
            // 变更集号
            'customfield_10703' : {
                'f' : i => 'customfield_10703' in i.fields && i.fields.customfield_10703 !== null   ? i.fields.customfield_10703                    : Issue.emptyText,
                'jqlName' : '变更集号',
            },
            // PC流程的研发计划提验时间
            'customfield_11308' : {
                'f' : i => 'customfield_11308' in i.fields && i.fields.customfield_11308 !== null   ? new Date(i.fields.customfield_11308)          : Issue.invalidDate,
                'jqlName' : '计划提验时间',
            },
            // PC、深化流程的研发实际提验时间
            'customfield_11302' : {
                'f' : i => 'customfield_11302' in i.fields && i.fields.customfield_11302 !== null   ? new Date(i.fields.customfield_11302)          : Issue.invalidDate,
                'jqlName' : '实际提验时间',
            },
            // PC流程的研发实际提测时间
            'customfield_11409' : {
                'f' : i => 'customfield_11409' in i.fields && i.fields.customfield_11409 !== null   ? new Date(i.fields.customfield_11409)          : Issue.invalidDate,
                'jqlName' : '实际提测时间',
            },
            // PC流程的测试计划结束时间
            'customfield_11312' : {
                'f' : i => 'customfield_11312' in i.fields && i.fields.customfield_11312 !== null   ? new Date(i.fields.customfield_11312)          : Issue.invalidDate,
                'jqlName' : '计划测试结束',
            },
            // PC流程的测试实际结束时间
            'customfield_11305' : {
                'f' : i => 'customfield_11305' in i.fields && i.fields.customfield_11305 !== null   ? new Date(i.fields.customfield_11305)          : Issue.invalidDate,
                'jqlName' : '实际测试结束',
            },
            // PC流程的测试备注
            'customfield_11443' : {
                'f' : i => 'customfield_11443' in i.fields && i.fields.customfield_11443 !== null   ? i.fields.customfield_11443                    : Issue.emptyText,
                'jqlName' : '测试备注',
            },
            // PC流程的Epic的测试人员
            'customfield_10901' : {
                'f' : i => 'customfield_10901' in i.fields && i.fields.customfield_10901 !== null && i.fields.customfield_10901.length > 0   ? i.fields.customfield_10901[0].displayName : Issue.emptyText,
                'jqlName' : '测试人员（多人）',
            },
            // 机电流程的故事的测试人员
            'customfield_10539' : {
                'f' : i => 'customfield_10539' in i.fields && i.fields.customfield_10539 !== null   ? i.fields.customfield_10539.displayName        : Issue.emptyText,
                'jqlName' : '测试人员',
            },
            // 机电流程的故事的专业选择
            'customfield_10701' : {
                'f' : i => 'customfield_10701' in i.fields && i.fields.customfield_10701 !== null   ? i.fields.customfield_10701.value              : Issue.emptyText,
                'jqlName' : 'MEP专业选择',
            },
            // Bug发现阶段
            'customfield_10408' : {
                'f' : i => 'customfield_10408' in i.fields && i.fields.customfield_10408 !== null   ? i.fields.customfield_10408.value              : Issue.emptyText,
                'jqlName' : 'bug发现阶段',
            },
            // PC、深化流程的产品设计实际评审时间
            'customfield_11306' : {
                'f' : i => 'customfield_11306' in i.fields && i.fields.customfield_11306 !== null   ? new Date(i.fields.customfield_11306)          : Issue.invalidDate,
                'jqlName' : '实际设计评审',
            },
            // PC、深化流程的产品设计计划评审时间
            'customfield_11307' : {
                'f' : i => 'customfield_11307' in i.fields && i.fields.customfield_11307 !== null   ? new Date(i.fields.customfield_11307)          : Issue.invalidDate,
                'jqlName' : '计划设计评审',
            },
            // PC流程的测试用例计划评审日期
            'customfield_11310' : {
                'f' : i => 'customfield_11310' in i.fields && i.fields.customfield_11310 !== null   ? new Date(i.fields.customfield_11310)          : Issue.invalidDate,
                'jqlName' : '计划用例评审',
            },
            // PC流程的测试用例实际评审日期
            'customfield_11313' : {
                'f' : i => 'customfield_11313' in i.fields && i.fields.customfield_11313 !== null   ? new Date(i.fields.customfield_11313)          : Issue.invalidDate,
                'jqlName' : '实际用例评审',
            },
            // MEP、深化流程的产品设计实际评审时间
            'customfield_11301' : {
                'f' : i => 'customfield_11301' in i.fields && i.fields.customfield_11301 !== null   ? new Date(i.fields.customfield_11301)          : Issue.invalidDate,
                'jqlName' : '实际评审时间',
            },
            // MEP、深化流程的计划提测时间
            'customfield_11309' : {
                'f' : i => 'customfield_11309' in i.fields && i.fields.customfield_11309 !== null   ? new Date(i.fields.customfield_11309)          : Issue.invalidDate,
                'jqlName' : '计划提测',
            },
            // PC流程的计划提测日期
            'customfield_11434' : {
                'f' : i => 'customfield_11434' in i.fields && i.fields.customfield_11434 !== null   ? new Date(i.fields.customfield_11434)          : Issue.invalidDate,
                'jqlName' : '计划提测时间',
            },
            // PC流程的实际提测日期
            'customfield_11409' : {
                'f' : i => 'customfield_11409' in i.fields && i.fields.customfield_11409 !== null   ? new Date(i.fields.customfield_11409)          : Issue.invalidDate,
                'jqlName' : '实际提测时间',
            },
            // PC流程的测试计划开始
            'customfield_11311' : {
                'f' : i => 'customfield_11311' in i.fields && i.fields.customfield_11311 !== null   ? new Date(i.fields.customfield_11311)          : Issue.invalidDate,
                'jqlName' : '计划测试开始',
            },
            // PC流程的测试实际开始
            'customfield_11304' : {
                'f' : i => 'customfield_11304' in i.fields && i.fields.customfield_11304 !== null   ? new Date(i.fields.customfield_11304)          : Issue.invalidDate,
                'jqlName' : '实际测试开始',
            },
            // PC流程的产品实际提交时间
            'customfield_11602' : {
                'f' : i => 'customfield_11602' in i.fields && i.fields.customfield_11602 !== null   ? new Date(i.fields.customfield_11602)          : Issue.invalidDate,
                'jqlName' : '产品实际提交时间',
            },
            // Sprint
            'customfield_10101' : {
                'f' : i => {
                    if('customfield_10101' in i.fields == false || i.fields.customfield_10101 == null || i.fields.customfield_10101.length <= 0) return Issue.emptyArray;
                    let sprints = [];
                    for (let index = 0; index < i.fields.customfield_10101.length; index++) {
                        sprints.push(/name=(.*?)\,/.exec(i.fields.customfield_10101[index])[1]);
                    }
                    return sprints;
                },
                'jqlName' : 'Sprint',
            },
            // story point
            'customfield_10106' : {
                'f' : i => 'customfield_10106' in i.fields && i.fields.customfield_10106 !== null   ? i.fields.customfield_10106.toString()          : Issue.emptyText,
                'jqlName' : 'Story Point',
            },
        },
        'changelog' : i => {
            let cl = [];
            i.changelog["histories"].forEach(h => {
                cl.push({
                    "author" :  h["author"]["displayName"],
                    "date" :  new Date(h["created"]),
                    "items" :  h["items"],
                });
            });
            return cl;
        },
    };

    // 读取数据
    // param:
    //     jql(string) - JQL搜索语句
    //     hasChangeLog(bool) : 是否读取changelog
    // return:
    //     [data(Array<json>), notReadIssueKey(Array<string>)] - 读取的数据,未读取的JiraId
    async read(jql, hasChangeLog = false){

        // 先读取所有issue
        let fieldsForSearch = Object.keys(JiraIssueReader.fieldReadConfig["fields"]);
        let issues = await this._readAllIssue(jql, fieldsForSearch, hasChangeLog);

        // 从issues中提取值
        let issueValidFields = Issue.getValidFields();
        let data = [];
        let notReadIssueKey = [];
        for (const i of issues){
            let projName = i["key"].slice(0,i["key"].indexOf("-"))
            let issueType = i["fields"]["issuetype"]["name"];
            let readScheme = getIssueReadScheme(projName, issueType);
            if (!readScheme) {
                notReadIssueKey.push(i["key"]);
                continue;
            }
            let o = {}
            for (const field of issueValidFields) {
                if("projName" === field){
                    o["projName"] = projName;
                    continue;
                }
                if("issueType" === field){
                    o["issueType"] = issueType;
                    continue;
                }
                let scheme = readScheme.howToReadField(field);
                if (scheme) {
                    let f = this._getDictValue(JiraIssueReader.fieldReadConfig, scheme)['f'];
                    o[field] = await f(i);
                }
            }
            if (hasChangeLog) {
                let f = this._getDictValue(JiraIssueReader.fieldReadConfig, ['changelog']);
                o['changelog'] = f(i);
            }
            data.push(new Issue(o));
        }

        return [data, notReadIssueKey];
    }

    // 为测试报告读取数据
    // param:
    //     jql(string) - JQL搜索语句
    // return:
    //     issues(Array<json>) - 读取的每个issue
    async readForTestReport(jql){

        // 先读取所有issue
        let fieldsForSearch = Object.keys(JiraIssueReader.fieldReadConfig["fields"]);
        let issues = await this._readAllIssue(jql, fieldsForSearch, true);

        // 从issues中提取值
        let issueValidFields = Issue.getValidFields();
        let data = [];
        for (const i of issues){
            let projName = i["key"].slice(0,i["key"].indexOf("-"))
            let issueType = i["fields"]["issuetype"]["name"];
            if (issueType !== "故事") {
                continue;
            }
            let readScheme = getIssueReadScheme(projName, issueType);
            if (!readScheme) {
                continue;
            }
            let o = {}
            for (const field of issueValidFields) {
                if("projName" === field){
                    o["projName"] = projName;
                    continue;
                }
                if("issueType" === field){
                    o["issueType"] = issueType;
                    continue;
                }
                let scheme = readScheme.howToReadField(field);
                if (scheme) {
                    let f = this._getDictValue(JiraIssueReader.fieldReadConfig, scheme)['f'];
                    o[field] = f(i);
                }
            }
            let f = this._getDictValue(JiraIssueReader.fieldReadConfig, ['changelog']);
            o['changelog'] = f(i);
            data.push(new Issue(o));
        }

        return data;
    }

    // 给定Bugs Key，返回这些Bug的Issue，不过只包含Status
    async readBugStatus(bugsKey){
        // 先读取所有issue
        let fieldsForSearch = ['status'];
        let jql = "key in (" + bugsKey.join() + ")";
        let issues = await this._readAllIssue(jql, fieldsForSearch, false);

        // 从issues中提取值
        let issueValidFields = Issue.getValidFields();
        let data = [];
        for (const i of issues){
            let f = this._getDictValue(JiraIssueReader.fieldReadConfig, ['fields', 'status'])['f'];
            let o = {}
            o['status'] = f(i);
            data.push(new Issue(o));
        }

        return data;
    }

    // 获取issue关联的测试用例的key
    // param:
    //     issueKey - issue的key
    // return:
    //     testcaseKeys(Array<string>) - 测试用例的Keys
    async readIssueLinkTestCases(issueKey){
        let testcases = await this._fetchIssueLinkTestCases(issueKey);
        let keys = [];
        for (const t of testcases){
            keys.push(t["key"]);
        }
        return keys;
    }

    // 获取issue关联的测试用例的Bug的key
    // param:
    //     issueKey - issue的key
    // return:
    //     testcaseBugKeys(Array<string>) - 测试用例的Bug的Keys
    async readIssueLinkTestCaseBugs(issueKey){
        let testcaseBugs = await this._fetchIssueLinkTestCaseBugs(issueKey);
        let keys = [];
        for (const t of testcaseBugs){
            keys.push(t["key"]);
        }
        return keys;
    }

    // 获取issue关联的remotelink
    // param:
    //     issueKey - issue的key
    // return:
    //     RemoteLinks(Array<{type:link的类型, url:link的url}>) - remotelinks
    async readIssueRemoteLinks(issueKey){
        let links = await this._fetchIssueRemoteLinks(issueKey);

        let retLinks = [];
        for (const item of links) {
            retLinks.push({
                type : item["application"]["name"],
                url : item["object"]["url"],
            })
        }
        return retLinks;
    }

    // 获取数据对应的JQL名字，用于搜索
    getJQLName(path){
        return this._getDictValue(JiraIssueReader.fieldReadConfig, path)['jqlName']
    }
    
    // 获取当前登录的用户名
    async getUserName(){
        let username = await this._fetchCurrentUserName();
        if (username && "displayName" in username && username.displayName) {
            return username.displayName;
        }else{
            return undefined;
        }
    }

    // 给定jql，要读取的field，返回读取的issue列表
    async _readAllIssue(jql, fields, hasChangeLog){
        // 先获取jql的总数目
        let eachTimeFetchNum = 1000;        // 每次从Jira服务器获取issue的数目为1000，这个是服务器规定的
        let jqlResultNum = await this._fetchJqlResultNum(jql);
        let issues = [];
        for (let i=0; i<Math.ceil(jqlResultNum.total/eachTimeFetchNum); ++i){
            let eachIssues = await this._fetchJqlIssues(jql, eachTimeFetchNum, i*eachTimeFetchNum, hasChangeLog, fields);
            issues = issues.concat(eachIssues.issues);
        }
        return issues;
    }

    // 获取JQL的总数目
    async _fetchJqlResultNum(){
        return fetch(getJiraHost() + 'rest/api/2/search/', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify({jql: jql,
                                maxResults : 0,
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
        }).then(response => response.json());
    }

    // 获取Issue相关联的测试用例(synapse)
    async _fetchIssueLinkTestCases(issueKey){
        let url = getJiraHost() + `rest/synapse/latest/public/requirement/${issueKey}/linkedTestCases`;
        
        return fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json'
            },
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            //referrer: 'no-referrer', // *client, no-referrer
        }).then(response => response.json());
    }

    // 获取Issue相关联的测试用例产生的Bug(synapse)
    async _fetchIssueLinkTestCaseBugs(issueKey){
        let url = getJiraHost() + `rest/synapse/latest/public/requirement/${issueKey}/getDefects`;
        
        return fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json'
            },
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            //referrer: 'no-referrer', // *client, no-referrer
        }).then(response => response.json());
    }

    // 获取Issue相关联的remoteLink
    async _fetchIssueRemoteLinks(issueKey){
        let url = getJiraHost() + `rest/api/2/issue/${issueKey}/remotelink`;
        
        return fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json'
            },
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            //referrer: 'no-referrer', // *client, no-referrer
        }).then(response => response.json());
    }

    // 获取Issues
    // 参考 https://docs.atlassian.com/software/jira/docs/api/REST/7.6.1/#api/2/search-search
    async _fetchJqlIssues(jql, maxResults, startAt, hasChangeLog = false, fields = undefined){
        let fields2 = undefined;
        if (fields) {
            fields2 = fields.filter(f => f != "changelog");
        }
        let expand = hasChangeLog ? ["changelog"] : [];
        return fetch(getJiraHost() + 'rest/api/2/search/', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify({jql: jql,
                                startAt : startAt,
                                maxResults : maxResults,
                                fields: fields2,
                                expand : expand,
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
        }).then(response => response.json());
    }

    async _fetchCurrentUserName(){
        return fetch(getJiraHost() + 'rest/api/2/myself/', {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            //body: JSON.stringify({jql: "key=BIMMEP-4773",
            //                    //maxResults : 0,
            //                    }), // must match 'Content-Type' header
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json'
            },
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            //referrer: 'no-referrer', // *client, no-referrer
        }).then(response => response.json());
    }

    // 给某一个Issue添加评论
    async addComment(issueKey, comment){
        return fetch(getJiraHost() + 'rest/api/2/issue/' + issueKey + '/comment', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify({
                "body": comment}), // must match 'Content-Type' header
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json'
            },
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            //referrer: 'no-referrer', // *client, no-referrer
        }).then(response => response.json());
    }
    
    // 用字符串数组方式表示Dict的下标
    // 比如var hh = {"a" : 1, "b" : {"c" : 2}};
    // 则_getDictValue(hh, ["b","c"])返回2
    _getDictValue(o, a) {
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in o) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
    }
}