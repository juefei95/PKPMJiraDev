/**
 * 所有视图的抽象类
 */

import { ViewModel } from "./../common/viewModel.js";

export class View{
    constructor(vm){
        this.vm = vm;

    }

    /**
     * 注册ViewModel的数据变化事件
     * @param {string} dataName 注册ViewModel的哪个数据变化事件
     * @param {func} callback 消息响应函数
     */
    regVMEvent(dataName, callback){
        // 绑定vm的change消息
        window.addEventListener(this.vm.getVMChangeEventName(dataName), callback);
    }


}