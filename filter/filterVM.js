/*
过滤器的ViewModel
*/

import { ViewModel } from "../common/viewModel.js";
import { Model } from "./modelManager.js";
import { ViewConfig } from "./viewConfig.js"
import {date2String} from "./../model/toolSet.js"

export class FilterViewModel extends ViewModel {
    constructor(model, viewConfig) {
        super("FilterViewModel");
        this.model = model;
        this.viewConfig = viewConfig;

        this.filterSelectedOptions = {};

        this.regModelEvent(this.model, "SelectedOptions", ()=>{this.trigVMChangeEvent("Filter.SelectedOptions")})
        this.regModelEvent(this.viewConfig, "FieldsVisibility", ()=>{this.trigVMChangeEvent("Filter.FieldsVisibility")})
    }

    /**
     * 获取所有Filter的json数据描述
     * @returns {json} filters
     */
    getFilters(){
        return this.viewConfig.getFiltersDict();
    }

    /**
     * 获取Filter的可见性
     * @returns {json} filterVis {key : {visible : true/false}}
     */
    getFilterVisibility(){
        return this.viewConfig.getFieldsVisibility()
    }

    /**
     * 根据Filter的key，返回给他应该展示的选项
     * 由于有应该展示的选项的Filter只有DropDown，所以其他类型的Filter传进来，则返回undefined
     * @param {*} key 
     * @returns {Set<string>} options
     */
    getFilterOptions(key) {
        let options = this.model.getFilterOptions(key);
        let arrOptions = Array.from(options);
        let arrOptions2 = arrOptions.map(x => x===undefined ? "Empty Field":x)
        return new Set(arrOptions2);
    }

    /**
     * 根据Filter的key，返回给他应该选中的选项
     * 如果是DropDown，则返回Set<string>
     * 如果是FreeText，则返回string
     * 如果是DateRange，则返回Array[from, to]
     * @param {string} key 
     * @returns {*} selectedOptions
     */
    getFilterSelectedOptions(key) {
        let selected = this.model.getFilterSelectedOptions(key);
        // 如果是DateRange，则把时间替换为字符串
        if(selected instanceof Array){
            if (selected.length != 2) return ['',''];

            let selCopy = Array.from(selected);
            if (selCopy[0] === Model.initStartDate) {
                selCopy[0] = '';
            }else{
                selCopy[0] = date2String(selCopy[0]);
            }
            if (selCopy[1] === Model.initEndDate) {
                selCopy[1] = '';
            }else{
                selCopy[1] = date2String(selCopy[1]);
            }
            return selCopy;
        }else if(selected instanceof Set){
            let selCopy = Array.from(selected);
            let selCopy2 = selCopy.map(x => x===undefined?"Empty Field":x)
            return new Set(selCopy2);
        }
        return selected;
    }

    /**
     * 根据Filter的key，设置他选中的选项
     * @param {string} key 
     * @param {*} selectedOptions 如果是DropDown，则类型为Set<string>；如果是FreeText，则类型为string：如果是DateRange，则类型为Array[from, to]
     */
    setFilterSelectedOptions(key, selectedOptions) {
        // 如果是DateRange，则把字符串改为时间
        if(selectedOptions instanceof Array){
            if(selectedOptions[0] === "" && selectedOptions[1] === ""){
                selectedOptions = new Array();
            }else{
                selectedOptions[0] = selectedOptions[0] === "" ? Model.initStartDate : new Date(selectedOptions[0]);
                selectedOptions[1] = selectedOptions[1] === "" ? Model.initEndDate : new Date(selectedOptions[1]);
            }
        }else if(selectedOptions instanceof Set){
            let selectedOptionsCopy = Array.from(selectedOptions);
            let selectedOptionsCopy2 = selectedOptionsCopy.map(x => x==="Empty Field"?undefined:x)
            selectedOptions = new Set(selectedOptionsCopy2);
        }
        this.model.setFilterSelectedOptions(key, selectedOptions);
    }

    /**
     * 设置Filter对应chart的可见性
     * @param {string} key Filter的key
     * @param {bool} chartVis 该Filter对应chart的可见性
     */
    setChartVisibility(key, chartVis){
        this.viewConfig.setChartVisibility(key, chartVis);
    }

}