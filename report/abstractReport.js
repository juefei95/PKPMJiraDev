


export class AbstractReport{
    constructor(id, config, model){

        this.id = id;
        this.config = config;
        this.model = model;
        this.toolbar = undefined;
        this.content = undefined;
        this.ids = {
            "toolbar" : id + "ToolBar",
            "content" : id + "Content",
        };
        this.ids = {
            "toolbar" : id + "ToolBar",
            "content" : id + "Content",
        };
        window.addEventListener("updateContent", this._updateContent.bind(this));
    }

    updateView(){
        // 清空自己的展示区域
        $("#" + this.id).empty();
        // 建立div为toolbar和content
        $("#" + this.id).append(`<div id="${this.ids.toolbar}"></div>`);
        $("#" + this.id).append(`<div id="${this.ids.content}"></div>`);

        // 根据config决定是否加载toolbar
        if (this.config.toolbar) {
            this.toolbar= new ToolBarView(this.ids.toolbar, this.config.toolbar);
            this.toolbar.updateView();
        }
        window.dispatchEvent(new CustomEvent("updateContent"));
    }

    _updateContent(){
        throw "error : 扩展类没有实现_updateContent函数";
    }

    _getToolBarValues(event){
        
        let toolbarValues = {};
        if (!event || "detail" in event === false || !event.detail) {
            for (const [k,v] of Object.entries(this.config.toolbar)) {
                toolbarValues[k] = v.defaultValue;
            }
        }else if("toolbarValues" in event.detail){
            toolbarValues = event.detail.toolbarValues;
        }else{
            throw "error : 未能从工具栏获得值"
        }

        return toolbarValues;
    }
}
