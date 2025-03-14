/*
报告方式显示的框架
*/

import {  getScriptHost, loadJsOrCss } from "./../model/toolSet.js";
import { getReport }            from "./reportFactory.js";

export class EnhancedReportFrame{
    constructor(viewConfig, model){
        this.viewConfig = viewConfig;
        this.model = model;
        this.ids = {
            tabs                        : 'tabs',                       // 标签页的Div
            report                      : 'report',                     // report的Div
        };      // 各种控件ID定义
        this.reports = {};      // 各种报告的实例化
    }

    async prepare(){
        // 加载外部依赖的文件
        await this._loadExternalResource();
    }


    // 初始化框架
    show(){

        this._createLayout();
        let reportsConfig = this.viewConfig;
        let tabs = []
        for (const [k,v] of Object.entries(reportsConfig)) {
            tabs.push(
                {
                    id : k,
                    text : v.tab.name,
                }
            );
            this.reports[k] = getReport(v.report.viewClass, this.ids.report, v.report, this.model);
        }

        $('#'+this.ids.tabs).w2tabs({
            name: 'tabs',
            tabs: tabs,
            active: Object.keys(reportsConfig)[0],
            onClick: event => {
                let tabId = event.target;
                this.reports[tabId].updateView();
            },
        });

        // 默认显示第一个
        this.reports[Object.keys(reportsConfig)[0]].updateView();
    }
    
    _createLayout(){
        
        // 清空内容
        $('body').empty();
        
        // 创建容器div
        let tabs = document.createElement('div');
        tabs.id = this.ids.tabs;
        tabs.style.width = "100%";
        document.body.appendChild(tabs);
        let report = document.createElement('div');
        report.id = this.ids.report;
        document.body.appendChild(report);
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
            ////-------- chart.js，用于chart的绘制，目前必须用2.9版本的，因为chartlabel这个js还没适配V3以上的chart.js--
            host + "Chart.min.js",
            host + "chartjs-plugin-datalabels.min.js",
            host + "Chart.min.css",
            //// ------------------- 加载 Select2，用于筛选器 ------------------
            //host + "select2.min.js",
            //host + "select2.min.css",
            ////-------- 加载 contextMenu，用于控件菜单--------------
            //host + "contextMenu.min.js",
            //host + "contextMenu.min.css",
            ////-------- 加载 pinyin，用于拼音过滤 -------------
            //host + "pinyin_dict_notone.js",
            //host + "pinyinUtil.js",
        ];

        for (const s of loadList) {
            await loadJsOrCss(window.document.head, s);
        }
    }

}