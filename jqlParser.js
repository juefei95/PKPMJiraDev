/*
JQL解析类
*/

export class JQL{
    constructor(jql){
        this.rawJql = jql.toUpperCase();
        this.jql = {};
        this.orderPart = "";
        this.jqlWithoutOrderPart = "";
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

    // 生成新的JQL
    genNewJQL(newCondition){
        let s = this.jqlWithoutOrderPart;
        for (const [k,v] of Object.entries(newCondition)) {
            // DropDown的选中项
            if (v instanceof Set){
                s += " AND " + k + " in (" + Array.from(v).map(x => '"'+x+'"').join(',') + ")";
            // Text的选中项
            }else if( typeof v === 'string'){
                s += " AND " + k + " ~ '" + v + "'";
            // DateRange的选中项    
            }else if(v instanceof Array){
                let d1 = `${v[0].getFullYear()}-${v[0].getMonth() + 1}-${v[0].getDate()}`
                let d2 = `${v[1].getFullYear()}-${v[1].getMonth() + 1}-${v[1].getDate()}`
                s += " AND " + k + " >= " + d1 + " AND " + k + " <= " + d2;
            }
        }
        return s;
    }

    // 解析JQL
    _parse(){
        // 先找排序字段
        let startIndexOfOrder = this.rawJql.indexOf('ORDER');
        if (startIndexOfOrder !== -1) {
            this.orderPart = ' ' + this.rawJql.slice(startIndexOfOrder);
            this.jqlWithoutOrderPart = this.rawJql.slice(0, startIndexOfOrder);
        }else{
            this.jqlWithoutOrderPart = this.rawJql;
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