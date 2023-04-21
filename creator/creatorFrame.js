
import {  getScriptHost, loadJsOrCss } from "./../model/toolSet.js";

import { BtnPanel }             from './btnView.js'
import { LoggerPanel }             from './loggerView.js'

export class CreatorFrame{
    constructor(model){

        this.model = model

        this.ids = {
            outmostDiv                      : 'outmostDiv',                     // 最外层的Div
            outmostLayoutName               : 'outmostLayoutName',                    // 最外层级的w2ui的布局名，用来后续引用用

            btnPanel                        : 'btnPanel',
            loggerPanel                     : 'loggerPanel',

        };      // 各种控件ID定义
        this.msg = {
            showCreateIssuesLog : "showCreateIssuesLog",
        }

        // 各种Panel
        this.btnPanel          = new BtnPanel      (this.ids.btnPanel, this.msg.showCreateIssuesLog, this.model);
        this.loggerPanel       = new LoggerPanel   (this.ids.loggerPanel, this.msg.showCreateIssuesLog);

    }

    
    async prepare(){
        // 加载外部依赖的文件
        await this._loadExternalResource();
    }

    // 初始化框架
    show(){
        this._setTabTile();
        // 划分layout
        this._createLayout();
        // 每个layout里放置容器
        w2ui[this.ids.outmostLayoutName].html('top', this.btnPanel.createHtml());
        w2ui[this.ids.outmostLayoutName].html('main', this.loggerPanel.createHtml());
        // 容器里填充控件
        this._configControls();
    }
    
    _setTabTile(){
        
        // 修改Tab标题
        let title = "批量创建史诗和故事";
        window.document.title = title;
    }

    // 把框架的各个分区布局做好
    _createLayout(){
        // 清空内容
        $('body').empty();
        // 最外层的Div
        $('body').append(`<div id=${this.ids.outmostDiv} style="width: 100%; height: 100vh;"></div>`);

        // 先划分区
        let _pstyle = 'border: 1px solid #dfdfdf; padding: 5px;';
        let w2uiLayout = {
            name: this.ids.outmostLayoutName,
            padding: 4,
            panels: [
                { type: 'top', size: 200, resizable: true, style: _pstyle, content: 'top' },
                { type: 'main', resizable: true, style: _pstyle, content: 'main' },
            ],
        };
        $('#' + this.ids.outmostDiv).w2layout(w2uiLayout);

    }

    // 控件都渲染好后，设置回调、事件响应等
    _configControls(event){
        this.btnPanel.configControls();
        this.loggerPanel.configControls();
    }


    async _loadExternalResource(){
        
        let host = getScriptHost() + 'resource/';
        let loadList = [
            // ------------------- 依赖jquery和jquery-ui
            host + "jquery-2.2.4.min.js",
            //host + "jquery-3.6.js",
            host + "jquery-ui.min.js",
            // ------------------- 依赖w2ui------------------
            //host + "w2ui_v1.5_modify.min.js",
            //host + "w2ui-1.5.min.css",
            host + "w2ui-1.4.2_modified.js",        // 在文件里搜索modify by sjx 就可以知道我相比源代码改了什么
            host + "w2ui-1.4.2.css",
            // ------------------- 加载 Select2，用于筛选器 ------------------
            host + "select2.min.js",
            host + "select2.min.css",
        ];

        for (const s of loadList) {
            await loadJsOrCss(window.document.head, s);
        }
    }
}