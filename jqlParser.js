/*
JQL解析类
*/

export class JQL{
    constructor(jql){
        this.rawJql = jql.toUpperCase();
        this.jql = {};
        this._parse();
    }

    // 获得原始的JQL
    getRawJQL(){
        return this.rawJql;
    }

    // 获取项目名
    getProject(){
        return this.jql["PROJECT"];
    }

    // 获取issue类型
    getIssueType(){
        return this.jql["ISSUETYPE"];
    }

    // 解析JQL
    _parse(){
        // 先找排序字段
        let startIndexOfOrder = this.rawJql.indexOf('ORDER');
        if (startIndexOfOrder !== -1) {
            this.orderPart = ' ' + this.rawJql.slice(startIndexOfOrder);
        }

        // 再分解其他搜索条件
        let indexOfAnd = this.rawJql.indexOf('AND');
        let lastIndex = 0;
        while(indexOfAnd != -1){
            let s = this.rawJql.slice(lastIndex, indexOfAnd);
            const [key, value] = this._parseKeyValue(s);
            this.jql[key] = value;
            lastIndex = indexOfAnd + 3;
            indexOfAnd = this.rawJql.indexOf('AND', lastIndex);
        }

        let s = this.rawJql.slice(lastIndex, startIndexOfOrder);
        const [key, value] = this._parseKeyValue(s);
        this.jql[key] = value;
    }

    // 解析类似于project = JGVIRUS
    _parseKeyValue(s){
        let indexOfEqual = s.indexOf('=');
        if (indexOfEqual === -1) return [undefined, undefined];
        let key = s.slice(0, indexOfEqual).trim();
        let value = s.slice(indexOfEqual+1).trim();
        return [key, value];
    }
}