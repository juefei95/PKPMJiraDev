/*
以无序列表方式展示Report
*/


export class ULView{
    constructor(id, content){
        this.id = id;
        this.content = content;
    }

    updateView(){
        $("#"+this.id).empty();
        let ul = document.createElement("ul");
        var style = document.createElement('style');
        style.innerHTML =`
            .table{ 
            display: table; 
            }
            .tr{ 
            display: table-row; 
            }
            .td{ 
            display: table-cell; }
        `;
        ul.appendChild(style);
        for (const [k, v] of Object.entries(this.content)){
            let li = document.createElement("li");
            li.innerText = `${k} (${v.length})` ;
            {
                let li_ui = document.createElement("ul");
                v.forEach(x =>{
                    let li_ui_li = document.createElement("li");
                    li_ui_li.className = "tr";
                    li_ui_li.innerHTML = this._genHtml(x);
                    li_ui.appendChild(li_ui_li);
                });
                li.appendChild(li_ui)
            }
            ul.appendChild(li)
        }
        $("#"+this.id).append(ul);
    }

    _genHtml(obj){
        let html = '';
        for (const [k,v] of Object.entries(obj)) {
            if ("link" in v) {
                html += `<div class="td"><a href="${v.link}${v.value}"  target="_blank">${v.value}</a></div>`
            }else if ("text" in v) {
                html += `<div class="td"><span style="color:#A9A9A9">  ${v.text} </span> ${v.value} </div>`
            }
        }
        return html;
    }
}