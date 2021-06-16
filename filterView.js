/*
所有FilterView
*/

import {date2String} from './toolSet.js'
import {Model} from './modelManager.js'

export class CommonFilterView{
    
    // 工厂函数
    static CreateFilterView(type, args){
        if (type === 'DropDown') {
            return new OptionFilterView(args.model, args.key, args.id, args.placeholder);
        }else if (type === 'Text') {
            return new FreeTextFilterView(args.model, args.key, args.id, args.placeholder);
        }else if (type === 'DateRange'){
            return new DateRangeFilterView(args.model, args.key, args.id);
        }
        return undefined;
    }
}



class OptionFilterView extends CommonFilterView{

    constructor(model, key, id, placeholder){
        super();
        this.model = model;
        this.key = key;
        this.id = id;
        this.placeholder = placeholder;
    }

    updateView(){
        let options = this.model.getFilterOptions(this.key);
        let selected = this.model.getFilterSelectedOptions(this.key);
        this._show(options, selected, this.id, this.placeholder, this.key);
    }

    /**
     *
     * Description. 通用的过滤器展示
     *
     * @param {Set} options     可供展示的选项
     * @param {Set} selected    哪些选项是被选中的
     * @param {string} filterId    控件ID
     * @param {string} placeholder    控件上展示的占位字符串
     * @param {string} filterType    当前筛选器类型
     * @return None
     */
    _show(options, selected, filterId, placeholder, filterType){

        var data = [];
        var selectedOption = [];
        for (const[i, v]of Array.from(options).entries()) {
            data.push({
                id: i + 1,
                text: v
            });
            if (selected.has(v)) selectedOption.push(i+1);
        }
        
        // 数据排序，Empty Field排前面，英文次之，中文最后按拼音顺序
        data = data.sort((x,y)=>{
            if (x.text === "Empty Field") return -1;
            if (y.text === "Empty Field") return 1;
            
            let reg = /[a-zA-Z0-9]/;
            if(reg.test(x.text)|| reg.test(y.text)){
                if(x.text>y.text){
                    return 1;
                }else if(x.text<y.text){
                    return -1;
                }else{
                    return 0;
                }
            }else{
                return x.text.localeCompare(y.text, 'zh-Hans-CN', {sensitivity: 'accent'});
            }
        });
        
        $('#' + filterId).select2({
            data: data,
            placeholder: placeholder,
            allowClear: true,
            closeOnSelect:false,
            matcher: function(params, data) {
                // If there are no search terms, return all of the data
                if ($.trim(params.term) === '') {
                  return data;
                }
            
                // Do not display the item if there is no 'text' property
                if (typeof data.text === 'undefined') {
                  return null;
                }

                if (/^[a-zA-Z]+$/.test(params.term)){
                    let py = pinyinUtil.getPinyin(data.text, '', false, false);
                    if (py.includes(params.term)) return data;
                }

                // Return `null` if the term should not be displayed
                return null;
            },
        });
        $('#' + filterId).val(selectedOption).trigger('change');

        // 添加消息响应
        $('#' + filterId).on('change.select2', e => {
            var optionSelected = this._getSelectedOptions(e.target);
            var optionTexts = [];
            for (const o of optionSelected){
                optionTexts.push(o.innerText);
            }
            this.model.setFilterSelectedOptions(filterType, new Set(optionTexts));
            window.dispatchEvent(new CustomEvent("updateView", {
                detail: {
                    from : 'filter',
                }}));
        });

    }
    

    // 获得Select的所有选择的Option
    _getSelectedOptions(sel) {
        var opts = [], opt;
        var len = sel.options.length;
        for (var i = 0; i < len; i++) {
           opt = sel.options[i];

           if (opt.selected) {
               opts.push(opt);
           }
        }

        return opts;
    }
}


class FreeTextFilterView extends CommonFilterView{

