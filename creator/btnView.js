
import { Model }  from './model.js'
import { JiraIssueCreator } from '../model/jiraIssueCreator.js'

export class BtnPanel{
    
    constructor(id, logMsg, model){
        this.panelId = id;
        this.model = model;
        this.logMsg = logMsg;
        this.ids = {
            addEpic  : 'addEpic',
            addStory  : 'addStory',
            clearLog  : 'clearLog',
            // test  : 'test',

            // 创建史诗对话框的控件id
            createEpicDlgProject                : 'createEpicDlgProject',
            createEpicDlgEpicName               : 'createEpicDlgEpicName',
            createEpicDlgComponentName          : 'createEpicDlgComponentName',
            createEpicDlgVersions               : 'createEpicDlgVersions',
            createEpicDlgIsCreateSameNameStory  : 'createEpicDlgIsCreateSameNameStory',

            // 创建故事对话框的控件id
            createStoryDlgProject                 : 'createStoryDlgProject',
            createStoryDlgEpicKey                 : 'createStoryDlgEpicKey',
            createStoryDlgStoryName               : 'createStoryDlgStoryName',
            createStoryDlgStoryDescription        : 'createStorDlgStoryDescription',
            createStoryDlgComponentNames          : 'createStoryDlgComponentNames',
            createStoryDlgVersions                : 'createStoryDlgVersions',
        };
        this.lastEpic = {
            projName : "JGVIRUS",
            epicName : "",
            componentName : "",
            versionsString : "",
        }
        this.lastStory = {
            projName : "JGVIRUS",
            epicKey : "",
            storyName : "",
            description : "",
            componentNamesString : "",
            versionsString : "",
        }
    }
    createHtml(){

        let html = `
            <div style="float:left;margin:4px">
                <button class="w2ui-btn" id="${this.ids.addEpic}">添加史诗 </button>
                <button class="w2ui-btn" id="${this.ids.addStory}">添加故事 </button>
                <button class="w2ui-btn" id="${this.ids.clearLog}">清空输出 </button>
            </div>
        `;
        return html;

    }

    // config控件
    configControls(){
        // 绑定回调函数
        $('#' + this.ids.addEpic).on( "click", this._addEpic.bind(this) );
        $('#' + this.ids.addStory).on( "click", this._addStory.bind(this) );
        $('#' + this.ids.clearLog).on( "click", this._clearLog.bind(this) );
        // $('#' + this.ids.test).on( "click", this._test.bind(this) );
    }

    
    _addEpic(){
        let contentHtml = `
        <div>
            <form>
                <label for="${this.ids.createEpicDlgProject}">项目空间:</label>
                <select name="projects" id="${this.ids.createEpicDlgProject}" value="JGVIRUS">
                </select><br>

                <label for="${this.ids.createEpicDlgEpicName}">史诗名称:</label>
                <input type="text" id="${this.ids.createEpicDlgEpicName}" name="epicName"><br>
                
                <label for="${this.ids.createEpicDlgComponentName}">模块(史诗只支持一个模块):</label>
                <input type="text" id="${this.ids.createEpicDlgComponentName}" name="componentName"><br>
                
                <label for="${this.ids.createEpicDlgVersions}">版本号(支持多个，英文分号分隔):</label>
                <input type="text" id="${this.ids.createEpicDlgVersions}" name="versions" placeholder="例如：main;21-V1.5.1"><br>

                <input type="checkbox" id="${this.ids.createEpicDlgIsCreateSameNameStory}" name="createSameNameStory" > 创建同名故事 <br>
            </form>
        </div>
        `;

        let _this = this;
        w2popup.open({
            title: '请输入史诗信息',
            body: contentHtml,
            buttons: `
                <button class="w2ui-btn" onclick="w2popup['create'] = false;w2popup.close();">Close</button>
                <button class="w2ui-btn" onclick="w2popup['create'] = true;w2popup.close();">创建</button>
                `,
            width: 500,
            height: 450,
            overflow: 'hidden',
            color: '#333',
            speed: '0.3',
            opacity: '0.8',
            modal: true,
            showClose: true,
            showMax: false,
            onOpen(event) {
                event.onComplete = () => {
                    let selProject = document.getElementById(_this.ids.createEpicDlgProject);
                    let projects = _this.model.getRecentProjects();
                    for (var i = 0; i<projects.length; i++){
                        let opt = document.createElement('option');
                        opt.value = projects[i];
                        opt.innerHTML = projects[i];
                        if (projects[i] == _this.lastEpic.projName){
                            opt.setAttribute("selected", "selected");
                        }
                        selProject.appendChild(opt);
                    }

                    document.getElementById(_this.ids.createEpicDlgEpicName).value = _this.lastEpic.epicName;
                    document.getElementById(_this.ids.createEpicDlgComponentName).value = _this.lastEpic.componentName;
                    document.getElementById(_this.ids.createEpicDlgVersions).value = _this.lastEpic.versionsString;
                 }
            },
            async onClose(event) {
                if (w2popup['create']) {

                    // 选择的项目空间
                    let selProj = document.getElementById(_this.ids.createEpicDlgProject);
                    let projName = selProj.options[selProj.selectedIndex].text;

                    // 史诗名称
                    let epicName = document.getElementById(_this.ids.createEpicDlgEpicName).value;

                    // 模块名
                    let componentName = document.getElementById(_this.ids.createEpicDlgComponentName).value;

                    // 影响版本
                    let versionsString = document.getElementById(_this.ids.createEpicDlgVersions).value;
                    let versions = versionsString.split(';').map(function(e){return {"name":e}});

                    // 是否创建同名故事
                    let isCreateSameNameStory = document.getElementById(_this.ids.createEpicDlgIsCreateSameNameStory).checked;

                    // 保存设置
                    _this.lastEpic.projName = projName;
                    _this.lastEpic.epicName = epicName;
                    _this.lastEpic.componentName = componentName;
                    _this.lastEpic.versionsString = versionsString;

                    const epicIssue = {
                        "fields": {
                            "project":
                            {
                                "key": projName
                            },
                            "summary": epicName,
                            "customfield_10104": epicName,
                            "components": [{"name":componentName}],
                            "versions": versions,
                            "issuetype": {
                                "name": "Epic"
                            }
                        }
                    }
                    
                    let epicRet = await new JiraIssueCreator().createJiraIssue(epicIssue);

                    _this._ret2Html(epicIssue, epicRet);

                    if (isCreateSameNameStory && "key" in epicRet){
                        const storyIssue = {
                            "fields": {
                               "project":
                               {
                                  "key": projName
                               },
                               "summary": epicName,
                               "description": "",
                               "components": [{"name":componentName}],
                               "versions": versions,
                               "customfield_10102": epicRet["key"],
                               "issuetype": {
                                  "name": "故事"
                               }
                           }
                        }

                        let storyRet = await new JiraIssueCreator().createJiraIssue(storyIssue);

                        _this._ret2Html(storyIssue, storyRet);
                    }
                }
           },
        });
    }

