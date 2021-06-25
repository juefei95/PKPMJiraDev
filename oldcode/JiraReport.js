class Issue{
    constructor(i){
        this.issue = i;
    }
    id(){
        return this.issue.recid;
    }
    status(){
        return this.issue.status;
    }
    category(){
        return this.issue.category;
    }
    // 最后一个状态的日期
    lastStatusDate(status){
        for (let index = this.issue.changelog.length  - 1; index >= 0; index--) {
            const items = this.issue.changelog[index].items;
            for (let index2 = 0; index2<items.length; index2++){
                if (items[index2].field === "status" && items[index2].toString === status){
                    let date = this.issue.changelog[index].date;
                    return date;
                }
            }
        }
        return undefined;
    }
    // 第一次出现某个状态的日期
    firstStatusDate(status){
        for (let index = 0; index < this.issue.changelog.length; index++) {
            const items = this.issue.changelog[index].items;
            for (let index2 = 0; index2<items.length; index2++){
                if (items[index2].field === "status" && items[index2].toString === status){
                    let status = items[index2].toString;
                    let date = this.issue.changelog[index].date;
                    return date;
                }
            }
        }
        return undefined;
    }
    // 标题
    title(){
        return this.issue.title;
    }
    // 创建日期
    createDate(){
        return this.issue.create_date;
    }
    // 测试人员
    tester(){
        return this.issue.tester_in_bug;
    }
}

class Story extends Issue{
    constructor(i){
        super(i);
    }
    // 产品设计结束时间
    designEndDate(){
        let toDesign = this.lastStatusDate("待研发");
        let designing = this.lastStatusDate("研发中");
        return toDesign ? toDesign : designing;
    }
    // 研发结束时间
    developEndDate(){
        return this.lastStatusDate('已提测');
    }
    // 测试结束时间
    testEndDate(){
        return this.lastStatusDate('测试完成');
    }
}

class Bug extends Issue{

    static statusNeedWork = ["开放", "重新打开", "已确认"];     // 最近需要关注的Bug的状态
    static statusIgnore = ["已解决", "已关闭", "Blocked"];      // 最近不用关注的bug状态
    constructor(i){
        super(i);
    }
    // Bug经办人
    assignee(){
        return this.issue.assignee_in_bug;
    }
    // Bug的最后一次解决日期和解决人（目前不一定解决了，因为最后一次解决后，也可能重新打开）
    resolveDatePerson(){
        if (!this.isResolved()) return [undefined, undefined];
            
        for (let i = this.issue.changelog.length  - 1; i >= 0; i--) {
            for (let j = 0; j < this.issue.changelog[i].items.length; j++){
                if (this.issue.changelog[i].items[j].field === "status" && ["Resolved","Blocked"].includes(this.issue.changelog[i].items[j].toString)) {
                    let name = this.issue.changelog[i].author;
                    let date = this.issue.changelog[i].date;
                    return [name, date];
                }
            }
        }
        return [undefined, undefined];
    }
    // Bug的最后一次复测失败情况
    lastRetestFailInfo(){
        let mark = false;
        let date = undefined;
        let developer = undefined;
        let tester = undefined;
        for (let i=this.issue.changelog.length - 1; i >= 0; i--){
            for (let j=0; j<this.issue.changelog[i].items.length; j++){
                if (!mark) {
                    if (this.issue.changelog[i].items[j].field === "status" &&
                        this.issue.changelog[i].items[j].fromString === "Resolved" &&
                        this.issue.changelog[i].items[j].toString !== "Closed"
                    ){
                        mark = true;
                        date = this.issue.changelog[i].date;
                        tester = this.issue.changelog[i].author;
                    }
                }else{
                    if (this.issue.changelog[i].items[j].field === "status" &&
                        this.issue.changelog[i].items[j].toString === "Resolved"
                    ){
                        developer = this.issue.changelog[i].author;
                        return [developer, tester, date];
                    }
                }
            }
        }
        return [undefined, undefined, undefined];
    }
    // Bug是否解决
    isResolved(){
        return Bug.statusIgnore.includes(this.issue.status);
    }
    // Bug解决日期
    resolvedDate(){
        return this.issue.resolution_date;
    }
}

