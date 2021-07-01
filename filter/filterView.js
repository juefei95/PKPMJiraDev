
import { View } from "./../common/view.js";
import { CreateFilterControl, AbstractFilterControl } from "./filterControl.js";


export class FilterPanel extends View{
    constructor(id, vm){
        super(vm);
        this.panelId = id;
        this.ids = {
            filterContainerId               : 'filterContainer',                // 上面一排Filter的容器Div的Id
        };
        this.filters = [];

        // 注册VM的数据变动消息
        this.regVMEvent("SelectedOptions", this.updateView.bind(this));
        this.regVMEvent("FieldsVisibility", this.updateFieldsVisibility.bind(this));

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
        for (const [k,v] of Object.entries(this.vm.getFilters())){
            if (v["filter"].type == "DropDown"){
                filterH5 += `
					<div id="${k+"Filter"}Div" style="display:inline-block;">
						<div style="display:inline;margin:4px;">
                        `;
                if (v["chart"]){
                    if (v["chart"].visible){
                        filterH5 += `
                            <input type="checkbox" id="${k+"Filter"}Check" checked></input>
                            `;
                    }else{
                        filterH5 += `
                            <input type="checkbox" id="${k+"Filter"}Check"></input>
                            `;
                    }
                }
                filterH5 += `
							<label for="${k+"Filter"}">${v["filter"].label}</label>
						</div>
						<div style="display:inline-block;margin:4px;width:${v["filter"].width};">
							<select  id="${k+"Filter"}" multiple="multiple"/>
						</div>
                    </div>
                `;
            }else if(v["filter"].type == "Text"){
                filterH5 += `
					<div id="${k+"Filter"}Div" style="display:inline-block;">
						<div style="display:inline;margin:4px;">
							<label for="${k+"Filter"}">${v["filter"].label}</label>
						</div>
						<div style="display:inline-block;margin:4px;width:${v["filter"].width};">
							<select id="${k+"Filter"}"  multiple="multiple"/>
						</div>
                    </div>
                `;
            }else if(v["filter"].type == "DateRange"){
                filterH5 += `
					<div id="${k+"Filter"}Div" style="display:inline-block;">
						<div style="display:inline;margin:4px;">
							<label for="${k+"Filter"}">${v["filter"].label}</label>
						</div>
						<div style="display:inline-block;margin:4px;">
                            <input id="${k+"Filter"}1" style="width:${v["filter"].width};"> - <input id="${k+"Filter"}2" style="width:${v["filter"].width};">
						</div>
                    </div>
                `;
            }
        }
		filterH5 += '</div>';
		return filterH5;
 
    }

    
    updateView(){
        this.filters.forEach(f => {
            f.updateView();
        });
    }

    updateFieldsVisibility(){
        for (const [k,v] of Object.entries(this.vm.getFilterVisibility())){
            if (v.visible) {
                $("#" + k+"Filter" + "Div").css("display", "inline-block");
            }else{
                $("#" + k+"Filter" + "Div").css("display", "none");
            }
        }
    }
    // config控件
    configControls(){
        
        // 把filter DOM和filter控件接起来
        for (const [k, v] of Object.entries(this.vm.getFilters())){
            this.filters.push(CreateFilterControl(v["filter"].type, {vm : this.vm, key : k, id : k+"Filter", placeholder : v["filter"].placeholder ? v["filter"].placeholder : ""}));
        }

        // 有配置的Filter绑定点击弹出菜单
        for (const [k, v] of Object.entries(this.vm.getFilters())){
            if (v["filter"].type == "DropDown" && 'labelMenu' in v["filter"]){
                let menu = [];
                for (const lm of v["filter"].labelMenu){
                    menu.push({
                        name : lm.btnName,
                        title : lm.btnName + '按钮',
                        fun : () => {
                            this.vm.setFilterSelectedOptions(k, new Set(lm.selects));
                        }
                    });
                }
                $('#' + k+"Filter").contextMenu(menu);
            }
        }

        
        // 绑定Checkbox控制Chart的展示
        for (const [k, v] of Object.entries(this.vm.getFilters())){
            if (v["filter"].type == "DropDown" && v["chart"]){
                $("#" + k+"Filter" + "Check").on('click', ()=>{
                    this.vm.setChartVisibility(k, $("#" + k+"Filter" + "Check").prop("checked"));
                });
            }
        }
    }
}