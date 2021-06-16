/*
这是个加强版的筛选器展示框架，所谓“加强版”是相对Jira原始的筛选器而言
*/

import {  loadScript, loadCss } from "./toolSet.js";
import { Config } from "./configManager.js"
import { Model } from "./modelManager.js"
import { CommonFilterView } from './filterView.js'
import { GridView } from './gridView.js'
import { ChartView } from './chartView.js'

export class EnhancedFilterFrame{
    constructor(config, model, isDebug=false){
        this.config = config;
        this.model = model;
        this.isDebug = isDebug;
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

        // 各种Panel
        this.filterPanel    = new FilterPanel   (this.ids.filterPanel, this.config, this.model);
        this.btnPanel       = new BtnPanel      (this.ids.btnPanel, this.config, this.model);
        this.gridPanel      = new GridPanel     (this.ids.gridPanel, this.config, this.model);
        this.chartPanel     = new ChartPanel    (this.ids.chartPanel, this.config, this.model, this.gridPanel.getCurrentGridData.bind(this.gridPanel));

        // 注册消息响应
        window.addEventListener("renderComplete", this._configControls.bind(this));
        window.addEventListener("updateView", this.updateView.bind(this));
        window.addEventListener("updateFieldsVisibility", this.updateFieldsVisibility.bind(this));
    }

    async prepare(){
        // 加载外部依赖的文件
        await this._loadExternalResource();
    }

    // 初始化框架
    show(){

        this._createLayout();
        
        w2ui[this.ids.outmostLayoutName].html('main', this.gridPanel.createHtml());
        w2ui[this.ids.outmostLayoutName].html('left', this.chartPanel.createHtml());
        
        w2ui[this.ids.topLayoutName].html('left', this.btnPanel.createHtml());
        w2ui[this.ids.topLayoutName].html('main', this.filterPanel.createHtml());

        this._configControls();
    }

    // 所有panel都根据model数据更新一遍
    updateView(event){
        this.filterPanel.updateView(event);
        this.chartPanel.updateView(event);
        this.btnPanel.updateView(event);
        this.gridPanel.updateView(event);
    }

