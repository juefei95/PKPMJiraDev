/*
读取Jira数据
*/



export class JiraIssueReader{

    // 这里记录了Jira的所有字段怎么读，因为Jira里所有项目是共享一整套字段ID的，所以这个字段的读法也是唯一的
    // 不同的是不同的项目是用同样的含义映射到不同的字段上，比如“计划提测时间”，两个项目可以能一个人用的是
    // 字段1，一个用的是字段2
    static emptyText = "Empty Field";
    static invalidDate = new Date('1999-01-01');
    static fieldReadConfig = {
        'key' : {
            'f' : i => i.key,
            'jqlName' : 'key',
        },
        'fields' : {
            'components'        : {
                'f' : i => 'components' in i.fields && i.fields.components.length > 0               ? i.fields.components[0].name                   : JiraIssueReader.emptyText,
                'jqlName' : 'component',
            },
            'summary'           : {
                'f' : i => 'summary' in i.fields                                                    ? i.fields.summary                              : JiraIssueReader.emptyText,
                'jqlName' : 'summary',
            },
            'status'            : {
                'f' : i => 'status' in i.fields && 'name' in i.fields.status                        ? i.fields.status.name                          : JiraIssueReader.emptyText,
                'jqlName' : 'status',
            },
            // 同时也作为结构流程中Bug的测试人员
            'reporter'          : {
                'f' : i => 'reporter' in i.fields && i.fields.reporter !== null                     ? i.fields.reporter.displayName                 : JiraIssueReader.emptyText,
                'jqlName' : 'reporter',
            },
            'assignee'          : {
                'f' : i => 'assignee' in i.fields && i.fields.assignee !== null                     ? i.fields.assignee.displayName                 : JiraIssueReader.emptyText,
                'jqlName' : 'assignee',
            },
            'resolution'        : {
                'f' : i => 'resolution' in i.fields && i.fields.resolution !== null                 ? i.fields.resolution.name                      : JiraIssueReader.emptyText,
                'jqlName' : 'resolution',
            },
            'created'           : {
                'f' : i => 'created' in i.fields && i.fields.created !== null                       ? new Date(i.fields.created.slice(0,10))        : JiraIssueReader.invalidDate,
                'jqlName' : 'created',
            },
            'resolutiondate'    : {
                'f' : i => 'resolutiondate' in i.fields && i.fields.resolutiondate !== null         ? new Date(i.fields.resolutiondate.slice(0,10)) : JiraIssueReader.invalidDate,
                'jqlName' : 'resolutiondate',
            },
            // 结构流程的designer
            'customfield_10537' : {
                'f' : i => 'customfield_10537' in i.fields && i.fields.customfield_10537 !== null   ? i.fields.customfield_10537.displayName        : JiraIssueReader.emptyText,
                'jqlName' : '需求人员',
            },
            // 结构流程的developer
            'customfield_10538' : {
                'f' : i => 'customfield_10538' in i.fields && i.fields.customfield_10538 !== null   ? i.fields.customfield_10538.displayName        : JiraIssueReader.emptyText,
                'jqlName' : '研发人员',
            },
            // 结构流程的tester
            'customfield_10539' : {
                'f' : i => 'customfield_10539' in i.fields && i.fields.customfield_10539 !== null   ? i.fields.customfield_10539.displayName        : JiraIssueReader.emptyText,
                'jqlName' : '测试人员',
            },
            // confluence_link
            'customfield_10713' : {
                'f' : i => 'customfield_10713' in i.fields && i.fields.customfield_10713 !== null   ? i.fields.customfield_10713                    : JiraIssueReader.emptyText,
                'jqlName' : 'Confluence链接 ',
            },
            // 结构流程的产品设计计划提交时间
            'customfield_11415' : {
                'f' : i => 'customfield_11415' in i.fields && i.fields.customfield_11415 !== null   ? new Date(i.fields.customfield_11415)          : JiraIssueReader.invalidDate,
                'jqlName' : '产品计划提交时间',
            },
            // 结构流程的研发提测时间
            'customfield_11408' : {
                'f' : i => 'customfield_11408' in i.fields && i.fields.customfield_11408 !== null   ? new Date(i.fields.customfield_11408)          : JiraIssueReader.invalidDate,
                'jqlName' : '研发计划提测时间',
            },
            // 解决人
            'customfield_10716' : {
                'f' : i => 'customfield_10716' in i.fields && i.fields.customfield_10716 !== null   ? i.fields.customfield_10716.displayName        : JiraIssueReader.emptyText,
                'jqlName' : '解决人',
            },
            // Bug等级 
            'customfield_10510' : {
                'f' : i => 'customfield_10510' in i.fields && i.fields.customfield_10510 !== null   ? i.fields.customfield_10510.value              : JiraIssueReader.emptyText,
                'jqlName' : 'bug严重等级',
            },
            // 优先级
            'priority'          : {
                'f' : i => 'priority'          in i.fields && i.fields.priority !== null            ? i.fields.priority.name                        : JiraIssueReader.emptyText,
                'jqlName' : 'priority',
            },
            // 影响版本
            'versions'          : {
                'f' : i => 'versions'          in i.fields && i.fields.versions.length > 0          ? i.fields.versions[0].name                     : JiraIssueReader.emptyText,
                'jqlName' : 'affectedVersion',
            },
            // 修复版本
            'fixVersions'       : {
                'f' : i => 'fixVersions'       in i.fields && i.fields.fixVersions.length > 0       ? i.fields.fixVersions[0].name                  : JiraIssueReader.emptyText,
                'jqlName' : 'fixVersion',
            },
            // 史诗链接
            'customfield_10102' : {
                'f' : i => 'customfield_10102' in i.fields && i.fields.customfield_10102 !== null   ? i.fields.customfield_10102                    : JiraIssueReader.emptyText,
                'jqlName' : '史诗链接',
            },
            // 变更集号
            'customfield_10703' : {
                'f' : i => 'customfield_10703' in i.fields && i.fields.customfield_10703 !== null   ? i.fields.customfield_10703                    : JiraIssueReader.emptyText,
                'jqlName' : '变更集号',
            },
            // PC流程的研发计划提测时间
            'customfield_11308' : {
                'f' : i => 'customfield_11308' in i.fields && i.fields.customfield_11308 !== null   ? new Date(i.fields.customfield_11308)          : JiraIssueReader.invalidDate,
                'jqlName' : '计划提验时间',
            },
            // PC流程的研发实际提测时间
            'customfield_11409' : {
                'f' : i => 'customfield_11409' in i.fields && i.fields.customfield_11409 !== null   ? new Date(i.fields.customfield_11409)          : JiraIssueReader.invalidDate,
                'jqlName' : '实际提测时间',
            },
            // PC流程的测试计划结束时间
            'customfield_11312' : {
                'f' : i => 'customfield_11312' in i.fields && i.fields.customfield_11312 !== null   ? new Date(i.fields.customfield_11312)          : JiraIssueReader.invalidDate,
                'jqlName' : '计划测试结束',
            },
            // PC流程的测试备注
            'customfield_11443' : {
                'f' : i => 'customfield_11443' in i.fields && i.fields.customfield_11443 !== null   ? i.fields.customfield_11443                    : JiraIssueReader.emptyText,
                'jqlName' : '测试备注',
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
    //     fieldsDict({string : array of string}) - 字典，key是字段的名字，value是从issue里去获取的路径，匹配fieldReaderConfig使用
    // return:
    //     data(array of dict) - 读取的数据
    async read(jql, fieldsDict){
        // 根据fieldsDict获取fields
        let fields = [];
        Object.values(fieldsDict).forEach(v =>{
            if (v[v.length - 1] !== 'key'){
                fields.push(v[v.length - 1]);
            }
        });
        let issues = await this._fetchJqlIssues(jql, fields, 1000);

        // 从issues中提取值
        let data = [];
        for (const i of issues.issues){
            let o = {};
            // 循环每个待提取的字段
            for (const [k, v] of Object.entries(fieldsDict)){
                let f = this._getDictValue(JiraIssueReader.fieldReadConfig, v)['f'];
                o[k] = f(i);
            }
            data.push(o);
        }

        return data;
    }


    // 获取数据对应的JQL名字，用于搜索
    getJQLName(path){
        return this._getDictValue(JiraIssueReader.fieldReadConfig, path)['jqlName']
    }
    
    // 获取Issues
    // 参考 https://docs.atlassian.com/software/jira/docs/api/REST/7.6.1/#api/2/search-search
    async _fetchJqlIssues(jql, fields, maxResults){
        let fields2 = fields.filter(f => f != "changelog");
        let expand = fields.includes("changelog") ? ["changelog"] : [];
        return fetch('https://jira.pkpm.cn/rest/api/2/search/', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify({jql: jql,
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