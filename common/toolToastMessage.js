/**
 * Toast Message是一个个弹出的消息提示，它会自动的几秒后就消失
 */

/**
 * 显示Toast Message
 * @param {string} msg 消息内容
 */

export function showToastMessage(msg, isConsoleLog=true, prefix="toast_", className="snackbar", bgColor="#686968"){

    let styleId = "";
    _insertStyle(styleId, className, bgColor);  // 插入style
    let id = _createToast(msg, prefix, className);
    setTimeout(function(){
        document.getElementById(id).remove();
    },3000);  // 3sec.
    if(isConsoleLog) console.log(msg);
}

// body中插入style
function _insertStyle(styleId, className, bgColor){
    let ss = document.getElementById(styleId);
    if (ss) return;     // 已经存在，就不再添加了

    const styleNode = document.createElement('style'); 
    styleNode.id = styleId;
    styleNode.textContent = `
    .${className} {
        visibility: visible;
        min-width: 250px;
        margin-left: -125px;
        background-color: ${bgColor};
        color: #fff;
        text-align: center;
        border-radius: 2px;
        padding: 16px;
        position: fixed;
        z-index: 9999;
        left: 50%;
        font-size: 17px;
        -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
        animation: fadein 0.5s, fadeout 0.5s 2.5s;
      }
      
      @-webkit-keyframes fadein {
        from {opacity: 0;} 
        to {opacity: 1;}
      }
      
      @keyframes fadein {
        from {opacity: 0;}
        to {opacity: 1;}
      }
      
      @-webkit-keyframes fadeout {
        from {opacity: 1;} 
        to {opacity: 0;}
      }
      
      @keyframes fadeout {
        from {opacity: 1;}
        to {opacity: 0;}
      }
    `;
    document.documentElement.appendChild(styleNode); 
}


function _createToast(msg, prefix, className) { // Toast notification
  
    let margin = 0;
    let countTop = 0;
    for (const ele of document.getElementsByClassName(className)){
        margin = Math.max(margin, parseInt(ele.style.top));
        countTop = Math.max(countTop, parseInt(ele.id.slice(ele.id.indexOf(prefix) + prefix.length)));
    }
    let toastDiv = document.createElement("div");
    toastDiv.id = prefix+countTop;
    toastDiv.className = className;
    toastDiv.innerHTML = msg;
    toastDiv.style.top = margin + 60 + "px";
    document.body.appendChild(toastDiv);
    return toastDiv.id;
}