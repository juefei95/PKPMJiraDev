

export class AbstractModel{
    constructor(modelName){
        this.modelName = modelName;
    }

    
    /**
     * 获取model更新消息名，方便ViewModel注册
     * @param {string} dataName 具体是什么数据变了
     * @return {string} modelUpdateEvent 
     */
     getModelChangeEventName(dataName){
        return this.modelName + "ChangEvent:"+dataName;
    }

    /**
     * model发送消息，说自己有改动
     * @param {string} dataName 具体是什么数据变了
     */
     trigModelChangeEvent(dataName){
        window.dispatchEvent(new CustomEvent(this.getModelChangeEventName(dataName)));
    }
}