class ToolSet{
    // date1-date2的天数
    static diffDays(date1, date2){
        return Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));
    
    }

    static arrayMultisort (arr) {
        // +   original by: Theriault
        // *     example 1: array_multisort([1, 2, 1, 2, 1, 2], [1, 2, 3, 4, 5, 6]);
        // *     returns 1: true
        // *     example 2: characters = {A: 'Edward', B: 'Locke', C: 'Sabin', D: 'Terra', E: 'Edward'};
        // *     example 2: jobs = {A: 'Warrior', B: 'Thief', C: 'Monk', D: 'Mage', E: 'Knight'};
        // *     example 2: array_multisort(characters, 'SORT_DESC', 'SORT_STRING', jobs, 'SORT_ASC', 'SORT_STRING');
        // *     returns 2: true
        // *     results 2: characters == {D: 'Terra', C: 'Sabin', B: 'Locke', E: 'Edward', A: 'Edward'};
        // *     results 2: jobs == {D: 'Mage', C: 'Monk', B: 'Thief', E: 'Knight', A: 'Warrior'};
        // *     example 3: lastnames = [ 'Carter','Adams','Monroe','Tyler','Madison','Kennedy','Adams'];
        // *     example 3: firstnames = ['James', 'John' ,'James', 'John', 'James',  'John',   'John'];
        // *     example 3: president = [ 39,      6,      5,       10,     4,       35,        2    ];
        // *     example 3: array_multisort(firstnames, 'SORT_DESC', 'SORT_STRING', lastnames, 'SORT_ASC', 'SORT_STRING', president, 'SORT_NUMERIC');
        // *     returns 3: true
        // *     results 3: firstnames == ['John', 'John', 'John',   'John', 'James', 'James',  'James'];
        // *     results 3: lastnames ==  ['Adams','Adams','Kennedy','Tyler','Carter','Madison','Monroe'];
        // *     results 3: president ==  [2,      6,      35,       10,     39,       4,       5];
        // Fix: this function must be fixed like asort(), etc., to return a (shallow) copy by default, since IE does not support!
        // VARIABLE DESCRIPTIONS
        //
        // flags: Translation table for sort arguments. Each argument turns on certain bits in the flag byte through addition.
        //        bits:    HGFE DCBA
        //        bit A: Only turned on if SORT_NUMERIC was an argument.
        //        bit B: Only turned on if SORT_STRING was an argument.
        //        bit C: Reserved bit for SORT_ASC; not turned on.
        //        bit D: Only turned on if SORT_DESC was an argument.
        //        bit E: Turned on if either SORT_REGULAR, SORT_NUMERIC, or SORT_STRING was an argument. If already turned on, function would return FALSE like in PHP.
        //        bit F: Turned on if either SORT_ASC or SORT_DESC was an argument. If already turned on, function would return FALSE like in PHP.
        //        bit G and H: (Unused)
        //
        // sortFlag: Holds sort flag byte of every array argument.
        //
        // sortArrs: Holds the values of array arguments.
        //
        // sortKeys: Holds the keys of object arguments.
        //
        // nLastSort: Holds a copy of the current lastSort so that the lastSort is not destroyed
        //
        // nLastSort: Holds a copy of the current lastSort so that the lastSort is not destroyed
        //
        // args: Holds pointer to arguments for reassignment
        //
        // lastSort: Holds the last Javascript sort pattern to duplicate the sort for the last sortComponent.
        //
        // lastSorts: Holds the lastSort for each sortComponent to duplicate the sort of each component on each array.
        //
        // tmpArray: Holds a copy of the last sortComponent's array elements to reiterate over the array
        //
        // elIndex: Holds the index of the last sortComponent's array elements to reiterate over the array
        //
        // sortDuplicator: Function for duplicating previous sort.
        //
        // sortRegularASC: Function for sorting regular, ascending.
        //
        // sortRegularDESC: Function for sorting regular, descending.
        //
        // thingsToSort: Holds a bit that indicates which indexes in the arrays can be sorted. Updated after every array is sorted.
        var argl = arguments.length,
            sal = 0,
            flags = {
                'SORT_REGULAR': 16,
                'SORT_NUMERIC': 17,
                'SORT_STRING': 18,
                'SORT_ASC': 32,
                'SORT_DESC': 40
            },
            sortArrs = [
                []
            ],
            sortFlag = [0],
            sortKeys = [
                []
            ],
            g = 0,
            i = 0,
            j = 0,
            k = '',
            l = 0,
            thingsToSort = [],
            vkey = 0,
            zlast = null,
            args = arguments,
            nLastSort = [],
            lastSort = [],
            lastSorts = [],
            tmpArray = [],
            elIndex = 0,
            sortDuplicator = function (a, b) {
                return nLastSort.shift();
            },
            sortFunctions = [
                [function (a, b) {
                    lastSort.push(a > b ? 1 : (a < b ? -1 : 0));
                    return a > b ? 1 : (a < b ? -1 : 0);
                }, function (a, b) {
                    lastSort.push(b > a ? 1 : (b < a ? -1 : 0));
                    return b > a ? 1 : (b < a ? -1 : 0);
                }],
                [function (a, b) {
                    lastSort.push(a - b);
                    return a - b;
                }, function (a, b) {
                    lastSort.push(b - a);
                    return b - a;
                }],
                [function (a, b) {
                    lastSort.push((a + '') > (b + '') ? 1 : ((a + '') < (b + '') ? -1 : 0));
                    return (a + '') > (b + '') ? 1 : ((a + '') < (b + '') ? -1 : 0);
                }, function (a, b) {
                    lastSort.push((b + '') > (a + '') ? 1 : ((b + '') < (a + '') ? -1 : 0));
                    return (b + '') > (a + '') ? 1 : ((b + '') < (a + '') ? -1 : 0);
                }]
            ];
    
        // Store first argument into sortArrs and sortKeys if an Object.
        // First Argument should be either a Javascript Array or an Object, otherwise function would return FALSE like in PHP
        if (Object.prototype.toString.call(arr) === '[object Array]') {
            sortArrs[0] = arr;
        }
        else if (arr && typeof arr === 'object') {
            for (i in arr) {
                if (arr.hasOwnProperty(i)) {
                    sortKeys[0].push(i);
                    sortArrs[0].push(arr[i]);
                }
            }
        }
        else {
            return false;
        }
    
    
        // arrMainLength: Holds the length of the first array. All other arrays must be of equal length, otherwise function would return FALSE like in PHP
        //
        // sortComponents: Holds 2 indexes per every section of the array that can be sorted. As this is the start, the whole array can be sorted.
        var arrMainLength = sortArrs[0].length,
            sortComponents = [0, arrMainLength];
    
        // Loop through all other arguments, checking lengths and sort flags of arrays and adding them to the above variables.
        for (j = 1; j < argl; j++) {
            if (Object.prototype.toString.call(arguments[j]) === '[object Array]') {
                sortArrs[j] = arguments[j];
                sortFlag[j] = 0;
                if (arguments[j].length !== arrMainLength) {
                    return false;
                }
            } else if (arguments[j] && typeof arguments[j] === 'object') {
                sortKeys[j] = [];
                sortArrs[j] = [];
                sortFlag[j] = 0;
                for (i in arguments[j]) {
                    if (arguments[j].hasOwnProperty(i)) {
                        sortKeys[j].push(i);
                        sortArrs[j].push(arguments[j][i]);
                    }
                }
                if (sortArrs[j].length !== arrMainLength) {
                    return false;
                }
            } else if (typeof arguments[j] === 'string') {
                var lFlag = sortFlag.pop();
                if (typeof flags[arguments[j]] === 'undefined' || ((((flags[arguments[j]]) >>> 4) & (lFlag >>> 4)) > 0)) { // Keep extra parentheses around latter flags check to avoid minimization leading to CDATA closer
                    return false;
                }
                sortFlag.push(lFlag + flags[arguments[j]]);
            } else {
                return false;
            }
        }
    
    
        for (i = 0; i !== arrMainLength; i++) {
            thingsToSort.push(true);
        }
    
        // Sort all the arrays....
        for (i in sortArrs) {
            if (sortArrs.hasOwnProperty(i)) {
                lastSorts = [];
                tmpArray = [];
                elIndex = 0;
                nLastSort = [];
                lastSort = [];
    
                // If ther are no sortComponents, then no more sorting is neeeded. Copy the array back to the argument.
                if (sortComponents.length === 0) {
                    if (Object.prototype.toString.call(arguments[i]) === '[object Array]') {
                        args[i] = sortArrs[i];
                    } else {
                        for (k in arguments[i]) {
                            if (arguments[i].hasOwnProperty(k)) {
                                delete arguments[i][k];
                            }
                        }
                        sal = sortArrs[i].length;
                        for (j = 0, vkey = 0; j < sal; j++) {
                            vkey = sortKeys[i][j];
                            args[i][vkey] = sortArrs[i][j];
                        }
                    }
                    delete sortArrs[i];
                    delete sortKeys[i];
                    continue;
                }
    
                // Sort function for sorting. Either sorts asc or desc, regular/string or numeric.
                var sFunction = sortFunctions[(sortFlag[i] & 3)][((sortFlag[i] & 8) > 0) ? 1 : 0];
    
                // Sort current array.
                for (l = 0; l !== sortComponents.length; l += 2) {
                    tmpArray = sortArrs[i].slice(sortComponents[l], sortComponents[l + 1] + 1);
                    tmpArray.sort(sFunction);
                    lastSorts[l] = [].concat(lastSort); // Is there a better way to copy an array in Javascript?
                    elIndex = sortComponents[l];
                    for (g in tmpArray) {
                        if (tmpArray.hasOwnProperty(g)) {
                            sortArrs[i][elIndex] = tmpArray[g];
                            elIndex++;
                        }
                    }
                }
    
                // Duplicate the sorting of the current array on future arrays.
                sFunction = sortDuplicator;
                for (j in sortArrs) {
                    if (sortArrs.hasOwnProperty(j)) {
                        if (sortArrs[j] === sortArrs[i]) {
                            continue;
                        }
                        for (l = 0; l !== sortComponents.length; l += 2) {
                            tmpArray = sortArrs[j].slice(sortComponents[l], sortComponents[l + 1] + 1);
                            nLastSort = [].concat(lastSorts[l]); // alert(l + ':' + nLastSort);
                            tmpArray.sort(sFunction);
                            elIndex = sortComponents[l];
                            for (g in tmpArray) {
                                if (tmpArray.hasOwnProperty(g)) {
                                    sortArrs[j][elIndex] = tmpArray[g];
                                    elIndex++;
                                }
                            }
                        }
                    }
                }
    
                // Duplicate the sorting of the current array on array keys
                for (j in sortKeys) {
                    if (sortKeys.hasOwnProperty(j)) {
                        for (l = 0; l !== sortComponents.length; l += 2) {
                            tmpArray = sortKeys[j].slice(sortComponents[l], sortComponents[l + 1] + 1);
                            nLastSort = [].concat(lastSorts[l]);
                            tmpArray.sort(sFunction);
                            elIndex = sortComponents[l];
                            for (g in tmpArray) {
                                if (tmpArray.hasOwnProperty(g)) {
                                    sortKeys[j][elIndex] = tmpArray[g];
                                    elIndex++;
                                }
                            }
                        }
                    }
                }
    
                // Generate the next sortComponents
                zlast = null;
                sortComponents = [];
                for (j in sortArrs[i]) {
                    if (sortArrs[i].hasOwnProperty(j)) {
                        if (!thingsToSort[j]) {
                            if ((sortComponents.length & 1)) {
                                sortComponents.push(j - 1);
                            }
                            zlast = null;
                            continue;
                        }
                        if (!(sortComponents.length & 1)) {
                            if (zlast !== null) {
                                if (sortArrs[i][j] === zlast) {
                                    sortComponents.push(j - 1);
                                } else {
                                    thingsToSort[j] = false;
                                }
                            }
                            zlast = sortArrs[i][j];
                        } else {
                            if (sortArrs[i][j] !== zlast) {
                                sortComponents.push(j - 1);
                                zlast = sortArrs[i][j];
                            }
                        }
                    }
                }
    
                if (sortComponents.length & 1) {
                    sortComponents.push(j);
                }
                if (Object.prototype.toString.call(arguments[i]) === '[object Array]') {
                    args[i] = sortArrs[i];
                } 
                else {
                    for (j in arguments[i]) {
                        if (arguments[i].hasOwnProperty(j)) {
                            delete arguments[i][j];
                        }
                    }
                    
                    sal = sortArrs[i].length;
                    for (j = 0, vkey = 0; j < sal; j++) {
                        vkey = sortKeys[i][j];
                        args[i][vkey] = sortArrs[i][j];
                    }
    
                }
                delete sortArrs[i];
                delete sortKeys[i];
            }
        }
        return true;
    }

    // 返回'2020-05-25'这样的字符串
    static date2Str(date){
        return date.toISOString().substring(0, 10);
    }

    // 生成日期数组，左开右闭
    static dateRange(startDate, endDate, steps = 1) {
        const dateArray = [];
        let currentDate = startDate;
      
        while (currentDate < endDate) {
            dateArray.push(ToolSet.date2Str(new Date(currentDate)));
            // Use UTC date to prevent problems with time zones and DST
            currentDate.setUTCDate(currentDate.getUTCDate() + steps);
        }
      
        return dateArray;
    }

    static random_rgb() {
        var o = Math.round, r = Math.random, s = 255;
        return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
    }
}

