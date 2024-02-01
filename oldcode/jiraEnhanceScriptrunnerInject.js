function getJiraHost(){
    return "https://jira.pkpm.cn/";
}
function getScriptHost(){
    return "http://127.0.0.1:5500/";
}

// 打开新的标签页，展示更好用的筛选器或者报告
// mode(string) - 模式 filter或report
// scriptUrl - 新标签页的入口URL
async function showEnhanceTab(mode, scriptUrl, isDebug = false){
    try{
        let jql = getJQL();
        let w = window.open();
        if (!w){
            alert("弹出窗口失败，请允许jira.pkpm.cn弹出窗口。");;
            return;
        }
        w.jql = jql;
        w.mode = mode;
        w.isDebug = isDebug;
        //w.jiraHost = "https://jira.pkpm.cn/"
        //w.scriptHost = "https://jira.pkpm.cn/"
        w.jiraHost = getJiraHost();
        w.scriptHost = getScriptHost();
        // 修改新打开页面的title
        let tt = document.createElement("title");
        tt.innerHTML = '~~';
        w.document.head.appendChild(tt);

        // 加载入口script URL
        await loadScript(w.document.head, scriptUrl);
    }catch{
        alert('初始化失败');
    }
}

// 获得当前的JQL
function getJQL(){
    // 保证当前是高级状态
    if ($('.switcher-item.active').attr('data-id') == 'basic'){
        $('.switcher-item.active')[0].click();
    }
    return $('#advanced-search').val();
}


async function loadScript(dom, scriptUrl) {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.type = "module";
    dom.appendChild(script);
    
    return new Promise((res, rej) => {
        script.onload = function() {
            res();
        }
        script.onerror = function () {
            rej();
        }
    });
}


async function showFilter(){

    await showEnhanceTab('filter', getScriptHost() + 'entryPoint.js')
}

async function showReport(){

    await showEnhanceTab('report', getScriptHost() + 'entryPoint.js')
}

async function showTestReport(){

    await showEnhanceTab('testReport', getScriptHost() + 'entryPoint.js')
}

async function showIssueCreator(){

    await showEnhanceTab('issueCreator', getScriptHost() + 'entryPoint.js')
}

showEnhanceTab('report', getScriptHost() + 'entryPoint.js', true)