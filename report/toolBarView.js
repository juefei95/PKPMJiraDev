/*
工具条控件
*/

export class ToolBarView{
    constructor(id, config){
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
            items.push(
                { 
                    type: 'html',
                    html: `
                            <div style="padding: 3px 10px;">
                                ${v.name}:<input id="${k}" value=${this.values[k]} size="10" style="padding: 3px; border-radius: 2px; border: 1px solid silver"/>
                            </div>
                        `
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
            let vp = v.parseFunc($("#"+k).val());
            values[k] = vp;
        }
        window.dispatchEvent(new CustomEvent("updateContent", {
            detail: {
                toolbarValues : values,
        }}));
    }
}