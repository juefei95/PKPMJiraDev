

export class LoggerPanel{
    
    constructor(id, logMsg){
        this.panelId = id;
        this.logMsg = logMsg;

        // 响应消息
        window.addEventListener(this.logMsg, this._showLog.bind(this));
    }

    createHtml(){

        let html = `
            <div id="${this.panelId}" style="margin:4px">
            </div>
        `;
        return html;

    }

    // config控件
    configControls(){
    }

    // 显示日志
    _showLog(e){
        if(e.detail.flush) {
            document.getElementById(this.panelId).innerHTML = '';
            return;
        }

        let divEle = document.createElement('div');
        divEle.style = "background-color:#d3d3dd;    width: fit-content;border: 2px solid #73AD21;border-radius: 11px;    padding: 5px;";
        divEle.appendChild(e.detail.log );
        document.getElementById(this.panelId).appendChild(divEle);

    }
}