    // 所有panel都根据model数据更新一下控件的可见性
    updateFieldsVisibility(event){
        this.filterPanel.updateFieldsVisibility(event);
        this.chartPanel.updateFieldsVisibility(event);
        this.btnPanel.updateFieldsVisibility(event);
        this.gridPanel.updateFieldsVisibility(event);

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
        
        let host = this.isDebug ? "http://127.0.0.1:8887/" : "https://shijianxin.gitlabpages.it.pkpm.cn/pkpmjiradev/";
        let loadList = [
            // ------------------- 依赖jquery和jquery-ui
            host + "jquery-2.2.4.min.js",
            host + "jquery-ui.min.js",
            // ------------------- 依赖w2ui------------------
            host + "w2ui_v1.5_modify.min.js",
            host + "w2ui-1.5.min.css",
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
            //
            host + "JiraBI.js?q=1",
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



class FilterPanel{
    constructor(id, config, model){
        this.panelId = id;
        this.config = config;
        this.model = model;
        this.ids = {
            filterContainerId               : 'filterContainer',                // 上面一排Filter的容器Div的Id
            
        };
        this.filters = [];
    }
    
    getHeight(){
        return $('#'+this.ids.filterContainerId).height();
    }

    // 插入Filter控件到top的main layout
    createHtml(){

        // Top的main里的Filter
        var filterH5 = `
			<div id='${this.ids.filterContainerId}'>
			<style>
				#filterContainer div {
					//height: 30px;
					margin-bottom: 10px;
				}
				#filterContainer label {	/* label的高度保证和#filterContainer div一致，以实现label居中 */ 
					//line-height: 30px;
				}
				#filterContainer input:not([type="checkbox"]) {
					margin: 0px;
					padding: 0px;
					width: 100%;
					outline: none;
					height: 30px;
					border-radius: 5px;
				}
				#filterContainer select {
					margin: 0px;
					padding: 0px;
					width: 100%;
					outline: none;
					//height: 30px;
					border-radius: 5px;
                }
				#filterContainer .select2-search {
					width: auto;    /*让输入框不再另占一行*/
                }
				  
			</style>
		`;
        for (const f of this.config.getFilters()){
            if (f.type == "DropDown"){
                filterH5 += `
					<div id="${f.id}Div" style="display:inline-block;">
						<div style="display:inline;margin:4px;">
                        `;
                if (f.hasChart){
                    if (f.isShowChart){
                        filterH5 += `
                            <input type="checkbox" id="${f.id}Check" checked></input>
                            `;
                    }else{
                        filterH5 += `
                            <input type="checkbox" id="${f.id}Check"></input>
                            `;
                    }
                }
                filterH5 += `
							<label for="${f.id}">${f.label}</label>
						</div>
						<div style="display:inline-block;margin:4px;width:${f.width};">
							<select  id="${f.id}" multiple="multiple"/>
						</div>
                    </div>
                `;
            }else if(f.type == "Text"){
                filterH5 += `
					<div id="${f.id}Div" style="display:inline-block;">
						<div style="display:inline;margin:4px;">
							<label for="${f.id}">${f.label}</label>
						</div>
						<div style="display:inline-block;margin:4px;width:${f.width};">
							<select id="${f.id}"  multiple="multiple"/>
						</div>
                    </div>
                `;
            }else if(f.type == "DateRange"){
                filterH5 += `
					<div id="${f.id}Div" style="display:inline-block;">
						<div style="display:inline;margin:4px;">
							<label for="${f.id}">${f.label}</label>
						</div>
						<div style="display:inline-block;margin:4px;">
                            <input id="${f.id}1" style="width:${f.width};"> - <input id="${f.id}2" style="width:${f.width};">
						</div>
                    </div>
                `;
            }
        }
		filterH5 += '</div>';
		return filterH5;
 
    }
    updateView(event){
        // 如果更新视图是由Filter发起，则Filter自己可以不更新
        if (event && "detail" in event && event.detail.from === "filter") return;
        this.filters.forEach(f => {
            f.updateView();
        });
    }
    updateFieldsVisibility(){
        let fieldVis = this.config.getGridFieldsVisibility();
        for (const [k,v] of Object.entries(this.config.getFiltersDict())){
            if (fieldVis[k].visible) {
                $("#" + v.id + "Div").css("display", "inline-block");
            }else{
                $("#" + v.id + "Div").css("display", "none");
            }
        }
    }
    // config控件
    configControls(){
        
        // 把filter DOM和filter控件接起来
        for (const [k, v] of Object.entries(this.config.getFiltersDict())){
            this.filters.push(CommonFilterView.CreateFilterView(v.type, {model : this.model, key : k, id : v.id, placeholder : v.placeholder ? v.placeholder : ""}));
        }

        // 有配置的Filter绑定点击弹出菜单
        for (const [k, v] of Object.entries(this.config.getFiltersDict())){
            if (v.type == "DropDown" && 'labelMenu' in v){
                let menu = [];
                for (const lm of v.labelMenu){
                    menu.push({
                        name : lm.btnName,
                        title : lm.btnName + '按钮',
                        fun : () => {
                            this.model.setFilterSelectedOptions(k, new Set(lm.selects));
                            window.dispatchEvent(new CustomEvent("updateView", {
                                detail: {
                                    from : 'filter',
                                }})
                            );
                        }
                    });
                }
                $('#' + v.id).contextMenu(menu);
            }
        }

        
        // 绑定Checkbox控制Chart的展示
        for (const [k, v] of Object.entries(this.config.getFiltersDict())){
            if (v.type == "DropDown" && v.hasChart){
                $("#" + v.id + "Check").on('click', ()=>{
                    this.config.setChartVisible(k, $("#" + v.id + "Check").prop("checked"));
                    window.dispatchEvent(new CustomEvent("updateFieldsVisibility"));
                });
            }
        }
    }
}

class BtnPanel {
    
    constructor(id, config, model){
        this.panelId = id;
        this.config = config;
        this.model = model;
        this.ids = {
            resetFilter : 'resetFilter',
            selectField : 'selectField',
        };
    }
    createHtml(){

        let html = `
            <div style="float:left;margin:4px">
                <button class="w2ui-btn" id="${this.ids.resetFilter}">重置筛选 </button>
                <button class="w2ui-btn" id="${this.ids.selectField}">字段选择 </button>
            </div>
        `;
        return html;

    }
    updateView(){}
    
    updateFieldsVisibility(){}
    // config控件
    configControls(){
        
        // 重置筛选绑定回调函数
        $('#' + this.ids.resetFilter).on( "click", this._resetFilter.bind(this) );

        // 字段开关回调函数
        $('#' + this.ids.selectField).on( "click", this._selectField.bind(this) );
    }

    _resetFilter(){}
    
    // 弹出对话框，选择显示字段
    _selectField(){
        let fieldsVis = this.config.getGridFieldsVisibility();

        let newDiv = document.createElement("div");
        let ul = document.createElement("ul");
        ul.id = this.ids.selectField + "_ul";
        ul.style["list-style"] = "none outside none";
        ul.style["margin"] = "50px";
        ul.style["padding"] = "0";
        ul.style["text-align"] = "center";
        for (const [k,v] of Object.entries(fieldsVis)){
            let li = document.createElement("li");
            li.style["margin"] = "0 10px";
            li.style["display"] = "inline-block";
            let input = document.createElement("input");
            input.type = "checkbox";
            li.appendChild(input);
            li.id = k;
            let newContent = document.createTextNode(v["caption"]);
            li.appendChild(newContent);
            ul.appendChild(li);
        }
        newDiv.appendChild(ul);

        let _this = this;
        w2popup.open({
            title: 'Popup Title',
            body: newDiv.outerHTML,
            buttons: `
                <button class="w2ui-btn" onclick="w2popup['save'] = false;w2popup.close();">Close</button>
                <button class="w2ui-btn" onclick="w2popup['save'] = true;w2popup.close();">Save</button>
                `,
            width: 500,
            height: 300,
            overflow: 'hidden',
            color: '#333',
            speed: '0.3',
            opacity: '0.8',
            modal: true,
            showClose: true,
            showMax: false,
            onOpen(event) {
                event.onComplete = () => {
                    for (const [k,v] of Object.entries(fieldsVis)){
                        if (v["visible"]) {
                            $("#" + k + " input").prop("checked", "true");
                        }
                    }
                 }
            },
            onClose(event) {
                if (w2popup['save']) {
                    let fieldsVis = {};
                    $('ul#'+_this.ids.selectField + "_ul").find("input:checkbox").each(function () {
                        fieldsVis[$(this).parent().attr('id')] = {};
                        fieldsVis[$(this).parent().attr('id')]["visible"] = $(this).prop("checked");
                    });
                    setTimeout(()=>{
                        _this.config.setGridFieldsVisibility(fieldsVis);
                        window.dispatchEvent(new CustomEvent("updateFieldsVisibility"));
                    }, 500 );
                }
           },
        });
    }
}

class ChartPanel {
    
    constructor(id, config, model, cbGetIssues){
        this.panelId = id;
        this.config = config;
        this.model = model;
        this.cbGetIssues = cbGetIssues;
        this.ids = {
            chartContainer                  : 'chartContainer',                 // chart外围的容器，目前是ul，为了可以拖拽
            chartClass                      : 'chartClass',                     // chart被统一选择的class
            
        };
        this.charts = {};
    }
    updateView(){
        let issues = this.cbGetIssues();
        for (const [k,v] of Object.entries(this.config.getChartsDict())){
            if (v.visible) {
                $("#" + k +"CanvasDiv").css("display", "inline-block");
                this.charts[k].updateView(issues, k);
            }else{
                $("#" + k +"CanvasDiv").css("display", "none");
            }
        }
    }

    updateFieldsVisibility(){
        this.updateView();
    }
    
    // 插入Chart控件到left layout
    createHtml(){
        // 左侧Chart区
        var chartH5 = `
            <style>
                #${this.ids.chartContainer} {
                    list-style-type:none;
                    justify-content: center;
                    padding: 0px;
                }
                #${this.ids.chartContainer} li{
                    display: list-item;
                    padding: 5px 5px;
                    margin: 0px;
                }
                #${this.ids.chartContainer} li p{
                    text-align: center;
                }
                #${this.ids.chartContainer} li div canvas{
                    margin-right: auto;
                    margin-left: auto;
                    display: block;
                }
            </style>
            <ul id="${this.ids.chartContainer}">
                <li style="list-style-type:none">
                    <p style="font-size: large;font-weight: bold;">以下图片可以拖拽改变排序</p>
                </li>
        `;
        for (const [k,v] of Object.entries(this.config.getChartsDict())){
            chartH5 +=  `
                <li style="list-style-type:none">
                    <div class="${this.ids.chartClass}" id="${k}CanvasDiv" style="width: 100%;">
                        <canvas id="${k}Canvas"></canvas>
                    </div>
                </li>
                </ul>
            `;
        }
        return chartH5;
    }

    // config控件
    configControls(){
        
        // chart可拖拽
        $( "#" + this.ids.chartContainer ).sortable();
        $( "#" + this.ids.chartContainer ).disableSelection();

        // 创建charts
        for (const [k,v] of Object.entries(this.config.getChartsDict())){
            this.charts[k] = new ChartView(this.config, this.model, k + "Canvas");
        }
    }
}

class GridPanel {
    
    constructor(id, config, model){
        this.panelId = id;
        this.config = config;
        this.model = model;
        this.ids = {
            gridId : "gridId",
            gridName : 'jiraGrid',                       // w2ui grid的名字，用来后续引用
        };
        // 把各种控件Dom和实际的控件类关联起来
        this.grid = undefined;
    }
    createHtml(){
        return '<div id="' + this.ids.gridId + '" style="width: 100%; height: 100%"></div>';
    }
    updateView(){
        this.grid.updateView();
    }

    updateFieldsVisibility(){
        this.grid.setColumnVisibility();
    }
    // config控件
    configControls(){
        
        // 把各种控件Dom和实际的控件类关联起来
        this.grid = new GridView(this.config, this.model, this.ids.gridId, this.ids.gridName);
    }

    getCurrentGridData(){
        return this.grid.getFilteredIssues();
    }
}