// 不一致项的基类
class Inconsistency{
    constructor(k){
        this.k = k;
    }
    static check(issue) {
        // do nothing
        return undefined;
    }
    key(){
        return this.k;
    }
    toHtml(){
        return undefined;
    }
}

// 研发逾期
class DeveloperDelay extends Inconsistency {
    constructor(jiraId, title, designer, developer, planDate){
        super(designer);
        this.jiraId = jiraId;
        this.title = title;
        this.developer = developer;
        this.planDate = planDate;
    }
    static check(i){
        if (i.designer !== 'Empty Field' && i.status==="研发中" && i.program_plan_commit_date < new Date().setHours(0,0,0) && i.doc_plan_commit_date.getTime() !== theModel.initStartDate.getTime()) {
            return new DeveloperDelay(i.recid, i.title, i.designer, i.developer, i.program_plan_commit_date);
        }
        return undefined;
    }
    toHtml(){
        
        var html = `
        <b>研发逾期：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> 研发 ${this.developer}，计划提测日期${this.planDate.toISOString().substring(0, 10)}，标题为${this.title}
        `;
        return html;
    }
}

// 产品设计逾期
class DesignerDelay extends Inconsistency {
    constructor(jiraId, title, designer, planDate){
        super(designer);
        this.designer = designer;
        this.jiraId = jiraId;
        this.title = title;
        this.planDate = planDate;
    }
    static check(i){
        if (i.designer !== 'Empty Field' && i.status==="需求待设计" && i.doc_plan_commit_date < new Date().setHours(0,0,0) && i.doc_plan_commit_date.getTime() !== theModel.initStartDate.getTime()) {
            return new DesignerDelay(i.recid, i.title, i.designer, i.doc_plan_commit_date);
        }
        return undefined;
    }
    toHtml(){
        
        var html = `
        <b>产品设计逾期：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> 产品 ${this.designer}，计划日期${this.planDate.toISOString().substring(0, 10)}，标题为${this.title}
        `;
        return html;
    }
}

