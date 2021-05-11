var theToolSet = {
    // 统一的Date2String yyyy-mm-dd
    date2String : function(date){
        return date.toISOString().substring(0, 10);
    },
};
var theApp = {

    initFrame : function(){
        w2utils.settings.dateFormat = 'yyyy-mm-dd';
        theApp._initLayout();
    },
    /**
     *
     * Description. 更新各个视图
     *
     * @param {Set} notUpdateView     哪些视图不想更新，可能的值('filter', 'grid', 'chart')
     * @return None
     */
    updateView : function(notUpdateView) {
        theGridView.showGrid(); // 显示表格
        theChartView.showChart();
        if(!notUpdateView || !notUpdateView.has('filter')) theFilterView.showFilter();
        theApp._updateLayoutSize();        // 更新布局尺寸
    },


    /**
     *
     * Description. 更新筛选器
     *
     * @param {Object} u     描述筛选器的变化
     *     u.operation - 'add' 某个筛选器添加了u.value
     *                 - 'replace' 某个筛选器完全替换为u.value
     *     u.type      - 'status' 状态筛选器
     *                 - 'designer' 产品设计人员筛选器
     *
     * @return None
     */
    updateFilter : function (u) {
        if (u.operation == 'add') {
            if(theModel.filter[u.type + 'Selected'].has(u.value) == false && theModel.filter[u.type + 'Set'].has(u.value)){
                m[u.type].selected.add(u.value);
            }
        }else if(u.operation == 'replace'){
            if (theView[theModel.currentMode].filter[u.type].type == "Text"){
                theModel.filter[u.type + 'Selected'] = u.value;
            }else if(theView[theModel.currentMode].filter[u.type].type == "DropDown"){
                theModel.filter[u.type + 'Selected'].clear();
                for (const v of u.value){
                    if (theModel.filter[u.type + 'Set'].has(v)) {
                        theModel.filter[u.type + 'Selected'].add(v);
                    }
                }
            }else if(theView[theModel.currentMode].filter[u.type].type == "DateRange"){
                theModel.filter[u.type + 'Selected'] = u.value;
            }
        }
        var notUpdateView = new Set();
        if (u.fromView) notUpdateView.add(u.fromView);
        theApp.updateView(notUpdateView);
    },


    // 重置筛选器，都置为空
    resetFilter : function (){
        for (const  f of  Object.keys(theView[theModel.currentMode].filter)){
            if (theView[theModel.currentMode].filter[f].type == 'DropDown'){
                theModel.filter[f + 'Selected'].clear();
            }else if(theView[theModel.currentMode].filter[f].type == 'Text'){
                theModel.filter[f + 'Selected'] = '';
            }else if(theView[theModel.currentMode].filter[f].type == 'DateRange'){
                theModel.filter[f + 'Selected'] = [theToolSet.date2String(theModel.initStartDate), theToolSet.date2String(theModel.initEndDate)];
            }
        }
        theApp.updateView();
    },



//--------------------private--------------------------

    _initLayout : function(){
        // 删除默认展示的表格
        $('body').empty();
        // 增加新的div用来展示需求跟踪矩阵
        $('body').append(
            '<div id="' + theView.ids.showMatDivId + '" style="width: 100%; height: 100vh;"></div>'
        );
        var _pstyle = 'border: 1px solid #dfdfdf; padding: 5px;';
        var w2uiLayout = {
            name: theView.ids.frameLayout,
            padding: 4,
            panels: [
                { type: 'top', size: 120, resizable: true, style: _pstyle, content: 'top' },
                { type: 'left', size: 350, resizable: true, style: _pstyle, content: 'left' },
                { type: 'main', resizable: true, style: _pstyle, content: 'main' },
            ],
            onResize: function(event) {
            },
        };
        $('#' + theView.ids.showMatDivId).w2layout(w2uiLayout);
        w2ui[theView.ids.frameLayout].content('main', '<div id="' + theView.ids.gridId + '" style="width: 100%; height: 100%"></div>');

        // 左侧Chart区
        var chartH5 = `
            <style>
                #${theView.ids.chartContainer} {
                    list-style-type:none;
                    justify-content: center;
                    padding: 0px;
                }
                #${theView.ids.chartContainer} li{
                    display: list-item;
                    padding: 5px 5px;
                    margin: 0px;
                }
                #${theView.ids.chartContainer} li p{
                    text-align: center;
                }
                #${theView.ids.chartContainer} li div canvas{
                    margin-right: auto;
                    margin-left: auto;
                    display: block;
                }
            </style>
            <ul id="${theView.ids.chartContainer}">
                <li style="list-style-type:none">
                    <p style="font-size: large;font-weight: bold;">以下图片可以拖拽改变排序</p>
                </li>
        `;
        for (const f of Object.values(theView[theModel.currentMode].filter)){
            if (f.hasChart && f.isShowChart){
                chartH5 +=  `
                    <li style="list-style-type:none">
                        <div class="${theView.ids.chartClass}" id="${f.id}Div" style="width: 100%;">
                            <canvas id="${f.id}Canvas"></canvas>
                        </div>
                    </li>
                `;
            }
        }
        chartH5 += '</ul>';
        w2ui[theView.ids.frameLayout].content('left', chartH5);

        var _pstyle2 = 'border: 0px solid #dfdfdf; padding: 0px;';
        var w2uiLayoutInTop = {
            name: theView.ids.topPanelLayout,
            padding: 0,
            panels: [
                { type: 'left', size: 100, resizable: false, style: _pstyle2, content: 'left' },
                { type: 'main', resizable: true, style: _pstyle2, content: 'main' },
            ],
        };
        $().w2layout(w2uiLayoutInTop);
        w2ui[theView.ids.frameLayout].content('top', w2ui[theView.ids.topPanelLayout]);

        // Top里的Filter
        w2ui[theView.ids.topPanelLayout].content('left', `
            <div style="float:left;margin:4px">
                <button class="w2ui-btn" id="resetFilter">重置筛选 </button>
            </div>
        `);
        var filterH5 = `
			<div id='${theView.ids.filterContainerId}'>
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
        for (const f of Object.values(theView[theModel.currentMode].filter)){
            if (f.type == "DropDown"){
                filterH5 += `
					<div style="display:inline-block;">
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
					<div style="display:inline-block;">
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
					<div style="display:inline-block;">
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
		
        w2ui[theView.ids.topPanelLayout].content('main', filterH5);
        w2ui[theView.ids.topPanelLayout].on('render', function(event) {
            event.onComplete = function(){
                // chart可拖拽
                $( "#" + theView.ids.chartContainer ).sortable();
                $( "#" + theView.ids.chartContainer ).disableSelection();

                // 重置筛选绑定回调函数
                $('#resetFilter').on( "click", theApp.resetFilter );
                
                // 绑定点击菜单
                for (const [k, v] of Object.entries(theView[theModel.currentMode].filter)){
                    if (v.type == "DropDown" && 'labelMenu' in v){
                        let menu = [];
                        for (const lm of v.labelMenu){
                            menu.push({
                                name : lm.btnName,
                                title : lm.btnName + '按钮',
                                fun : function(){
                                    theApp.updateFilter({operation:'replace', type: k, value:lm.selects})
                                }
                            });
                        }
                        $('#' + v.id).contextMenu(menu);
                    }
                }
                
                // 绑定Checkbox的回调
                for (const [k, v] of Object.entries(theView[theModel.currentMode].filter)){
                    if (v.type == "DropDown" && v.hasChart){
                        $("#" + v.id + "Check").on('click', function(){
                            if ($("#" + v.id + "Check").is(':checked')){
                                $(`
                                    <li style="list-style-type:none; opacity: 0.25;">
                                        <div class="${theView.ids.chartClass}" id="${v.id}Div" style="width: 100%;">
                                            <canvas id="${v.id}Canvas"></canvas>
                                        </div>
                                    </li>
                                `).insertAfter($( "#" + theView.ids.chartContainer + "> li:first-child" ));
                                
                                $("#" + v.id + "Div").parent().animate({
                                        opacity: 1,
                                    }, 1000, function() {
                                        // Animation complete.
                                });
                                v.isShowChart = true;
                                theChartView.showChart();       // 更新视图
                            }else{
                                
                                $("#" + v.id + "Div").parent().animate({
                                        opacity: 0,
                                    }, 1000, function() {
                                        // Animation complete.
                                    $("#" + v.id + "Div").parent().remove();
                                });
                                v.isShowChart = false;
                            }
                        });
                    }
                }

                // 更新视图
                theApp.updateView();   
            };
        });
    },
    // 更新布局的尺寸，目前只是更新Top Panel的高度
    _updateLayoutSize : function(){
        let height = $('#'+theView.ids.filterContainerId).height();
        let currentHeight = w2ui[theView.ids.frameLayout].get('top').size;
        if (currentHeight - height < 15 || currentHeight - height > 20){
            w2ui[theView.ids.frameLayout].sizeTo('top', height + 15, true);
        }
    },
};


