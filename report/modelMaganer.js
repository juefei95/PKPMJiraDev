/*
主要负责管理数据
*/


export class Model{
    constructor(issues){
        this.issues = issues;
    }

    getIssues(){
        return this.issues;
    }

}