// 需求验证时间过长
class RequirementVerifyLongTime extends Inconsistency{
    static overdays = 15;      // 超时多少天会计入，可以外部配置
    constructor(jiraId, title, inRequirementVerifyDate, designer){
        super(designer);
        this.jiraId = jiraId;
        this.title = title;
        this.inRequirementVerifyDate = inRequirementVerifyDate;
        this.designer = designer;
    }
    toHtml(){
        
        var html = `
        <b>需求验证时间过长：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> ${this.inRequirementVerifyDate.toISOString().substring(0, 10)}开始需求验证，标题为${this.title}
        `;
        return html;
    }
    static check(i){
        if (i.status==="需求验证" ) {
            const date = new Issue(i).firstStatusDate("需求验证");
            if (ToolSet.diffDays(new Date(), date) > RequirementVerifyLongTime.overdays){
                return new RequirementVerifyLongTime(i.recid, i.title, date, i.designer);
            } 
        }
        return undefined;
    }
}

// 测试时间过长
class TestLongTime extends Inconsistency{
    static overdays = 15;      // 超时多少天会计入，可以外部配置
    constructor(jiraId, title, inTestDate, tester){
        super(tester);
        this.jiraId = jiraId;
        this.title = title;
        this.inTestDate = inTestDate;
        this.tester = tester;
    }
    toHtml(){
        
        var html = `
        <b>测试时间过长：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> ${this.inTestDate.toISOString().substring(0, 10)}开始测试，标题为${this.title}
        `;
        return html;
    }
    static check(i){
        if (i.status==="测试中" ) {
            const date = new Issue(i).lastStatusDate("测试中");
            if (date) {
                if (ToolSet.diffDays(new Date(), date) > TestLongTime.overdays){
                    return new TestLongTime(i.recid, i.title, date, i.tester);
                } 
            }
        }
        return undefined;
    }
}

// Bug长时间没有解决
class BugResolveDelay extends Inconsistency {
    constructor(jiraId, title, assignee, category, createDate, status, tester){
        super(assignee);
        this.assignee = assignee;
        this.jiraId = jiraId;
        this.title = title;
        this.category = category;
        this.createDate = createDate;
        this.status = status;
        this.tester = tester;
    }
    static overdays = 15;      // 超时多少天会计入，可以外部配置
    static check(i){
        let bug = new Bug(i);
        if (i.assignee_in_bug !== 'Empty Field' 
        && !bug.isResolved()    // 仍未解决的Bug
        && ToolSet.diffDays(new Date(), i.create_date) > BugResolveDelay.overdays){ // 超时
            return new BugResolveDelay(i.recid, i.title, i.assignee_in_bug, i.category, i.create_date, i.status, i.tester_in_bug);
        }
        return undefined;
    }
    toHtml(){
        
        var html = `
        <b>Bug解决逾期：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> ${this.tester} 指派给 ${this.assignee}，创建日期${this.createDate.toISOString().substring(0, 10)}，标题为 ${this.title}
        `;
        return html;
    }
}

// 没有按照约定给Bug标题命名的Bug——【功能名】Bug描述
class BugTitleNotFollowRule extends Inconsistency{
    constructor(jiraId, title, tester){
        super(tester);
        this.jiraId = jiraId;
        this.title = title;
        this.tester = tester;
    }
    static check(i){
        if (i.tester_in_bug !== 'Empty Field' 
        && !/^【.+】.+$/.test(i.title)){ // 标题格式测试不通过
            return new BugTitleNotFollowRule(i.recid, i.title, i.tester_in_bug);
        }
        return undefined;
    }
    toHtml(){
        
        var html = `
        <b>Bug标题不符合规范：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a> 标题为 ${this.title}
        `;
        return html;
    }
}

// 没解决的Bug，且最近复测失败
class BugUnresolvedAndRetestFail extends Inconsistency{
    constructor(jiraId, title, developer, retestFailDate, tester){
        super(developer);
        this.jiraId = jiraId;
        this.title = title;
        this.developer = developer;
        this.retestFailDate = retestFailDate;
        this.tester = tester;
    }
    static overdays = 15;   // 超时多少天会计入
    static check(i){
        let bug = new Bug(i);
        const [developer, tester, date] = bug.lastRetestFailInfo();
        if (!bug.isResolved()    // 仍未解决的Bug
        && developer && date && tester && ToolSet.diffDays(new Date(), date) < BugUnresolvedAndRetestFail.overdays){
            return new BugUnresolvedAndRetestFail(bug.id(), bug.title(), developer, date, tester);
        }
    }
    toHtml(){
        
        var html = `
        <b>Bug未解决且最近复测失败：</b><a href="https://jira.pkpm.cn/browse/${this.jiraId}"  target="_blank">${this.jiraId}</a>
        ${this.tester}在${this.retestFailDate.toISOString().substring(0, 10)}复测失败，标题为 ${this.title}
        `;
        return html;
    }
}

