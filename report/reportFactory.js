/*
报告的工厂类
*/

import { DeveloperCommitDelayReport }   from "./developerCommitDelayReport.js";
import { DocCommitDelayReport }         from "./docCommitDelayReport.js";
import { TestLongTimeReport }         from "./testLongTimeReport.js";

const classes = { DeveloperCommitDelayReport, DocCommitDelayReport, TestLongTimeReport };

export function getReport(classname, id, config, model){
    let rp = undefined;
    return new classes[classname](classname, id, config, model);
}
