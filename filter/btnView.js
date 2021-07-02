
import { View } from './../common/view.js'
import { BtnViewModel } from './btnVM.js'

export class BtnPanel extends View{
    
    constructor(id, vm){
        super(vm);
        this.panelId = id;
        this.ids = {
            resetFilter : 'resetFilter',
            selectField : 'selectField',
            openJQL : 'openJQL',
            refresh : 'refresh',
        };
    }
    createHtml(){

        let html = `
            <div style="float:left;margin:4px">
                <button class="w2ui-btn" id="${this.ids.resetFilter}">重置筛选 </button>
                <button class="w2ui-btn" id="${this.ids.selectField}">字段选择 </button>
                <button class="w2ui-btn" id="${this.ids.openJQL}">导出JQL </button>
                <button class="w2ui-btn" id="${this.ids.refresh}">刷新 </button>
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

        // 导出JQL回调函数
        $('#' + this.ids.openJQL).on( "click", this._openJQL.bind(this) );

        // 刷新
        $('#' + this.ids.refresh).on( "click", this._refresh.bind(this) );
    }

    _resetFilter(){
        this.vm.clearFilterSelectedOptions();
    }
    
    // 弹出对话框，选择显示字段
    _selectField(){
        let fieldsVis = this.vm.getFieldsVisibility();

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
            title: '请选择显示的字段',
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
                        _this.vm.setFieldsVisibility(fieldsVis);
                    }, 500 );
                }
           },
        });
    }

    // 导出JQL
    _openJQL(){
        let [ret, newJQL] = this.vm.genJQLWithSelection();
        if (ret) {
            window.open("https://jira.pkpm.cn/issues/?jql=" + encodeURIComponent(newJQL));
        }else{
            alert(newJQL);
        }
    }

    async _refresh(){
        await this.vm.regetAllIssues();
    }
}
