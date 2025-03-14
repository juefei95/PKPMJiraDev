/*
Chart控件
*/

import { ChartViewModel } from './chartVM.js'

export class ChartControl{

    constructor(vm, canvasId){
        this.vm = vm;
        this.canvasId = canvasId;
        this.chart = undefined;
    }

    // 绘制状态Chart
    updateView(field) {
        let labelsData = this.vm.getSelectedIssuesPropCount(field);

        let canvas = $('#' + this.canvasId);
        if (this.chart) this.chart.destroy();

        let _this = this;
        this.chart = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: Object.keys(labelsData),
                datasets: [{
                        //label: '状态',
                        data: Object.values(labelsData),
                        backgroundColor: _this._poolColors(Object.keys(labelsData).length),
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                onClick:  function(c, i){
                    var e = i[0];
                    var x_value = this.data.labels[e._index];
                    //var y_value = this.data.datasets[0].data[e._index];
                    //console.log(x_value);
                    _this.vm.setFilterSelectedOptions(field, new Set([x_value]));
                },
                plugins: {
                    datalabels: {
                        align: 'start',
                        anchor: 'end',
                        color: 'black',
                        font: function (context) {
                            return {
                                size: 12,
                                weight: 'bold',
                            };
                        },
                        formatter: function (value, context) {
                            let sum = 0;
                            let dataArr = context.dataset.data;
                            dataArr.map(data => {
                                sum += data;
                            });
                            let percentage = (value * 100 / sum).toFixed(0) + "%";
                            return context.chart.data.labels[context.dataIndex] + context.dataset.data[context.dataIndex] + "\r\n" + percentage;
                        }
                    }
                }
            }
        });
    }

    /**
     *
     * Description. 返回一个随机颜色的字符串
     *
     * @return string
     */
    _dynamicColors() {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return "rgba(" + r + "," + g + "," + b + ", 0.5)";
    }

    /**
     *
     * Description. 返回n个随机颜色字符串
     *
     * @param {int} n     数目
     * @return array of string
     */
    _poolColors (n) {
        var pool = [];
        for (var i = 0; i < n; i++) {
            pool.push(this._dynamicColors());
        }
        return pool;
    }
}