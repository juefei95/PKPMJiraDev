
import {View} from './../common/view.js'
import { ChartControl } from './chartControl.js'

export class ChartPanel extends View {
    
    constructor(id, vm){
        super(vm);
        this.panelId = id;
        this.ids = {
            chartContainer                  : 'chartContainer',                 // chart外围的容器，目前是ul，为了可以拖拽
            chartClass                      : 'chartClass',                     // chart被统一选择的class
            
        };
        this.charts = {};
        this.regVMEvent("Chart.SelectedIssues", this.updateView.bind(this));
        this.regVMEvent("Chart.FieldsVisibility", this.updateView.bind(this));
        this.regVMEvent("Chart.ChartsVisibility", this.updateView.bind(this));
    }

    updateView(){
        let fieldsVis = this.vm.getFieldsVisibility();
        for (const [k,v] of Object.entries(this.vm.getCharts())){
            if (fieldsVis[k].visible && v.visible) {
                $("#" + k +"CanvasDiv").css("display", "inline-block");
                this.charts[k].updateView(k);
            }else{
                $("#" + k +"CanvasDiv").css("display", "none");
            }
        }
    }

    updateFieldsVisibility(){
        this.updateView();
    }
    
    // 插入Chart控件到left layout
    createHtml(){
        // 左侧Chart区
        var chartH5 = `
            <style>
                #${this.ids.chartContainer} {
                    list-style-type:none;
                    justify-content: center;
                    padding: 0px;
                }
                #${this.ids.chartContainer} li{
                    display: list-item;
                    padding: 5px 5px;
                    margin: 0px;
                }
                #${this.ids.chartContainer} li p{
                    text-align: center;
                }
                #${this.ids.chartContainer} li div canvas{
                    margin-right: auto;
                    margin-left: auto;
                    display: block;
                }
            </style>
            <ul id="${this.ids.chartContainer}">
                <li style="list-style-type:none">
                    <p style="font-size: large;font-weight: bold;">以下图片可以拖拽改变排序</p>
                </li>
        `;
        for (const [k,v] of Object.entries(this.vm.getCharts())){
            chartH5 +=  `
                <li style="list-style-type:none">
                    <div class="${this.ids.chartClass}" id="${k}CanvasDiv" style="width: 100%;">
                        <canvas id="${k}Canvas"></canvas>
                    </div>
                </li>
            `;
        }
        chartH5 += '</ul>';
        return chartH5;
    }

    // config控件
    configControls(){
        
        // chart可拖拽
        $( "#" + this.ids.chartContainer ).sortable();
        $( "#" + this.ids.chartContainer ).disableSelection();

        // 创建charts
        for (const [k,v] of Object.entries(this.vm.getCharts())){
            this.charts[k] = new ChartControl(this.vm, k + "Canvas");
        }
    }
}