    constructor(model, key, id, placeholder, cbUpdateFilter){
        super();
        this.model = model;
        this.key = key;
        this.id = id;
        this.placeholder = placeholder;
        this.cbUpdateFilter = cbUpdateFilter;
    }

    updateView(){
        let selected = this.model.getFilterSelectedOptions(this.key);
        this._show(selected, this.id, this.placeholder, this.key);
    }

    
    _show(selected, filterId, placeholder, filterType){
        
        // 根据筛选器的值设置input的值
        //if (selected == ""){
        //    $("#"+filterId).empty().trigger('change');
        //}

        // 初始化select2
        $("#"+filterId).select2({
            data:[selected],
            width:"100%",
            tags: true,
            allowClear: false,
            maximumSelectionLength: 1,
            placeholder: placeholder,
        });
        // 设置CSS
        $("#"+filterId).siblings().find('.select2-search__field').on( "change keyup keydown paste cut", ()=> {
            $( this ).css('width','100%');
        });
        $("#"+filterId).siblings().find('.select2-selection.select2-selection--multiple').css('display','flex'); 
        $("#"+filterId).siblings().find('.select2-selection.select2-selection--multiple').css('flex-direction','row'); 
        $("#"+filterId).siblings().find('.select2-selection__rendered').css('flex','0'); 
        
        // 添加消息响应
        $("#"+filterId).on('select2:open', e => {
            $('.select2-container--open .select2-dropdown--below').css('display','none');
        }).on('change.select2', e => {
            var optionTexts = e.target.value;
            this.model.setFilterSelectedOptions(filterType, optionTexts);
            window.dispatchEvent(new CustomEvent("updateView", {
                detail: {
                    from : 'filter',
                }}));
        });
    }

}


class DateRangeFilterView extends CommonFilterView{

    constructor(model, key, id, cbUpdateFilter){
        super();
        this.model = model;
        this.key = key;
        this.id = id;
        this.cbUpdateFilter = cbUpdateFilter;
    }

    updateView(){
        let selected = this.model.getFilterSelectedOptions(this.key);
        this._show(selected, this.id, this.key);
    }

    // 显示Date Range Filter
    _show(selected, filterId, filterType){
        
        // 根据当前筛选器的值，决定初始化input的值
        if (selected[0] == date2String(Model.initStartDate)){
            $("#"+filterId+"1").val('');
        }
        if (selected[1] == date2String(Model.initEndDate)){
            $("#"+filterId+"2").val('');
        }
        // 设置w2field类型
        $("#"+filterId+"1").w2field('date', { format: 'yyyy-mm-dd', end: $("#"+filterId+"2") });
        $("#"+filterId+"2").w2field('date', { format: 'yyyy-mm-dd', start: $("#"+filterId+"1") });
        // 添加消息响应
        $("#"+filterId+"1").on('change', e => {
            let dateFrom = $("#"+filterId+"1").val();
            let dateTo = $("#"+filterId+"2").val();
            dateFrom = dateFrom === "" ? Model.initStartDate : new Date(dateFrom);
            dateTo = dateTo === "" ? Model.initEndDate : new Date(dateTo);
            this.model.setFilterSelectedOptions(filterType, [dateFrom, dateTo]);
            window.dispatchEvent(new CustomEvent("updateView", {
                detail: {
                    from : 'filter',
                }}));
        });
        $("#"+filterId+"2").on('change', e => {
            let dateFrom = $("#"+filterId+"1").val();
            let dateTo = $("#"+filterId+"2").val();
            dateFrom = dateFrom === "" ? Model.initStartDate : new Date(dateFrom);
            dateTo = dateTo === "" ? Model.initEndDate : new Date(dateTo);
            this.model.setFilterSelectedOptions(filterType, [dateFrom, dateTo]);
            window.dispatchEvent(new CustomEvent("updateView", {
                detail: {
                    from : 'filter',
                }}));
        });
    }
    
}