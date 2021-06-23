/*
报告的工厂类
*/

import { DeveloperCommitDelayReport }   from "./developerCommitDelayReport.js";
import { DocCommitDelayReport }         from "./docCommitDelayReport.js";

const classes = { DeveloperCommitDelayReport, DocCommitDelayReport };

export function getReport(classname, id, config, model){
    let rp = undefined;
    return new classes[classname](id, config, model);
}
