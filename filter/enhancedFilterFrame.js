/*
这是个加强版的筛选器展示框架，所谓“加强版”是相对Jira原始的筛选器而言
*/

import {  loadScript, loadCss } from "./../model/toolSet.js";
import { ViewConfig }           from "./viewConfig.js"
import { Model }                from "./modelManager.js"

import { FilterViewModel }      from './filterVM.js'
import { FilterPanel }          from './filterView.js'
import { GridViewModel }        from './gridVM.js'
import { GridPanel }            from './gridView.js'
import { ChartViewModel }       from './chartVM.js'
import { ChartPanel }           from './chartView.js'
import { BtnViewModel }         from './btnVM.js'
import { BtnPanel }             from './btnView.js'


export class EnhancedFilterFrame{
    constructor(viewConfig, model){
        this.viewConfig = viewConfig;
        this.model = model;
        this.ids = {
            outmostDiv                      : 'outmostDiv',                     // 最外层的Div
            outmostLayoutName               : 'outmostLayoutName',                    // 最外层级的w2ui的布局名，用来后续引用用
            topDiv                          : 'topDiv',                         // Top用来容纳BtnPanel和FilterPanel的Div
            topLayoutName                   : 'topLayoutName',                 // Top Panel的布局，w2ui的布局名，用来后续引用用

            filterPanel                     : 'filterPanel',
            chartPanel                      : 'chartPanel',
            btnPanel                        : 'btnPanel',
            gridPanel                       : 'GridPanel',
        };      // 各种控件ID定义

        // 创建ViewModel
        this.filterVM   = new FilterViewModel(this.model, this.viewConfig);
        this.gridVM     = new GridViewModel(this.model, this.viewConfig);
        this.chartVM    = new ChartViewModel(this.model, this.viewConfig);
        this.btnVM      = new BtnViewModel(this.model, this.viewConfig);

        // 各种Panel
        this.filterPanel    = new FilterPanel   (this.ids.filterPanel, this.filterVM);
        this.btnPanel       = new BtnPanel      (this.ids.btnPanel, this.btnVM);
        this.gridPanel      = new GridPanel     (this.ids.gridPanel, this.gridVM);
        this.chartPanel     = new ChartPanel    (this.ids.chartPanel, this.chartVM);

        window.addEventListener(this.model.getModelChangeEventName("IssueReget"), this._setTabTile.bind(this));
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
        w2ui[this.ids.outmostLayoutName].html('main', this.gridPanel.createHtml());
        w2ui[this.ids.outmostLayoutName].html('left', this.chartPanel.createHtml());
        w2ui[this.ids.topLayoutName].html('left', this.btnPanel.createHtml());
        w2ui[this.ids.topLayoutName].html('main', this.filterPanel.createHtml());
        // 容器里填充控件
        this._configControls();
    }

    // 所有panel都根据model数据更新一遍
    updateView(event){
        this.gridPanel.updateView(event);
        this.btnPanel.updateView(event);
        this.filterPanel.updateView(event);
        this.chartPanel.updateView(event);
    }

    // 所有panel都根据model数据更新一下控件的可见性
    updateFieldsVisibility(event){
        this.gridPanel.updateFieldsVisibility(event);
        this.btnPanel.updateFieldsVisibility(event);
        this.filterPanel.updateFieldsVisibility(event);
        this.chartPanel.updateFieldsVisibility(event);

        this._updateLayoutSize();
    }
    
    // 更新布局的尺寸，目前只是更新Top Panel的高度
    _updateLayoutSize(){
        let height = this.filterPanel.getHeight();
        let currentHeight = w2ui[this.ids.outmostLayoutName].get('top').size;
        if (currentHeight - height < 15 || currentHeight - height > 20){
            w2ui[this.ids.outmostLayoutName].sizeTo('top', height + 15, true);
        }
    }

    _setTabTile(){
        
        // 修改Tab标题
        let title = this.model.getIssuesNum() + "个Issue的过滤器";
        window.document.title = title;
    }
    
    // 把框架的各个分区布局做好
    _createLayout(){

        // 清空内容
        $('body').empty();
        // 最外层的Div
        $('body').append('<div id="' + this.ids.outmostDiv + '" style="width: 100%; height: 100vh;"></div>');

        // 先划分Top、Left、Main三个区3
        let _pstyle = 'border: 1px solid #dfdfdf; padding: 5px;';
        let w2uiLayout = {
            name: this.ids.outmostLayoutName,
            padding: 4,
            panels: [
                { type: 'top', size: 120, resizable: true, style: _pstyle, content: 'top' },
                { type: 'left', size: 350, resizable: true, style: _pstyle, content: 'left' },
                { type: 'main', resizable: true, style: _pstyle, content: 'main' },
            ],
        };
        $('#' + this.ids.outmostDiv).w2layout(w2uiLayout);

        // Top再分left和main区
        w2ui[this.ids.outmostLayoutName].html('top', '<div id="' + this.ids.topDiv + '" style="width: 100%; height: 100%;"></div>');
        var _pstyle2 = 'border: 0px solid #dfdfdf; padding: 0px;';
        var w2uiLayoutInTop = {
            name: this.ids.topLayoutName,
            padding: 0,
            panels: [
                { type: 'left', size: 100, resizable: false, style: _pstyle2, content: 'left' },
                { type: 'main', resizable: true, style: _pstyle2, content: 'main' },
            ],
        };
        $('#' + this.ids.topDiv).w2layout(w2uiLayoutInTop);

    }

    // 控件都渲染好后，设置回调、事件响应等
    _configControls(event){
        this.filterPanel.configControls();
        this.chartPanel.configControls();
        this.btnPanel.configControls();
        this.gridPanel.configControls();
        this.updateView();  
        this.updateFieldsVisibility();
    }

    async _loadExternalResource(){
        
        let host = window.isDebug ? "http://127.0.0.1:8887/resource/" : "https://shijianxin.gitlabpages.it.pkpm.cn/pkpmjiradev/resource/";
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
            //-------- chart.js，用于chart的绘制，目前必须用2.9版本的，因为chartlabel这个js还没适配V3以上的chart.js--
            host + "Chart.min.js",
            host + "chartjs-plugin-datalabels.min.js",
            host + "Chart.min.css",
            // ------------------- 加载 Select2，用于筛选器 ------------------
            host + "select2.min.js",
            host + "select2.min.css",
            //-------- 加载 contextMenu，用于控件菜单--------------
            host + "contextMenu.min.js",
            host + "contextMenu.min.css",
            //-------- 加载 pinyin，用于拼音过滤 -------------
            host + "pinyin_dict_notone.js",
            host + "pinyinUtil.js",
        ];

        for (const s of loadList) {
            await this._addPageDepends(window.document.head, s);
        }
    }

    async _addPageDepends(w, s){
        if (/\.js(\?.*)*$/g.test(s)){
            await loadScript(w, s, false);
        }else if(/\.css(\?.*)*$/g.test(s)){
            await loadCss(w, s);
        }
    }
}



