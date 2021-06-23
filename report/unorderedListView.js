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
        for (const [k, v] of Object.entries(this.content)){
            let li = document.createElement("li");
            li.innerText = k;
            {
                let li_ui = document.createElement("ul");
                v.forEach(function(x){
                    let li_ui_li = document.createElement("li");
                    li_ui_li.innerHTML = x;
                    li_ui.appendChild(li_ui_li);
                });
                li.appendChild(li_ui)
            }
            ul.appendChild(li)
        }
        $("#"+this.id).append(ul);
    }
}