
import { date2String, getDateFormat } from "../model/toolSet.js";
import { GridViewModel }              from './gridVM.js'

export class GridControl{

    constructor(vm, gridId, gridName){
        this.vm = vm;
        this.gridId = gridId;
        this.gridName = gridName;
        w2utils.settings.date_format = getDateFormat();      // 该变量存在的目的就是设置w2ui的date_format
        this._init();
    }

    updateView(){

        // 执行过滤结果
        w2ui[this.gridName].searchReset(true);
        var sd = w2ui[this.gridName].searchData;
        for (const  [k, v] of Object.entries(this.vm.getFilters())){
            let selected = this.vm.getFilterSelectedOptions(k);
            if (v["filter"].type === 'DropDown'){
                if (selected && selected.size != 0){
                    sd.push({
                        field:  k, // search field name
                        value: Array.from(selected), // field value (array of two values for operators: between, in)
                        type: 'list', // type of the field, if not defined search.type for the field will be used
                        operator: 'in' // search operator, can be 'is', 'between', 'begins with', 'contains', 'ends with'
                        // if not defined it will be selected based on the type
                    });
                }
            }else if(v["filter"].type === 'Text'){
                if (selected && selected != ''){
                    sd.push({
                        field:  k, // search field name
                        value: selected, // field value (array of two values for operators: between, in)
                        type: 'text', // type of the field, if not defined search.type for the field will be used
                        operator: 'contains' // search operator, can be 'is', 'between', 'begins with', 'contains', 'ends with'
                        // if not defined it will be selected based on the type
                    });
                }
            }else if(v["filter"].type === 'DateRange'){
                if (selected && selected.length != 0){
                    sd.push({
                        field:  k, // search field name
                        value: selected.map(d => date2String(d)), // field value (array of two values for operators: between, in)
                        type: 'date', // type of the field, if not defined search.type for the field will be used
                        operator: 'between' // search operator, can be 'is', 'between', 'begins with', 'contains', 'ends with'
                        // if not defined it will be selected based on the type
                    });
                }
            }
        }
        w2ui[this.gridName].last.logic = "AND";         //由于我是直接指定searchData，所以logic得自己设置，否则w2ui就用OR，而不是AND
        //w2ui[this.gridName].search(sd, 'AND');        //这里不再用search而用localSearch,search内部有一些自动判断的逻辑生成w2ui的searchData不是我想要的，
        w2ui[this.gridName].localSearch();              //所以我自己指定searchDate，然后用localSearch直接调用
        this.vm.setSelectedRecords(this._getFilteredIssues());             //更新筛选后的列表

    }

    // 设置列的可见性
    setColumnVisibility(){
        let showCol = [];
        let hideCol = [];
        for (const [k,v] of Object.entries(this.vm.getFieldsVisibility())) {
            if (v.visible) {
                showCol.push(k);
            }else{
                hideCol.push(k);
            }
        }
        w2ui[this.gridName].hideColumn(...hideCol);
        w2ui[this.gridName].showColumn(...showCol);
    }

    resetRecords(){
        let records = this.vm.getRecords();
        w2ui[this.gridName].records = records;
        w2ui[this.gridName].refresh();
    }
    
    // 获得表格中过滤后的所有条目
    _getFilteredIssues() {
        w2ui[this.gridName].selectAll();
        let sel = w2ui[this.gridName].getSelection();
        w2ui[this.gridName].selectNone();
        return sel;
    }

    _getColumnSetting(){
        let columnSetting = {};
        let index = 0;
        for (const cc of w2ui[this.gridName].columns) {
            columnSetting[cc.field] = {
                "visible" : !cc.hidden,
                "index" : index,
            };
            index++;
        }
        return columnSetting;
    }

    _init(){

        // 构造列
        let columnVis = this.vm.getFieldsVisibility();
        let columns = [];
        for (const v of this.vm.getGrids()){
            columns.push({
                field : v.field,
                caption : v.caption,
                sortable : v.sortable,
                size : v.size,
                render : v.render,
                hidden : !columnVis[v.field].visible,
            });
        }
        let records = this.vm.getRecords();
        $('#' + this.gridId).w2grid({
            name: this.gridName,
            show: {
                //toolbar: true,
                footer: true
            },
            records: records,
            //searches: searches,
            columns: columns,
            reorderColumns: true,       // 设置表格的列可以拖动
            textSearch:'contains',
            //onSearch: function (event) {
            //    event.done(function () {
            //        updateCharts();
            //    });
            //},
            onContextMenu: function(event) {
                event.preventDefault();
            },
            onColumnDragEnd: (event) => {
                if (event.phase == "after"){
                    let columnSetting = this._getColumnSetting();
                    this.vm.saveColumnSetting(columnSetting);
                }
            },
        });
    }
}