    _addStory(){
        let contentHtml = `
        <div>
            <form>
                <label for="${this.ids.createStoryDlgProject}">项目空间:</label>
                <select name="projects" id="${this.ids.createStoryDlgProject}" value="JGVIRUS">
                </select><br>

                <label for="${this.ids.createStoryDlgEpicKey}">史诗ID:</label>
                <input type="text" id="${this.ids.createStoryDlgEpicKey}" name="epicKey"><br>

                <label for="${this.ids.createStoryDlgStoryName}">故事名称:</label>
                <input type="text" id="${this.ids.createStoryDlgStoryName}" name="storyName"><br>
                
                <label for="${this.ids.createStoryDlgStoryDescription}">故事描述:</label>
                <input type="text" id="${this.ids.createStoryDlgStoryDescription}" name="description"><br>

                <label for="${this.ids.createStoryDlgComponentNames}">模块(支持多个，英文分号分隔):</label>
                <input type="text" id="${this.ids.createStoryDlgComponentNames}" name="componentName" placeholder="例如：PM;STS"><br>
                
                <label for="${this.ids.createStoryDlgVersions}">版本号(支持多个，英文分号分隔):</label>
                <input type="text" id="${this.ids.createStoryDlgVersions}" name="versions" placeholder="例如：main;21-V1.5.1"><br>
            </form>
        </div>
        `;

        
        let _this = this;
        w2popup.open({
            title: '请输入故事信息',
            body: contentHtml,
            buttons: `
                <button class="w2ui-btn" onclick="w2popup['create'] = false;w2popup.close();">Close</button>
                <button class="w2ui-btn" onclick="w2popup['create'] = true;w2popup.close();">创建</button>
                `,
            width: 500,
            height: 450,
            overflow: 'hidden',
            color: '#333',
            speed: '0.3',
            opacity: '0.8',
            modal: true,
            showClose: true,
            showMax: false,
            onOpen(event) {
                event.onComplete = () => {
                    let selProject = document.getElementById(_this.ids.createStoryDlgProject);
                    let projects = _this.model.getRecentProjects();
                    for (var i = 0; i<projects.length; i++){
                        let opt = document.createElement('option');
                        opt.value = projects[i];
                        opt.innerHTML = projects[i];
                        if (projects[i] == _this.lastStory.projName){
                            opt.setAttribute("selected", "selected");
                        }
                        selProject.appendChild(opt);
                    }

                    document.getElementById(_this.ids.createStoryDlgEpicKey).value          = _this.lastStory.epicKey;
                    document.getElementById(_this.ids.createStoryDlgStoryName).value        = _this.lastStory.storyName;
                    document.getElementById(_this.ids.createStoryDlgStoryDescription).value = _this.lastStory.description;
                    document.getElementById(_this.ids.createStoryDlgComponentNames).value   = _this.lastStory.componentNamesString;
                    document.getElementById(_this.ids.createStoryDlgVersions).value         = _this.lastStory.versionsString;
                 }
            },
            async onClose(event) {
                if (w2popup['create']) {

                    // 选择的项目空间
                    let selProj = document.getElementById(_this.ids.createStoryDlgProject);
                    let projName = selProj.options[selProj.selectedIndex].text;

                    // 史诗ID
                    let epicKey = document.getElementById(_this.ids.createStoryDlgEpicKey).value;

                    // 故事名称
                    let storyName = document.getElementById(_this.ids.createStoryDlgStoryName).value;

                    // 故事描述
                    let description = document.getElementById(_this.ids.createStoryDlgStoryDescription).value;

                    // 模块名
                    let componentNamesString = document.getElementById(_this.ids.createStoryDlgComponentNames).value;
                    let components = componentNamesString.split(';').map(function(e){return {"name":e}});

                    // 影响版本
                    let versionsString = document.getElementById(_this.ids.createStoryDlgVersions).value;
                    let versions = versionsString.split(';').map(function(e){return {"name":e}});


                    // 保存设置
                    _this.lastStory.projName = projName;
                    _this.lastStory.epicKey = epicKey;
                    _this.lastStory.storyName = storyName;
                    _this.lastStory.description = description;
                    _this.lastStory.componentNamesString = componentNamesString;
                    _this.lastStory.versionsString = versionsString;

                    const storyIssue = {
                        "fields": {
                           "project":
                           {
                              "key": projName
                           },
                           "summary": storyName,
                           "description": description,
                           "components": components,
                           "versions": versions,
                           "customfield_10102": epicKey,
                           "issuetype": {
                              "name": "故事"
                           }
                       }
                    }

                    let storyRet = await new JiraIssueCreator().createJiraIssue(storyIssue);

                    _this._ret2Html(storyIssue, storyRet);
                }
           },
        });
    }
    
