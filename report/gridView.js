/**
 * gridView是和unorderedListView类似的，用表格方式来展示数据
 */

 export class GridView{
    constructor(id, columns, records){
        this.id = id;
        this.columns = columns;
        this.records = records;
    }

    updateView(){
        w2ui['gridview'] ? w2ui['gridview'].destroy() : 0;
        $('#' + this.id).w2grid({
            name: "gridview",
            show: {
                toolbar: true,
                footer: true
            },
            records: this.records,
            columns: this.columns,
            reorderColumns: true,       // 设置表格的列可以拖动
            textSearch:'contains',
            onContextMenu: function(event) {
                event.preventDefault();
            },
        });
    }
}