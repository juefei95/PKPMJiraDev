
import { printInfo }                from "./../model/toolSet.js";
import { JiraSite }                 from './../model/jiraSite.js'
import { CreatorFrame }             from "./creatorFrame.js";
import { Model }                    from "./model.js";

export async function helloCreator(){

    try {
        printInfo("正在获取最近访问的项目名称...");
        let recentProjs = await new JiraSite().getRecentProjectsName(4);
        let model = new Model(recentProjs);

        // 展示框架
        printInfo(" 展示框架");
        window.frame = await new CreatorFrame(model);
        printInfo(" 框架正在准备...");
        await window.frame.prepare();
        printInfo(" 显示框架")
        window.frame.show();

    } catch (err) {
        debugger;
        printInfo("发生错误：");
        printInfo(err.stack);
        return;
    }
}