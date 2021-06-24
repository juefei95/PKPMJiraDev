/*
报告的工厂类
*/

import { DeveloperCommitDelayReport }           from "./developerCommitDelayReport.js";
import { DocCommitDelayReport }                 from "./docCommitDelayReport.js";
import { TestLongTimeReport }                   from "./testLongTimeReport.js";
import { RequirementVerifyLongTimeReport }      from "./requirementVerifyLongTimeReport.js";
import { StoryTimelineReport }                  from "./storyTimelineReport.js";
import { BugResolveDelayReport }                from "./bugResolveDelayReport.js";
import { BugTitleNotFollowRuleReport }          from "./bugTitleNotFollowRuleReport.js";
import { BugResolveStatusReport }               from "./bugResolveStatusReport.js";
import { BugBlockedStatusReport }               from "./bugBlockedStatusReport.js";
import { BugRetestStatusReport }                from "./bugRetestStatusReport.js";
import { BugUnresolvedByCategoryReport }        from "./bugUnresolvedByCategoryReport.js";

const classes = { DeveloperCommitDelayReport, DocCommitDelayReport, TestLongTimeReport, RequirementVerifyLongTimeReport, StoryTimelineReport,
    BugResolveDelayReport, BugTitleNotFollowRuleReport, BugResolveStatusReport, BugBlockedStatusReport, BugRetestStatusReport, BugUnresolvedByCategoryReport};

export function getReport(classname, id, config, model){
    let rp = undefined;
    return new classes[classname](classname, id, config, model);
}