var theGridView = {

    // 绘制表格，考虑过滤器
    showGrid : function() {
        if (!w2ui[theView.ids.gridName])
            theGridView._initGrid();

        // 执行过滤结果
        w2ui[theView.ids.gridName].searchReset(noRefresh = true);
        var sd = w2ui[theView.ids.gridName].searchData;
        for (const  [k, v] of  Object.entries(theView[theModel.currentMode].filter)){
            if (v.type == 'DropDown'){
                if (theModel.filter[k + 'Selected'].size != 0){
                    sd.push({
                        field:  k, // search field name
                        value: Array.from(theModel.filter[k + 'Selected']), // field value (array of two values for operators: between, in)
                        type: 'list', // type of the field, if not defined search.type for the field will be used
                        operator: 'in' // search operator, can be 'is', 'between', 'begins with', 'contains', 'ends with'
                        // if not defined it will be selected based on the type
                    });
                }
            }else if(v.type == 'Text'){
                if (theModel.filter[k + 'Selected'] != ''){
                    sd.push({
                        field:  k, // search field name
                        value: theModel.filter[k + 'Selected'], // field value (array of two values for operators: between, in)
                        type: 'text', // type of the field, if not defined search.type for the field will be used
                        operator: 'contains' // search operator, can be 'is', 'between', 'begins with', 'contains', 'ends with'
                        // if not defined it will be selected based on the type
                    });
                }
            }else if(v.type == 'DateRange'){
                if (theModel.filter[k + 'Selected'].size != 0){
                    sd.push({
                        field:  k, // search field name
                        value: theModel.filter[k + 'Selected'], // field value (array of two values for operators: between, in)
                        type: 'date', // type of the field, if not defined search.type for the field will be used
                        operator: 'between' // search operator, can be 'is', 'between', 'begins with', 'contains', 'ends with'
                        // if not defined it will be selected based on the type
                    });
                }
            }
        }
        w2ui[theView.ids.gridName].search(sd, 'AND');

    },
    // 获得表格中过滤后的所有条目
    getFilteredIssues : function() {
        let gridName = theView.ids.gridName;
        w2ui[gridName].selectAll();
        var records = []
        for (const sel of w2ui[gridName].getSelection()){
            records.push(w2ui[gridName].get(sel));
        }
        w2ui[theView.ids.gridName].selectNone();
        return records;
    },
//--------------------private--------------------------
    _initGrid : function(){
        var searches = [];
        for (const  [k, v] of  Object.entries(theView[theModel.currentMode].filter)){
            if (v.type == 'DropDown'){
                searches.push({
                    field : k,
                    label :  v.label,
                    operator : 'in',
                    type : 'list',
                    options: {
                        items: Array.from(theModel.filter[k + 'Set'])
                    }
                });
            }else if(v.type == 'Text'){
                searches.push({
                    field : k,
                    label :  v.label,
                    operator : 'contains',
                    type : 'text',
                });
            }else if(v.type == 'DateRange'){
                searches.push({
                    field : k,
                    label :  v.label,
                    type : 'date',
                    operator: 'between',
                });
            }
        }

        var columns = [];
        for (const [k, v] of Object.entries(theView[theModel.currentMode].grid)){
            columns.push({
                field : k,
                caption : v.caption,
                sortable : v.sortable,
                size : v.size,
                render : v.render,
            });
        }
        $('#' + theView.ids.gridId).w2grid({
            name: theView.ids.gridName,
            show: {
                //toolbar: true,
                footer: true
            },
            records: theModel.issues,
            searches: searches,
            columns: columns,
            textSearch:'contains',
            onSearch: function (event) {
            //    event.done(function () {
            //        updateCharts();
            //    });
            },
            onContextMenu: function(event) {
                event.preventDefault();
            },
        });
    },
};


