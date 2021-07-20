/*
工具条控件
*/

export class ToolBarView{
    constructor(reportName, id, config){
        this.reportName = reportName;
        this.id = id;
        this.config = config;
        this.values = {};
    }

    updateView(){
        $('#'+this.id).w2destroy(this.id);
        let items = [];
        for (const [k,v] of Object.entries(this.config)) {
            items.push({type : 'break'});
            this.values[k] = v.defaultValue;
            let control = "";
            if ("type" in v && v.type === "select") {
                control += `
                    <label for="${k}">${v.name}:</label>
                    <select name="${k}-name" id="${k}">
                    `;
                for (const [kp,vp] of Object.entries(v.options)) {
                    control += `
                        <option value="${vp}" ${v.defaultValue[0] === kp ? "selected" : ""}>${kp}</option>
                        `
                }
                control += "</select>";
            } else if("type" in v && v.type === "inputRange"){
                control =  `
                            <div style="padding: 3px 10px;">
                                ${v.name}:<input id="${k}0" value=${this.values[k][0]} size="10" style="padding: 3px; border-radius: 2px; border: 1px solid silver"/>
                                ~ <input id="${k}1" value=${this.values[k][1]} size="10" style="padding: 3px; border-radius: 2px; border: 1px solid silver"/>
                            </div>
                        `
            } else {
                control =  `
                            <div style="padding: 3px 10px;">
                                ${v.name}:<input id="${k}" value=${this.values[k]} size="10" style="padding: 3px; border-radius: 2px; border: 1px solid silver"/>
                            </div>
                        `
            }
            items.push(
                { 
                    type: 'html',
                    html: control,
                }
            );
        }
        items.push({type : 'break'});
        items.push({ type: 'button', text: '应用', onClick : this._onApply.bind(this) });
        items.push({type : 'break'});
        $('#'+this.id).w2toolbar({
            name: this.id,
            items: items,
        });        
    }

    _onApply(){
        let values = {};
        for (const [k,v] of Object.entries(this.config)) {
            if ("type" in v && v.type === "select") {
                values[k] = [$("#"+k+" option:selected").text(), $("#"+k).val()];
            } else if("type" in v && v.type === "inputRange"){
                if ("parseFunc" in v) {
                    values[k] = [v.parseFunc($("#"+k+"0").val()), v.parseFunc($("#"+k+"1").val())];
                }else{
                    values[k] = [$("#"+k+"0").val(), $("#"+k+"1").val()];
                }
            } else{
                if ("parseFunc" in v) {
                    values[k] = v.parseFunc($("#"+k).val());
                }else{
                    values[k] = $("#"+k).val();
                }
            }
        }
        window.dispatchEvent(new CustomEvent("updateContent"+this.reportName, {
            detail: {
                toolbarValues : values,
        }}));
    }
}