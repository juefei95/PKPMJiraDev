
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

// 直接在页面下端输出
export function printInfo(info){
    let date = new Date().toLocaleString()
    let p = document.createElement('p');
    p.innerHTML = date + " " + info + '<br />';
    document.body.appendChild(p);

}


// date1-date2的天数
export function diffDays(date1, date2){
    return Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));

}


// 生成日期数组，左开右闭
export function dateRange(startDate, endDate, steps = 1) {
    const dateArray = [];
    let currentDate = startDate;
    
    while (currentDate < endDate) {
        dateArray.push(date2String(new Date(currentDate)));
        // Use UTC date to prevent problems with time zones and DST
        currentDate.setUTCDate(currentDate.getUTCDate() + steps);
    }
    
    return dateArray;
}