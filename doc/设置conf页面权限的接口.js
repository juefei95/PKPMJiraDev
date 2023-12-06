
// 用户的中文名对应的Conf里的Id
let userId = {
    "丛旭" : "2c91876072e4a30c01735c2120e3000e",
    "史建鑫" : "2c91c5f26dd2b0c6016dd2b5e4dd0004",
    "廉明" : "2c91c5f27043d1670170530f6efa0002",
    "徐德海" : "402800508177af6b0189b4e113cb017a",
    "张亚楠" : "ff80808177509efd017ad0d911d10161",
    "常丽娟" : "2c91c5f2700605f60170439ce30d0038",
    "张欣" : "2c91c5f2700605f601701430fea60000",
    "朱恒禄" : "2c91c5f2700605f601701430feaa0001",
    "李宏伟" : "402800508177af6b0189615695e7015f",
    "潘昱欣" : "ff80808177509efd017945673f460105",
    "段方舟" : "2c91c5f2700605f601701430feab0008",
    "王如琦" : "402800aa7cf337ff0180f3a150bf00b5",
    "祁博文" : "402800508177af6b01860545f5d300e3",
    "葛震" : "2c91c5f27043d1670170530f6efc000b",
    "赵彦波" : "402800aa7cf337ff017ee7d080de0037",
    "边保林" : "2c91c5f27043d1670170530f6f010025",
    "韩天楠" : "402800508177af6b018233651e2c0044",
    "赵珊珊" : "2c91c5f27043d1670170530f6f00001e",
    "韩盛柏" : "ff80808177509efd017aa81752770153",
    "陈晓明" : "2c91c5f2700605f601701430feab0009",
    "高杨梅" : "2c91876073e02eac0174249bbe770008",
    "鲁浩" : "402800508177af6b018943727d0e0156",
    "黄思远" : "2c91c5f27043d1670170530f6f000020",
}
// 操作页面需要带上的token
let atlToken = document.getElementById("atlassian-token")["content"];
// 当前页面的id
let contentId = document.head.querySelector("[name~=ajs-page-id][content]").content;
// 用户中文名的拼音，后期可以用pinyin库动态生成
let userPinyinMap = {
    "祁博文" : "qibowen",
    "常丽娟" : "changlijuan",
    "陈晓明" : "chenxiaoming",
    "丛旭" : "congxu",
    "段方舟" : "duanfangzhou",
    "高杨梅" : "gaoyangmei",
    "韩盛柏" : "hanshengbai",
    "潘昱欣" : "panyuxin",
    "史建鑫" : "shijianxin",
    "王如琦" : "wangruqi",
    "张欣" : "zhangxin",
    "赵珊珊" : "zhaoshanshan",
    "赵彦波" : "zhaoyanbo",
    "朱恒禄" : "zhuhenglu",
    "韩天楠" : "hantiannan",
    "黄思远" : "huangsiyuan",
    "廉明" : "lianming",
    "张亚楠" : "zhangyanan",
    "鲁浩" : "luhao",
    "徐德海" : "xudehai",
    "李宏伟" : "lihongwei",
    "葛震" : "gezhen",
    "边保林" : "bianbaolin",
};


// 设置权限
function setPermissions(permitUsers){
    
    let postData = "";
    for(let i=0; i<permitUsers.length; i++){
        postData += "viewPermissionsUserList=" + userId[permitUsers[i]] + "&"
    }

    for(let i=0; i<permitUsers.length; i++){
        postData += "editPermissionsUserList=" + userId[permitUsers[i]] + "&"
    }
    postData += "contentId="+contentId+"&atl_token="+atlToken

    let setPermitUrl = "https://confluence.pkpm.cn/pages/setcontentpermissions.action"

    var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
    httpRequest.open('POST', setPermitUrl, true); //第二步：打开连接
    httpRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）
    httpRequest.send(postData);//发送请求 将情头体写在send中
    /**
     * 获取数据后的处理程序
     */
    httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
        if (httpRequest.status == 200) {//验证请求是否发送成功
            //location.reload();
            alert("设置权限成功");
        }else{
            alert("设置权限失败");
        }
    };
}

// 输入中文名，查询用户的Id
function getUserKey(userChinese, userPinyinMap){
    
    let getUserIdUrl = "https://confluence.pkpm.cn/rest/prototype/1/search/user-or-group.json?max-results=6&query="+userPinyinMap[userChinese]
    var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
    httpRequest.open('GET', getUserIdUrl, true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
    httpRequest.send();//第三步：发送请求  将请求参数写在URL中
    /**
     * 获取数据后的处理程序
     */
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var json = httpRequest.responseText;//获取到json字符串，还需解析
            //console.log(json);
            const obj = JSON.parse(json);
            for(let i=0; i<obj.result.length; i++){
                if(obj.result[i]["title"] == userChinese){
                    console.log(`"${userChinese}" : "${obj.result[i]["userKey"]}",`)
                    return;
                }
            }
            console.log("找不到用户", userChinese);
        }
    };
}

// 批量的查询用户的id
function batchGetUserKey(){
    let queryUserId = ["丛旭", "史建鑫", "常丽娟", "廉明", "张亚楠", "张欣", "徐德海", "朱恒禄", "李宏伟", "段方舟", "潘昱欣", "王如琦", "祁博文", "葛震", "赵彦波", "赵珊珊", "边保林", "陈晓明", "韩天楠", "韩盛柏", "高杨梅", "鲁浩", "黄思远"]

    for(let i=0; i<queryUserId.length; i++){
        getUserKey(queryUserId[i], userPinyinMap)
    }
}

// 批量设置本页面权限
function batchSetPermissions(){
    
    let permitUsers = ["祁博文","边保林","常丽娟","陈晓明","丛旭","段方舟","高杨梅","韩盛柏","潘昱欣","史建鑫","王如琦","张欣","赵珊珊","赵彦波","朱恒禄","韩天楠","葛震"];
    setPermissions(permitUsers)
}
