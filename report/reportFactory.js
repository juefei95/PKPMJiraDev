/*
报告的工厂类
*/

import { DeveloperCommitDelayReport }           from "./developerCommitDelayReport.js";
import { DocCommitDelayReport }                 from "./docCommitDelayReport.js";
import { TestLongTimeReport }                   from "./testLongTimeReport.js";
import { RequirementVerifyLongTimeReport }      from "./requirementVerifyLongTimeReport.js";
import { StoryTimelineReport }                  from "./storyTimelineReport.js";

const classes = { DeveloperCommitDelayReport, DocCommitDelayReport, TestLongTimeReport, RequirementVerifyLongTimeReport, StoryTimelineReport };

export function getReport(classname, id, config, model){
    let rp = undefined;
    return new classes[classname](classname, id, config, model);
}
