/**
 * 所有ViewModel的基类
 */

import { AbstractModel } from './model.js'

export class ViewModel{
    constructor(vmName){
        this.vmName = vmName;
    }

    /**
     * 获取VM更新消息名，方便View注册
     * @param {string} dataName 具体是什么数据变了
     * @return {string} vmUpdateEvent 
     */
    getVMChangeEventName(dataName){
        return this.vmName + "ChangEvent:"+dataName;
    }

    /**
     * VM发送消息，说自己有改动
     * @param {string} dataName 具体是什么数据变了
     */
    trigVMChangeEvent(dataName){
        window.dispatchEvent(new CustomEvent(this.getVMChangeEventName(dataName)));
    }

    
    /**
     * 注册Model的数据变化事件
     * @param {Model} model 具体注册哪个model的实例
     * @param {string} dataName 注册ViewModel的哪个数据变化事件
     * @param {func} callback 消息响应函数
     */
     regModelEvent(model, dataName, callback){
        // 绑定vm的change消息
        window.addEventListener(model.getModelChangeEventName(dataName), callback);
    }

}