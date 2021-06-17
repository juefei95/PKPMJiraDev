import { helloReport } from "./report/main.js";
import { helloFilter } from "./filter/main.js";

export function main(){
    if (window.mode === "report") {
        helloReport();
    }else if (window.mode === "filter") {
        helloFilter();
    }else{
        alert("mode参数传递错误");
    }

}