var theChartView = {
    showChart : function() {
        var filteredIssues = theGridView.getFilteredIssues();
        for (const [k, v] of Object.entries(theView[theModel.currentMode].filter)){
            if (v.hasChart && v.isShowChart){
                theChartView._showPieChart(filteredIssues, k, v.id + "Canvas");
            }
        }
    },
//--------------------private--------------------------
    // 绘制状态Chart
    _showPieChart : function(issues, field, canvasId) {
        var labelsData = {};
        for (const issue of issues) {
            if (issue[field] in labelsData) {
                labelsData[issue[field]] += 1;
            } else {
                labelsData[issue[field]] = 1;
            }
        }

        var canvas = $('#' + canvasId);
        if (theChartView[canvasId + "Chart"])
            theChartView[canvasId + "Chart"].destroy();
        theChartView[canvasId + "Chart"] = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: Object.keys(labelsData),
                datasets: [{
                        //label: '状态',
                        data: Object.values(labelsData),
                        backgroundColor: theChartView._poolColors(Object.keys(labelsData).length),
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                onClick: function (c, i) {
                    var e = i[0];
                    //console.log("index", e._index)
                    var x_value = this.data.labels[e._index];
                    var y_value = this.data.datasets[0].data[e._index];
                    //console.log("x value", x_value);
                    //console.log("y value", y_value);
                    theApp.updateFilter({operation:'replace', type: field, value:[x_value]});
                },
                plugins: {
                    datalabels: {
                        align: 'start',
                        anchor: 'end',
                        color: 'black',
                        font: function (context) {
                            return {
                                size: 12,
                                weight: 'bold',
                            };
                        },
                        formatter: function (value, context) {
                            return context.chart.data.labels[context.dataIndex] + context.dataset.data[context.dataIndex];
                        }
                    }
                }
            }
        });
    },

    /**
     *
     * Description. 返回一个随机颜色的字符串
     *
     * @return string
     */
    _dynamicColors : function () {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return "rgba(" + r + "," + g + "," + b + ", 0.5)";
    },

    /**
     *
     * Description. 返回n个随机颜色字符串
     *
     * @param {int} n     数目
     * @return array of string
     */
    _poolColors : function (n) {
        var pool = [];
        for (var i = 0; i < n; i++) {
            pool.push(theChartView._dynamicColors());
        }
        return pool;
    },

};


