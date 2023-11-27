// ==UserScript==
// @name         PkpmJiraEnhance
// @namespace    https://jira.pkpm.cn/
// @version      0.1
// @description  增强Jira的显示，符合PKPM的使用习惯
// @author       You
// @match        https://jira.pkpm.cn/browse/*
////// @icon         https://www.google.com/s2/favicons?sz=64&domain=pkpm.cn
// @grant        none
// @run-at          document-end
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    function addPeopleDetail(label, userName){
        let domStr =
        `
<dl>
    <dt>${label}:</dt>
    <dd>
        <span lass="view-issue-field inactive">
            ${userName}
        </span>
    </dd>
</dl>
        `
        document.getElementById('peopledetails').insertAdjacentHTML( 'beforeend', domStr );
    }

    function getWhoChangeToCodeMerge() {
        let divs = document.getElementsByClassName("actionContainer");
        for(let i=divs.length-1; i>=0; i--){
            let tds = divs[8].getElementsByTagName('td');
            for(let j=0; j<tds.length; j++){
                if(tds[j].innerText=="状态"){
                    return tds[j-2].innerText;
                }
            }
        }
    }

    function switchToHistoryPanel(){
        $("a#changehistory-tabpanel").click();
    }

    switchToHistoryPanel();
    let user = getWhoChangeToCodeMerge();
    if(user){
        addPeopleDetail('谁改到了合并代码：', user);
    }

})();