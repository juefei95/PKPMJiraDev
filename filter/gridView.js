

export class GridView{

    constructor(config, model, gridId, gridName){
        this.config = config;
        this.model = model;
        this.gridId = gridId;
        this.gridName = gridName;
        this._init();
    }

    updateView(){

        // 执行过滤结果
        w2ui[this.gridName].searchReset(true);
        var sd = w2ui[this.gridName].searchData;
        for (const  [k, v] of Object.entries(this.config.getFiltersDict())){
            let selected = this.model.getFilterSelectedOptions(k);
            if (v.type === 'DropDown'){
                if (selected && selected.size != 0){
                    sd.push({
                        field:  k, // search field name
                        value: Array.from(selected), // field value (array of two values for operators: between, in)
                        type: 'list', // type of the field, if not defined search.type for the field will be used
                        operator: 'in' // search operator, can be 'is', 'between', 'begins with', 'contains', 'ends with'
                        // if not defined it will be selected based on the type
                    });
                }
            }else if(v.type === 'Text'){
                if (selected && selected != ''){
                    sd.push({
                        field:  k, // search field name
                        value: selected, // field value (array of two values for operators: between, in)
                        type: 'text', // type of the field, if not defined search.type for the field will be used
                        operator: 'contains' // search operator, can be 'is', 'between', 'begins with', 'contains', 'ends with'
                        // if not defined it will be selected based on the type
                    });
                }
            }else if(v.type === 'DateRange'){
                if (selected && selected.length != 0){
                    sd.push({
                        field:  k, // search field name
                        value: selected, // field value (array of two values for operators: between, in)
                        type: 'date', // type of the field, if not defined search.type for the field will be used
                        operator: 'between' // search operator, can be 'is', 'between', 'begins with', 'contains', 'ends with'
                        // if not defined it will be selected based on the type
                    });
                }
            }
        }
        w2ui[this.gridName].search(sd, 'AND');
    }

    // 设置列的可见性
    setColumnVisibility(){
        let showCol = [];
        let hideCol = [];
        for (const [k,v] of Object.entries(this.config.getGridFieldsVisibility())) {
            if (v.visible) {
                showCol.push(k);
            }else{
                hideCol.push(k);
            }
        }
        w2ui[this.gridName].hideColumn(...hideCol);
        w2ui[this.gridName].showColumn(...showCol);
    }

    
    // 获得表格中过滤后的所有条目
    getFilteredIssues() {
        w2ui[this.gridName].selectAll();
        let records = []
        for (const sel of w2ui[this.gridName].getSelection()){
            records.push(w2ui[this.gridName].get(sel));
        }
        w2ui[this.gridName].selectNone();
        return records;
    }

    _init(){
        // 构造搜索条件
        var _this = this;
        var searches = [];
        for (const  [k, v] of Object.entries(this.config.getFiltersDict())){
            if (v.type == 'DropDown'){
                searches.push({
                    field : k,
                    label :  v.label,
                    operator : 'in',
                    type : 'list',
                    options: {
                        items: Array.from(_this.model.getFilterOptions(k))
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

        // 构造列
        let columnVis = this.config.getGridFieldsVisibility();
        var columns = [];
        for (const [k, v] of Object.entries(this.config.getGridsDict())){
            columns.push({
                field : k,
                text : v.caption,
                sortable : v.sortable,
                size : v.size,
                render : v.render,
                hidden : !columnVis[k].visible,
            });
        }
        $('#' + this.gridId).w2grid({
            name: this.gridName,
            show: {
                //toolbar: true,
                footer: true
            },
            records: this.model.getIssues(),
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
    }
}