var theFilterView = {
    // 绘制过滤器，根据model里的过滤器数据
    showFilter : function () {
        for (const [k, v] of Object.entries(theView[theModel.currentMode].filter)){
            if (v.type == 'DropDown'){
                theFilterView._showFilter(theModel.filter[k + 'Set'], theModel.filter[k + 'Selected'], v.id, v.placeholder, k);
            }else if (v.type == 'Text'){
                theFilterView._showFreeTextFilter(theModel.filter[k + 'Selected'], v.id, v.placeholder, k);
            }else if (v.type == 'DateRange'){
                theFilterView._showDateRangeFilter(theModel.filter[k + 'Selected'], v.id, k);
            }
        }
    },

//--------------------private--------------------------


    /**
     *
     * Description. 通用的过滤器展示
     *
     * @param {Set} options     可供展示的选项
     * @param {Set} selected    哪些选项是被选中的
     * @param {string} filterId    控件ID
     * @param {string} placeholder    控件上展示的占位字符串
     * @param {string} filterType    当前筛选器类型
     * @return None
     */
    _showFilter : function (options, selected, filterId, placeholder, filterType){
        var data = [];
        var selectedOption = [];
        for (const[i, v]of Array.from(options).entries()) {
            data.push({
                id: i + 1,
                text: v
            });
            if (selected.has(v)) selectedOption.push(i+1);
        }
        // 数据排序，Empty Field排前面，英文次之，中文最后按拼音顺序
        data = data.sort((x,y)=>{
            if (x.text === "Empty Field") return -1;
            if (y.text === "Empty Field") return 1;
            
            let reg = /[a-zA-Z0-9]/;
            if(reg.test(x.text)|| reg.test(y.text)){
                if(x.text>y.text){
                    return 1;
                }else if(x.text<y.text){
                    return -1;
                }else{
                    return 0;
                }
            }else{
                return x.text.localeCompare(y.text, 'zh-Hans-CN', {sensitivity: 'accent'});
            }
         });
        $('#' + filterId).select2({
            data: data,
            placeholder: placeholder,
            allowClear: true,
            closeOnSelect:false,
            matcher: function(params, data) {
                // If there are no search terms, return all of the data
                if ($.trim(params.term) === '') {
                  return data;
                }
            
                // Do not display the item if there is no 'text' property
                if (typeof data.text === 'undefined') {
                  return null;
                }
            },
        });
        $('#' + filterId).val(selectedOption).trigger('change');

        // 添加消息响应
        $('#' + filterId).on('change.select2', function (e) {
            var optionSelected = theFilterView._getSelectedOptions(e.target);
            var optionTexts = [];
            for (const o of optionSelected){
                optionTexts.push(o.innerText);
            }
            theApp.updateFilter({operation:'replace',type:filterType,value:optionTexts, fromView:'filter'});
        });
    },

    _showFreeTextFilter : function (selected, filterId, placeholder, filterType){
        
        // 根据筛选器的值设置input的值
        //if (selected == ""){
        //    $("#"+filterId).empty().trigger('change');
        //}

        // 初始化select2
        $("#"+filterId).select2({
            data:[selected],
            width:"100%",
            tags: true,
            allowClear: false,
            maximumSelectionLength: 1,
        });
        // 设置CSS
        $('#titleFilter').siblings().find('.select2-search__field').on( "change keyup keydown paste cut", function() {
            $( this ).css('width','100%');
        });
        $('#titleFilter').siblings().find('.select2-selection.select2-selection--multiple').css('display','flex'); 
        $('#titleFilter').siblings().find('.select2-selection.select2-selection--multiple').css('flex-direction','row'); 
        $('#titleFilter').siblings().find('.select2-selection__rendered').css('flex','0'); 
        
        // 添加消息响应
        $("#"+filterId).on('select2:open', function (e) {
            $('.select2-container--open .select2-dropdown--below').css('display','none');
        }).on('change.select2', function (e) {
            var optionTexts = e.target.value;
            theApp.updateFilter({operation:'replace',type:filterType,value:optionTexts, fromView:'filter'});
        });
    },
    // 显示Date Range Filter
    _showDateRangeFilter : function(selected, filterId, filterType){
        
        // 根据当前筛选器的值，决定初始化input的值
        if (selected[0] == theToolSet.date2String(theModel.initStartDate)){
            $("#"+filterId+"1").val('');
        }
        if (selected[1] == theToolSet.date2String(theModel.initEndDate)){
            $("#"+filterId+"2").val('');
        }
        // 设置w2field类型
        $("#"+filterId+"1").w2field('date', { format: 'yyyy-mm-dd', end: $("#"+filterId+"2") });
        $("#"+filterId+"2").w2field('date', { format: 'yyyy-mm-dd', start: $("#"+filterId+"1") });
        // 添加消息响应
        $("#"+filterId+"1").on('change', function (e) {
            let dateFrom = $("#"+filterId+"1").val();
            let dateTo = $("#"+filterId+"2").val();
            dateFrom = dateFrom === "" ? theToolSet.date2String(theModel.initStartDate) : dateFrom;
            dateTo = dateTo === "" ? theToolSet.date2String(theModel.initEndDate) : dateTo;
            theApp.updateFilter({operation:'replace',type:filterType, value:[dateFrom, dateTo], fromView:'filter'});
        });
        $("#"+filterId+"2").on('change', function (e) {
            let dateFrom = $("#"+filterId+"1").val();
            let dateTo = $("#"+filterId+"2").val();
            dateFrom = dateFrom === "" ? theToolSet.date2String(theModel.initStartDate) : dateFrom;
            dateTo = dateTo === "" ? theToolSet.date2String(theModel.initEndDate) : dateTo;
            theApp.updateFilter({operation:'replace',type:filterType, value:[dateFrom, dateTo], fromView:'filter'});
        });
    },
    // 获得Select的所有选择的Option
    _getSelectedOptions : function (sel) {
        var opts = [], opt;
        var len = sel.options.length;
        for (var i = 0; i < len; i++) {
           opt = sel.options[i];

           if (opt.selected) {
               opts.push(opt);
           }
        }

        return opts;
    }
};
