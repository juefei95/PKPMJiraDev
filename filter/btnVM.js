
import { ViewModel } from '../common/viewModel.js'


export class BtnViewModel extends ViewModel{
    constructor(model, viewConfig){
        super("BtnViewModel");
        this.model = model;
        this.viewConfig = viewConfig;
    }

    clearFilterSelectedOptions(){
        this.model.clearFilterSelectedOptions();
    }

    /**
    * 获取Filter的可见性
    * @returns {json} filterVis {key : {visible : true/false}}
    */
    getFieldsVisibility() {
        return this.viewConfig.getFieldsVisibility()
    }

    setFieldsVisibility(fieldsVis){
        this.viewConfig.setFieldsVisibility(fieldsVis)
    }

    genJQLWithSelection(){
        return this.model.genJQLWithSelection();
    }
}