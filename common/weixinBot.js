/**
 * 企业微信机器人
 */


export class WeixinBot{
    constructor(botUrl){
        this.botUrl = botUrl;
    }

    postText(text){
        let data = {"msgtype": "text", "text": {"content": text}}
        this._postMsg(data)
    }
    _postMsg(data){
        let httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('POST', this.botUrl, true); //第二步：打开连接/***发送json格式文件必须设置请求头 ；如下 - */
        httpRequest.setRequestHeader("Content-type","application/json");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）var obj = { name: 'zhansgan', age: 18 };
        httpRequest.setRequestHeader("Access-Control-Allow-Origin","*");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）var obj = { name: 'zhansgan', age: 18 };
        httpRequest.send(JSON.stringify(data));//发送请求 将json写入send中
    }
}