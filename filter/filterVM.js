/*
过滤器的ViewModel
*/

import { ViewModel } from "../common/viewModel.js";
import { Model } from "./modelManager.js";
import { Config } from "./configManager.js"
import {date2String} from "./../model/toolSet.js"

export class FilterViewModel extends ViewModel {
    constructor(model, config) {
        super("FilterViewModel", model);
        this.config = config;

        this.filterSelectedOptions = {};

        this.regModelEvent("SelectedOptions", ()=>{this.trigVMChangeEvent("SelectedOptions")})
        this.regModelEvent("FieldsVisibility", ()=>{this.trigVMChangeEvent("FieldsVisibility")})
    }

    /**
     * 获取所有Filter的json数据描述
     * @returns {json} filters
     */
    getFilters(){
        return this.config.getFiltersDict();
    }

    /**
     * 获取Filter的可见性
     * @returns {json} filterVis {key : {visible : true/false}}
     */
    getFilterVisibility(){
        return this.config.getFieldsVisibility()
    }

    /**
     * 根据Filter的key，返回给他应该展示的选项
     * 由于有应该展示的选项的Filter只有DropDown，所以其他类型的Filter传进来，则返回undefined
     * @param {*} key 
     * @returns {Set<string>} options
     */
    getFilterOptions(key) {
        return this.model.getFilterOptions(key);
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
            selectedOptions[0] = selectedOptions[0] === "" ? Model.initStartDate : new Date(selectedOptions[0]);
            selectedOptions[1] = selectedOptions[1] === "" ? Model.initEndDate : new Date(selectedOptions[1]);
        }
        this.model.setFilterSelectedOptions(key, selectedOptions);
    }

    /**
     * 设置Filter对应chart的可见性
     * @param {string} key Filter的key
     * @param {bool} chartVis 该Filter对应chart的可见性
     */
    setChartVisibility(key, chartVis){
        this.model.setChartVisibility(key, chartVis);
    }

}