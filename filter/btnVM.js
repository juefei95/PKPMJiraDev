
import { ViewModel } from '../common/viewModel.js'


export class BtnViewModel extends ViewModel{
    constructor(model, config){
        super("BtnViewModel", model);
        this.config = config;
    }

    clearFilterSelectedOptions(){
        this.model.clearFilterSelectedOptions();
    }

    /**
    * 获取Filter的可见性
    * @returns {json} filterVis {key : {visible : true/false}}
    */
    getFieldsVisibility() {
        return this.config.getFieldsVisibility()
    }

    setFieldsVisibility(fieldsVis){
        this.model.setFieldsVisibility(fieldsVis)
    }

    genJQLWithSelection(){
        return this.model.genJQLWithSelection();
    }
}