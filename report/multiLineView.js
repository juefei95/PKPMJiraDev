
/*
以多线方式展示Report
*/


export class MultiLineView{
    constructor(id, dataRange, datasets){
        this.id = id;
        this.dataRange = dataRange;
        this.datasets = datasets;
    }

    updateView(){        
        // 绘制线
        $("#"+this.id).empty();
        $("#"+this.id).css("width", "95vw");
        $("#"+this.id).css("height", "85vh");
        $("#"+this.id).css("display", "block");
        $("#"+this.id).css("margin", "0 auto");
        let canvas = document.createElement("canvas");
        $("#"+this.id).append(canvas);
        new Chart(canvas, {
            type: 'line',
            data: {
                labels : this.dataRange,
                datasets: this.datasets,
              },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            precision: 0
                        }
                    }]
                },
            }
        });
    }
}