/*
Jira站点相关API
*/

import { getJiraHost } from './toolSet.js'

export class JiraSite{

    async getRecentProjectsName(recentNum = 4){
        let retJson = await this._getRecentProjects(recentNum);
        let projArr = [];
        for (let i=0,len=retJson.length; i<len; i++)
        { 
            projArr.push(retJson[i]["key"]);
        }
        return projArr;
    }

    // 获取最近访问的Projects
    async _getRecentProjects(recentNum = 4){
        let url = getJiraHost() + `rest/api/2/project/?recent=${recentNum}`;
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
}