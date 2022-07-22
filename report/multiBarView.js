
/*
以多Bar方式展示Report
*/
import { getJiraHost } from './../model/toolSet.js'

export class MultiBarView{
    constructor(id, label, datasets){
        this.id = id;
        this.label = label;
        this.datasets = datasets;
    }

    updateView(){        

        $("#"+this.id).empty();
        let canvas = document.createElement("canvas");
        $("#"+this.id).append(canvas);
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: this.label,
                datasets: this.datasets,
            },
            options: {
                responsive: true,
                //maintainAspectRatio: true,
                //showTooltips: true,
                //tooltips: {
                //    enabled: true,
                //    mode: 'nearest',
                //    callbacks: {
                //        //title: function(tooltipItems, data) { 
                //        //    return "helo";
                //        //},
                //        label: function(tooltipItem, data) {
                //            return '<a href="www.baidu.com">hel</a>';
                //        },
                //    }
                //}, 
                scales: {
                    yAxes: [{
                        ticks: {
                            precision: 0
                        }
                    }]
                },
                onClick: function (e, data) {
                    let bar = this.getElementAtEvent(e)[0];
                    if (bar) {
                        let index           = bar._index;
                        let datasetIndex    = bar._datasetIndex;
                        let issueIds        = bar._chart.data.datasets[datasetIndex].issueId[index];
                        let url             = encodeURI(getJiraHost() + "issues/?jql=key in ("+issueIds.join(",")+") ORDER BY createdDate ASC");
                        window.open(url, '_blank').focus();
                    }
                }
            }
        });
    }
}