    _clearLog(){
        
        window.dispatchEvent(new CustomEvent(this.logMsg,{
            detail :{
                flush: true,
                log : {},
            }
        }
    ));
    }

    // _test(){
    //     const retObj = {
    //         "errorMessages": [],
    //         "errors": {
    //             "components": "组件名称“12”是无效的"
    //         },
    //         "key" : "JGVIRUS-21072"
    //     }
    //     const reqIssue = {
    //         "fields": {
    //             "project":
    //             {
    //                 "key": "JGVIRUS"
    //             },
    //             "summary": "层间板功能优化",
    //             //"description": "描述-测试自动创建史诗",
    //             "customfield_10104": "层间板功能优化",
    //             "components": [{"name":"PM"}],
    //             "versions": [{"name":"main"}],
    //             "issuetype": {
    //                 "name": "Epic"
    //             }
    //         }
    //     }
    //     this._ret2Html(reqIssue, retObj);
    // }

    _ret2Html(reqIssue, retObj){

        let divStatus = document.createElement('div');

        let spanStatus = document.createElement('span');
        let spanStatusBold = document.createElement('b');
        spanStatus.appendChild(spanStatusBold);
        if ("key" in retObj){
            spanStatusBold.innerText = "创建成功：";
            let aStatus = document.createElement('a');
            aStatus.href = `https://jira.pkpm.cn/browse/${retObj["key"]}`
            aStatus.innerText = `https://jira.pkpm.cn/browse/${retObj["key"]}`
            spanStatus.appendChild(aStatus)
        }else{
            spanStatusBold.innerText = "创建失败："
        }
        divStatus.appendChild(spanStatus)
        divStatus.appendChild(document.createElement('br'))

        let spanReq = document.createElement('span');
        let spanReqBold = document.createElement('b');
        spanReqBold.innerText = "请求如下："
        spanReq.appendChild(spanReqBold);
        divStatus.appendChild(spanReq)
        divStatus.appendChild(document.createElement('br'))
        let spanReqJson = document.createElement('span');
        spanReqJson.innerText = JSON.stringify(reqIssue);
        divStatus.appendChild(spanReqJson)
        divStatus.appendChild(document.createElement('br'))

        let spanRet = document.createElement('span');
        let spanRetBold = document.createElement('b');
        spanRetBold.innerText = "返回如下："
        spanRet.appendChild(spanRetBold);
        divStatus.appendChild(spanRet)
        divStatus.appendChild(document.createElement('br'))
        let spanRetJson = document.createElement('span');
        spanRetJson.innerText = JSON.stringify(retObj);
        divStatus.appendChild(spanRetJson)
        divStatus.appendChild(document.createElement('br'))
        

        window.dispatchEvent(new CustomEvent(this.logMsg,{
                detail :{
                    flush: false,
                    log : divStatus,
                }
            }
        ));
    }
}
