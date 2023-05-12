
import { printInfo, loadJsOrCss, getScriptHost }                from "./../model/toolSet.js";
import { JQL }                      from './../model/jqlParser.js';
import { JiraIssueReader }          from './../model/jiraIssueReader.js'
import { getJiraHost }              from './../model/toolSet.js'

export async function helloTestReport(){
    try {
        window.document.title = "测试报告";
        let app = new MainApp();
        await app.init();
    } catch (err) {
        debugger;
        printInfo("生成测试报告时发生错误：");
        printInfo(err.stack);
        return;
    }
}

class MainApp
{
    constructor(){
        this.appId = "app";
    }

    async init(){
        await this._loadExternalResource();
        this._insertTemplate();
        await this._mountApp();
    }

    _insertTemplate(){

        let templateStr = `
            <div id="${this.appId}">
            </div>
        `;
        document.body.innerHTML += templateStr;
    }

    async _mountApp(){
        const App = {
            template : _template(),
            data : _data,
            mounted : _mount,
            //computed : _computed(),
            watch: {
                //ciConfig: {
                //    handler(newVal, oldVal) {
                //        console.log(newVal, oldVal)
                //    //axios.get("/Branches?repo=" + newSelect).then((response) => {
                //    //   this.branchOptions = response.data;
                //    //})
                //    },
                //    deep: true
                //},
            },
            methods: _methods(),
        }
        Vue.createApp(App).mount('#app');
    }

    async _loadExternalResource(){
        
        let host = getScriptHost() + 'resource/';
        let loadList = [
            host + "bootstrap4.1.3.min.css",
            host + "bootstrap4.1.3.min.js",
            host + "jquery-3.3.1.slim.min.js",
            host + "popper1.14.3.min.js",
            host + "vue.3.2.26.js",
        ];
    
        for (const s of loadList) {
            await loadJsOrCss(window.document.head, s);
        }
    }
}


function _template(){
    return `
        <h2>{{message}}</h2>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>编号</th>
                        <th>ID</th>
                        <th>计划发布功能</th>
                        <th>实际发布功能</th>
                        <th>是否有产品设计</th>
                        <th>需求评审次数</th>
                        <th>需求验证次数</th>
                        <th>是否有需求验证点</th>
                        <th>研发时间（人天）</th>
                        <th>提测次数</th>
                        <th>计划需求评审时间</th>
                        <th>实际需求评审时间</th>
                        <th>计划提验时间</th>
                        <th>实际提验时间</th>
                        <th>计划提测时间</th>
                        <th>实际提测时间</th>
                        <th>延期天数</th>
                        <th>用例数</th>
                        <th>Bug数</th>
                        <th>解决率</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(story, index) in storyList">
                        <tr>
                            <td>{{index+1}}</td>
                            <td><a :href="story.url" target="_blank">{{story.id}}</a></td>
                            <td>{{story.title}}</td>
                            <td>{{story.published}}</td>
                            <td>{{story.hasDoc}}</td>
                            <td>{{story.designReviewCount}}</td>
                            <td>{{story.designValidationCount}}</td>
                            <td>{{story.hasDesignValidationPoint}}</td>
                            <td>{{story.devDays}}</td>
                            <td>{{story.testCommitCount}}</td>
                            <td>{{story.docPlanReviewDate}}</td>
                            <td>{{story.docActualReviewDate}}</td>
                            <td>{{story.programPlanCommitDate}}</td>
                            <td>{{story.programActualCommitDate}}</td>
                            <td>{{story.designerPlanCommitTestDate}}</td>
                            <td>{{story.designerActualCommitTestDate}}</td>
                            <td>{{story.delayDays}}</td>
                            <td>{{story.testcasesCount}}</td>
                            <td>{{story.bugsCount}}</td>
                            <td>{{story.bugResolveRate}}</td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    `
}

function _data(){
    return {
        "message" : "测试报告",
        "storyList" : [
            //{
            //    id : "abc-1",
            //}
        ],
        "jiraHost" : getJiraHost(),
    }
}

async function _mount(){
    let date2String = (d)=>{
        if (d!==undefined) return d.toLocaleDateString();
        else return "";
    }

    let diffDays = (d1, d2) => {
        if(d1 != undefined && d2 !=undefined) return ((d1 - d2) / 86400000).toString();
        else return "NaN";
    };

    let jql = new JQL(window.jql);
    let reader = new JiraIssueReader();
    let issues = await reader.readForTestReport(jql.getRawJQL());
    for (const issue of issues) {
        let issueKey = issue.getJiraId();
        let issueLinkBug = issue.getLinkBugs();
        let testcaseBugs = await reader.readIssueLinkTestCaseBugs(issueKey);
        let testcaseBugsStatus = [];
        if (testcaseBugs.length != 0) testcaseBugsStatus = await reader.readBugStatus(testcaseBugs);
        let resolvedBugCount = 0;
        if (issueLinkBug.length !=0) {
            issueLinkBug.forEach(b => ["已解决","已关闭"].includes(b.status) ? resolvedBugCount++ : 0);
        }
        if (testcaseBugs.length !=0) {
            for (let index = 0; index < testcaseBugs.length; index++) {
                ["已解决","已关闭"].includes(testcaseBugsStatus[index].getStatus()) ? resolvedBugCount++ : 0;
            }
        }
        let bugsCount = issueLinkBug.length + testcaseBugs.length;
        let bugResolveRate = bugsCount!=0 ? Math.round(resolvedBugCount*100/bugsCount) + "%" : "100%";
        let testcases = await reader.readIssueLinkTestCases(issueKey);
        this.storyList.push({
            id : issueKey,
            url : getJiraHost() + 'browse/'+ issueKey,
            title : issue.getTitle(),
            hasDoc : (issue.getAttr("confluenceLink") != undefined ? true : (await reader.readIssueRemoteLinks(issueKey)).some(l => l.type === "Confluence"))  ? "√" : "x",
            published : ["完成", "需求已发布"].includes(issue.getStatus()) ? "√" : "x",
            designReviewCount : issue.getStatusCount("需求待评审"),
            designValidationCount : issue.getStatusCount("需求验证"),
            testCommitCount : issue.getStatusCount("已提测"),
            docPlanReviewDate : date2String(issue.getDocPlanReviewDate()),
            docActualReviewDate : date2String(issue.getDocActualReviewDate()),
            programPlanCommitDate : date2String(issue.getProgramPlanCommitDate()),
            programActualCommitDate : date2String(issue.getProgramActualCommitDate()),
            designerPlanCommitTestDate : date2String(issue.getDesignerPlanCommitTestDate()),
            designerActualCommitTestDate : date2String(issue.getDesignerActualCommitTestDate()),
            delayDays : diffDays(issue.getDesignerActualCommitTestDate(),issue.getDesignerPlanCommitTestDate()),
            testcasesCount : testcases.length,
            bugsCount : bugsCount,
            bugResolveRate : bugResolveRate,
        })
    }
}

function  _methods(){
    return {
    }
}