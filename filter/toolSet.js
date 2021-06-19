
// 加载JS
export async function loadScript(dom, scriptUrl, isModule){
    const script = document.createElement('script');
    script.src = scriptUrl;
    if (isModule) script.type = "module";
    dom.appendChild(script);
    
    return new Promise((res, rej) => {
        script.onload = function() {
            res();
        }
        script.onerror = function () {
            rej();
        }
    });
}

// 加载CSS
export async function loadCss(dom, cssUrl) {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = cssUrl;
    link.media = 'all';
    dom.appendChild(link);
    
    return new Promise((res, rej) => {
        link.onload = function() {
            res();
        }
        link.onerror = function () {
            rej();
        }
    });
}

export function getDateFormat(){
    return "yyyy-mm-dd";
}

// 统一的Date2String yyyy-mm-dd，ISOString的格式的前10位就是yyyy-mm-dd
export function date2String(date){
    return date.toISOString().substring(0, 10);
}