var theConfig = {
    IDS : {
        tabs : "tabs",
        toolbar : "toolbar",
        report : "report",
        DeveloperDelay : "DeveloperDelay",
        DesignerDelay : "DesignerDelay",
        BugResolveDelay : "BugResolveDelay",
        BugResolveDelayDays : "BugResolveDelayDays",
        BugTitleNotFollowRule : "BugTitleNotFollowRule",
        TestLongTime : "TestLongTime",
        TestLongTimeDays : "TestLongTimeDays",
        RequirementVerifyLongTime : "RequirementVerifyLongTime",
        RequirementVerifyLongTimeDays : "RequirementVerifyLongTimeDays",
        BugResolveStatus : "BugResolveStatus",
        BugBlockedStatus : "BugBlockedStatus",
        BugUnresolvedAndRetestFail : "BugUnresolvedAndRetestFail",
        BugUnresolvedAndRetestFailDays : "BugUnresolvedAndRetestFailDays",
        BugUnresolvedByCategory : "BugUnresolvedByCategory",
        BugRetestStatus : "BugRetestStatus",
        StoryTimeline : "StoryTimeline",
    },
}

var theApp = {
    initFrame : function(){
        theApp._initLayout();
    },
    // private
    _initLayout : function(){
        // 清空Body
        document.body.innerHTML = '';   
        // 创建容器div
        let tabs = document.createElement('div');
        tabs.id = theConfig.IDS.tabs;
        tabs.style.width = "100%";
        document.body.appendChild(tabs);
        let toolbar = document.createElement('div');
        toolbar.id = theConfig.IDS.toolbar;
        document.body.appendChild(toolbar);
        let report = document.createElement('div');
        report.id = theConfig.IDS.report;
        document.body.appendChild(report);

        // 设置tabs
        if (theModel.currentMode == "RequirementReport") {
            $('#'+theConfig.IDS.tabs).w2tabs({
                name: 'tabs',
                active: theConfig.IDS.DeveloperDelay,
                tabs: [
                    { id: theConfig.IDS.DeveloperDelay, text: '研发提测逾期' },
                    { id: theConfig.IDS.DesignerDelay, text: '产品设计逾期' },
                    { id: theConfig.IDS.TestLongTime, text: '测试时间过长' },
                    { id: theConfig.IDS.RequirementVerifyLongTime, text: '需求验证时间过长' },
                    { id: theConfig.IDS.StoryTimeline, text: '项目需求进展' },
                ],
                onClick: function (event) {
                    $('#'+theConfig.IDS.toolbar).w2destroy(theConfig.IDS.toolbar);
                    theApp["_Show" + event.target + "ToolBar"]();
                },
            });
    
            // 设置初始的toolbar
            theApp._ShowDeveloperDelayToolBar();
            
        }
        else if (theModel.currentMode == "BugReport") {
            $('#'+theConfig.IDS.tabs).w2tabs({
                name: 'tabs',
                active: theConfig.IDS.BugResolveDelay,
                tabs: [
                    { id: theConfig.IDS.BugResolveDelay, text: 'Bug解决逾期' },
                    { id: theConfig.IDS.BugTitleNotFollowRule, text: 'Bug标题不符规定' },
                    { id: theConfig.IDS.BugResolveStatus, text: 'Bug积压和解决情况' },
                    { id: theConfig.IDS.BugBlockedStatus, text: 'Bug各模块Blocked情况' },
                    { id: theConfig.IDS.BugUnresolvedAndRetestFail, text: '未解决且复测失败的Bug' },
                    { id: theConfig.IDS.BugUnresolvedByCategory, text: '各模块未解决Bug情况' },
                    { id: theConfig.IDS.BugRetestStatus, text: '需要复测的Bug' },
                ],
                onClick: function (event) {
                    $('#'+theConfig.IDS.toolbar).w2destroy(theConfig.IDS.toolbar);
                    theApp["_Show" + event.target + "ToolBar"]();
                }
            });
    
            // 设置初始的toolbar
            theApp._ShowBugResolveDelayToolBar();
            
        }
    },
    
    //#region 产品迭代报告 
    // 显示研发逾期的工具条
    _ShowDeveloperDelayToolBar : function(){
        theApp._ShowDeveloperDelayReport();
    },
    // 显示研发逾期的报告
    _ShowDeveloperDelayReport : function(){
        let show = new ULViewQAInconsistency();
        show.show(DeveloperDelay.check, theConfig.IDS.report);
    },
    // 产品设计逾期
    _ShowDesignerDelayToolBar : function(){
        theApp._ShowDesignerDelayReport();
    },
    _ShowDesignerDelayReport : function(){
        new ULViewQAInconsistency().show(DesignerDelay.check, theConfig.IDS.report);
    },
    // 需求验证太长时间
    _ShowRequirementVerifyLongTimeToolBar : function(){
        $('#'+theConfig.IDS.toolbar).w2toolbar({
            name: theConfig.IDS.toolbar,
            items: [
                { type: 'break' },
                { type: 'html',
                    html: function (item) {
                        var html =`
                            <div style="padding: 3px 10px;">
                            逾期天数:<input id="${theConfig.IDS.RequirementVerifyLongTimeDays}" value=${RequirementVerifyLongTime.overdays} size="10" style="padding: 3px; border-radius: 2px; border: 1px solid silver"/>
                            </div>
                        `;
                        return html;
                    }
                },
                { type: 'break' },
                { type: 'button', text: '应用', onClick : theApp._ShowRequirementVerifyLongTimeReport },
                { type: 'break' },
            ],
            onRender: function(event) {
                event.onComplete = theApp._ShowRequirementVerifyLongTimeReport();
                
            },
        });        
    },
    _ShowRequirementVerifyLongTimeReport : function(){
        let days = parseInt($("#"+theConfig.IDS.RequirementVerifyLongTimeDays).val());
        if ($.isNumeric(days)) RequirementVerifyLongTime.overdays = days;
        new ULViewQAInconsistency().show(RequirementVerifyLongTime.check, theConfig.IDS.report);
    },
    // 测试中太长时间
    _ShowTestLongTimeToolBar : function(){
        $('#'+theConfig.IDS.toolbar).w2toolbar({
            name: theConfig.IDS.toolbar,
            items: [
                { type: 'break' },
                { type: 'html',
                    html: function (item) {
                        var html =`
                            <div style="padding: 3px 10px;">
                            逾期天数:<input id="${theConfig.IDS.TestLongTimeDays}" value=${TestLongTime.overdays} size="10" style="padding: 3px; border-radius: 2px; border: 1px solid silver"/>
                            </div>
                        `;
                        return html;
                    }
                },
                { type: 'break' },
                { type: 'button', text: '应用', onClick : theApp._ShowTestLongTimeReport },
                { type: 'break' },
            ],
            onRender: function(event) {
                event.onComplete = theApp._ShowTestLongTimeReport();
                
            },
        });        
    },
    _ShowTestLongTimeReport : function(){
        let days = parseInt($("#"+theConfig.IDS.TestLongTimeDays).val());
        if ($.isNumeric(days)) TestLongTime.overdays = days;
        new ULViewQAInconsistency().show(TestLongTime.check, theConfig.IDS.report);
    },
    // 项目需求进展
    _ShowStoryTimelineToolBar : function(){
        theApp._ShowStoryTimelineReport();
    },
    _ShowStoryTimelineReport : function(){
        let storyTimeline = [];
        let minCreateDate = new Date();
        theModel.issues.forEach(i => {
            let story = new Story(i);
            try {
                const createDate = story.createDate();
                if (createDate && minCreateDate > createDate) minCreateDate = createDate;   // 记录下最早的一个创建时间
                const designEndDate = story.designEndDate();
                const developEndDate = story.developEndDate();
                const testEndDate = story.testEndDate();
                storyTimeline.push({
                    createDate : createDate,
                    designEndDate : designEndDate,
                    developEndDate : developEndDate,
                    testEndDate : testEndDate,
                });
            } catch (error) {
                let s = "Story" + story.id() + "获取项目需求进展出错。";
                console.error(s);
            }
        });
        // 判断需要多少数组长度
        let len = ToolSet.diffDays(new Date(), minCreateDate);
        let totalLine = Array(len).fill(0);
        let designLine = Array(len).fill(0);
        let developLine = Array(len).fill(0);
        let testLine = Array(len).fill(0);
        storyTimeline.forEach(o => {
            let i1 = ToolSet.diffDays(o.createDate, minCreateDate)-1;
            totalLine.forEach((v,i,a) => {
                if (i>=i1) a[i] += 1;
            });
            if (o.designEndDate) {
                i1 = ToolSet.diffDays(o.designEndDate, minCreateDate)-1;
                designLine.forEach((v,i,a) => {
                    if (i>=i1) a[i] += 1;
                });
            }
            if (o.developEndDate) {
                i1 = ToolSet.diffDays(o.developEndDate, minCreateDate)-1;
                developLine.forEach((v,i,a) => {
                    if (i>=i1) a[i] += 1;
                });
            }
            if (o.testEndDate) {
                i1 = ToolSet.diffDays(o.testEndDate, minCreateDate)-1;
                testLine.forEach((v,i,a) => {
                    if (i>=i1) a[i] += 1;
                });
            }
        });
        // 绘制线
        $("#"+theConfig.IDS.report).empty();
        let canvas = document.createElement("canvas");
        $("#"+theConfig.IDS.report).append(canvas);
        new Chart(canvas, {
            type: 'line',
            data: {
                labels : ToolSet.dateRange(minCreateDate, new Date()),
                datasets: [{
                    label : '全部需求',
                    data : totalLine,
                    fill : false,
                    borderColor : 'blue',
                },{
                    label : '产品进展',
                    data : designLine,
                    fill : false,
                    borderColor : 'yellow',
                },{
                    label : '研发进展',
                    data : developLine,
                    fill : false,
                    borderColor : 'red',
                },{
                    label : '测试进展',
                    data : testLine,
                    fill : false,
                    borderColor : 'green',
                }],
              },
            options: {
                responsive: true, 
                scales: {
                    yAxes: [{
                        ticks: {
                            precision: 0
                        }
                    }]
                },
            }
        });

    },
    //#endregion 产品迭代报告 

    
    //#region 测试迭代报告
    // Bug解决逾期
    _ShowBugResolveDelayToolBar : function(){
        $('#'+theConfig.IDS.toolbar).w2toolbar({
            name: theConfig.IDS.toolbar,
            items: [
                { type: 'break' },
                { type: 'html',
                    html: function (item) {
                        var html =`
                            <div style="padding: 3px 10px;">
                            逾期天数:<input id="${theConfig.IDS.BugResolveDelayDays}" value=${BugResolveDelay.overdays} size="10" style="padding: 3px; border-radius: 2px; border: 1px solid silver"/>
                            </div>
                        `;
                        return html;
                    }
                },
                { type: 'break' },
                { type: 'button', text: '应用', onClick : theApp._ShowBugResolveDelayReport },
                { type: 'break' },
            ],
            onRender: function(event) {
                event.onComplete = theApp._ShowBugResolveDelayReport();
                
            },
        });        
    },
    _ShowBugResolveDelayReport : function(){
        let days = parseInt($("#"+theConfig.IDS.BugResolveDelayDays).val());
        if ($.isNumeric(days)) BugResolveDelay.overdays = days;
        new ULViewQAInconsistency().show(BugResolveDelay.check, theConfig.IDS.report);
    },
    // Bug标题不符合规范
    _ShowBugTitleNotFollowRuleToolBar : function(){
        theApp._ShowBugTitleNotFollowRuleReport();
    },
    _ShowBugTitleNotFollowRuleReport : function(){
        new ULViewQAInconsistency().show(BugTitleNotFollowRule.check, theConfig.IDS.report);
    },
    // Bug积压和解决情况
    _ShowBugResolveStatusToolBar : function(){
        theApp._ShowBugResolveStatusReport();
    },
    _ShowBugResolveStatusReport : function(){
        let bugResolvedStatus = {};
        theModel.issues.forEach(i => {
            let bug = new Bug(i);
            try {
                const [name, date] = bug.resolveDatePerson();
                if (name && date) {
                    // 只统计最近解决的Bug
                    if (ToolSet.diffDays(new Date(), date) < 15){
                        if (name in bugResolvedStatus) {
                            bugResolvedStatus[name][0].push(bug.id());
                        }else{
                            bugResolvedStatus[name] = [[bug.id()], []];
                        }
                    }
                }else{
                    const assignee = bug.assignee();
                    if (assignee in bugResolvedStatus) {
                        bugResolvedStatus[assignee][1].push(bug.id());
                    }else{
                        bugResolvedStatus[assignee] = [[], [bug.id()]];
                    }
                }
            } catch (error) {
                let s = "Bug" + bug.id() + "获取解决情况出错。";
                console.error(s);
            }
        });
        const label = Object.keys(bugResolvedStatus);
        let bugUnResolved = [];
        let bugUnResolvedId = [];
        let bugResolved = [];
        let bugResolvedId = [];
        label.forEach(name =>{
            bugResolved.push(bugResolvedStatus[name][0].length);
            bugResolvedId.push(bugResolvedStatus[name][0]);
            bugUnResolved.push(bugResolvedStatus[name][1].length);
            bugUnResolvedId.push(bugResolvedStatus[name][1]);
        });
        ToolSet.arrayMultisort(bugUnResolved, 'SORT_DESC', bugUnResolvedId, bugResolved, bugResolvedId, label);

        $("#"+theConfig.IDS.report).empty();
        let canvas = document.createElement("canvas");
        $("#"+theConfig.IDS.report).append(canvas);
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: label,
                datasets: [{
                        label: 'Bug积压情况',
                        backgroundColor: "blue",
                        data: bugUnResolved,
                        issueId: bugUnResolvedId,
                    },{
                        label: '过去15天Bug解决情况',
                        backgroundColor: "green",
                        data: bugResolved,
                        issueId: bugResolvedId,
                    },
                ],
            },
            options: {
                responsive: true,
                //maintainAspectRatio: true,
                //showTooltips: true,
                //tooltips: {
                //    enabled: true,
                //    mode: 'nearest',
                //    callbacks: {
                //        //title: function(tooltipItems, data) { 
                //        //    return "helo";
                //        //},
                //        label: function(tooltipItem, data) {
                //            return '<a href="www.baidu.com">hel</a>';
                //        },
                //    }
                //}, 
                scales: {
                    yAxes: [{
                        ticks: {
                            precision: 0
                        }
                    }]
                },
                onClick: function (e, data) {
                    let bar = this.getElementAtEvent(e)[0];
                    if (bar) {
                        let index = bar._index;
                        let datasetIndex = bar._datasetIndex;
                        let issueIds = bar._chart.data.datasets[datasetIndex].issueId[index];
                        let url = encodeURI("https://jira.pkpm.cn/issues/?jql=key in ("+issueIds.join(",")+") ORDER BY createdDate ASC");
                        window.open(url, '_blank').focus();
                    }
                }
            }
        });
    },
    // Bug各模块Blocked的情况
    _ShowBugBlockedStatusToolBar : function(){
        theApp._ShowBugBlockedStatusReport();
    },
    _ShowBugBlockedStatusReport : function(){
        let bugBlockedStatus = {};
        theModel.issues.forEach(i => {
            let bug = new Bug(i);
            try {
                if (bug.status() === "Blocked") {
                    let category = bug.category();
                    if (category in bugBlockedStatus) {
                        bugBlockedStatus[category].push(bug.id());
                    }else{
                        bugBlockedStatus[category] = [bug.id()];
                    }
                }
            } catch (error) {
                let s = "Bug" + bug.id() + "获取Blocked情况出错。";
                console.error(s);
            }
        });

        const label = Object.keys(bugBlockedStatus);
        let bugBlocked = [];
        let bugBlockedId = [];
        label.forEach(name =>{
            bugBlocked.push(bugBlockedStatus[name].length);
            bugBlockedId.push(bugBlockedStatus[name]);
        });
        
        $("#"+theConfig.IDS.report).empty();
        let canvas = document.createElement("canvas");
        $("#"+theConfig.IDS.report).append(canvas);
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: label,
                datasets: [{
                        label: 'Bug各模块Blocked情况',
                        backgroundColor: "blue",
                        data: bugBlocked,
                        issueId: bugBlockedId,
                    },
                ],
            },
            options: {
                responsive: true,
                //maintainAspectRatio: true,
                //showTooltips: true,
                //tooltips: {
                //    enabled: true,
                //    mode: 'nearest',
                //    callbacks: {
                //        //title: function(tooltipItems, data) { 
                //        //    return "helo";
                //        //},
                //        label: function(tooltipItem, data) {
                //            return '<a href="www.baidu.com">hel</a>';
                //        },
                //    }
                //},  
                scales: {
                    yAxes: [{
                        ticks: {
                            precision: 0
                        }
                    }]
                },
                onClick: function (e, data) {
                    let bar = this.getElementAtEvent(e)[0];
                    if (bar) {
                        let index = bar._index;
                        let datasetIndex = bar._datasetIndex;
                        let issueIds = bar._chart.data.datasets[datasetIndex].issueId[index];
                        let url = encodeURI("https://jira.pkpm.cn/issues/?jql=key in ("+issueIds.join(",")+") ORDER BY createdDate ASC");
                        window.open(url, '_blank').focus();
                    }
                }
            }
        });
    },
    // Bug未解决且复测失败
    _ShowBugUnresolvedAndRetestFailToolBar : function(){
        
        $('#'+theConfig.IDS.toolbar).w2toolbar({
            name: theConfig.IDS.toolbar,
            items: [
                { type: 'break' },
                { type: 'html',
                    html: function (item) {
                        var html =`
                            <div style="padding: 3px 10px;">
                            上次复测不通过距离今天天数:<input id="${theConfig.IDS.BugUnresolvedAndRetestFailDays}" value=${BugUnresolvedAndRetestFail.overdays} size="10" style="padding: 3px; border-radius: 2px; border: 1px solid silver"/>
                            </div>
                        `;
                        return html;
                    }
                },
                { type: 'break' },
                { type: 'button', text: '应用', onClick : theApp._ShowBugUnresolvedAndRetestFailReport },
                { type: 'break' },
            ],
            onRender: function(event) {
                event.onComplete = theApp._ShowBugUnresolvedAndRetestFailReport();
                
            },
        });       
    },
    _ShowBugUnresolvedAndRetestFailReport : function(){
        let days = parseInt($("#"+theConfig.IDS.BugUnresolvedAndRetestFailDays).val());
        if ($.isNumeric(days)) BugUnresolvedAndRetestFail.overdays = days;
        new ULViewQAInconsistency().show(BugUnresolvedAndRetestFail.check, theConfig.IDS.report);
    },
    // 各模块未解决Bug情况
    _ShowBugUnresolvedByCategoryToolBar : function(){
        theApp._ShowBugUnresolvedByCategoryReport();
    },
    _ShowBugUnresolvedByCategoryReport : function(){
        let overdays = 15;
        let startDate = new Date(new Date().setUTCHours(0,0,1) - 86400000 * (overdays-1))
        let endDate = new Date().setUTCHours(23,59,59);
        let bugUnresolved = {};

        theModel.issues.forEach(i => {
            let bug = new Bug(i);
            try {
                const category = bug.category();
                const createDate = bug.createDate();
                let index1 = Math.max(0, ToolSet.diffDays(createDate, startDate)-1);
                const [name, resolvedDate] = bug.resolveDatePerson();
                let index2 = resolvedDate ? Math.max(0, ToolSet.diffDays(resolvedDate, startDate)-1): overdays ;
                if (!(category in bugUnresolved)) {
                    bugUnresolved[category] = Array(overdays).fill(0);
                }
                bugUnresolved[category].forEach((x,i,a) => {
                    if(i>=index1 && i<index2) a[i]+=1;
                });
            } catch (error) {
                let s = "Bug" + bug.id() + "获取各模块未解决Bug情况出错。";
                console.error(s);
            }
        });
        let dataSets = [];
        for (const [k, v] of Object.entries(bugUnresolved)){
            dataSets.push({
                label : k,
                data : v,
                fill : false,
                borderColor : ToolSet.random_rgb(),
            });
        }

        $("#"+theConfig.IDS.report).empty();
        let canvas = document.createElement("canvas");
        $("#"+theConfig.IDS.report).append(canvas);
        new Chart(canvas, {
            type: 'line',
            data: {
                labels : ToolSet.dateRange(startDate, endDate),
                datasets: dataSets,
              },
            options: {
                responsive: true, 
                scales: {
                    yAxes: [{
                        ticks: {
                            precision: 0
                        }
                    }]
                },
                onClick: function (e, data) {
                    let line = this.getElementAtEvent(e)[0];
                    if (line) {
                        let component = line._chart.data.datasets[line._datasetIndex].label;
                        let url = "https://jira.pkpm.cn/issues/?jql=" + theModel.jql + " AND status in (Open, Reopened, 已确认) AND component = " + component;
                        window.open(encodeURI(url), '_blank').focus();
                    }
                }
            }
        });
    },
    // 需要复测的Bug情况
    _ShowBugRetestStatusToolBar : function(){
        theApp._ShowBugRetestStatusReport();
    },
    _ShowBugRetestStatusReport : function(){
        
        let bugNeedRetest = {};
        theModel.issues.forEach(i => {
            let bug = new Bug(i);
            try {
                if (bug.status() === "已解决") {
                    let tester = bug.tester();
                    if (tester in bugNeedRetest) {
                        bugNeedRetest[tester].push(bug.id());
                    }else{
                        bugNeedRetest[tester] = [bug.id()];
                    }
                }
            } catch (error) {
                let s = "Bug" + bug.id() + "获取需要复测的Bug情况出错。";
                console.error(s);
            }
        });

        const label = Object.keys(bugNeedRetest);
        let bugNeedRetestNum = [];
        let bugNeedRetestId = [];
        label.forEach(name =>{
            bugNeedRetestNum.push(bugNeedRetest[name].length);
            bugNeedRetestId.push(bugNeedRetest[name]);
        });
        ToolSet.arrayMultisort(bugNeedRetestNum, 'SORT_DESC', bugNeedRetestId, label);
        
        $("#"+theConfig.IDS.report).empty();
        let canvas = document.createElement("canvas");
        $("#"+theConfig.IDS.report).append(canvas);
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: label,
                datasets: [{
                        label: '需要复测的Bug情况',
                        backgroundColor: "blue",
                        data: bugNeedRetestNum,
                        issueId: bugNeedRetestId,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    yAxes: [{
                        ticks: {
                            precision: 0
                        }
                    }]
                },
                onClick: function (e, data) {
                    let bar = this.getElementAtEvent(e)[0];
                    if (bar) {
                        let index = bar._index;
                        let datasetIndex = bar._datasetIndex;
                        let issueIds = bar._chart.data.datasets[datasetIndex].issueId[index];
                        let url = encodeURI("https://jira.pkpm.cn/issues/?jql=key in ("+issueIds.join(",")+") ORDER BY createdDate ASC");
                        window.open(url, '_blank').focus();
                    }
                }
            }
        });
    },
    //#endregion 测试迭代报告
};

// 列表展示QA不一致项
class ULViewQAInconsistency{
    show(checkFunc, reportId){
        let qaInconsistency = {};
        theModel.issues.forEach(i => {
            let ret = checkFunc(i);
            if (ret){
                if(ret.key() in qaInconsistency){
                    qaInconsistency[ret.key()].push(ret);
                }else{
                    qaInconsistency[ret.key()] = [ret];
                }
            }
        });
        let ul = document.createElement("ul");
        for (const [k, v] of Object.entries(qaInconsistency)){
            let li = document.createElement("li");
            li.innerText = k;
            {
                let li_ui = document.createElement("ul");
                v.forEach(function(x){
                    let li_ui_li = document.createElement("li");
                    li_ui_li.innerHTML = x.toHtml();
                    li_ui.appendChild(li_ui_li);
                });
                li.appendChild(li_ui)
            }
            ul.appendChild(li)
        }
        $("#"+reportId).empty();
        $("#"+reportId).append(ul);
    }
}