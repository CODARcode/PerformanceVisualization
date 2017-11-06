//the overview in the top for time selection and zooming in.
class Overview{
	constructor(main, traceArray,messageArray, timeMax, timeUnit){
        var me = this;
        this.main = main;
        this.leftMargin = 20;

        this.m = [10, 30, 10, 10, 0]; //top right bottom left (space between main and mini)
        var bb = document.querySelector('#Overview')
                    .getBoundingClientRect();
       	this.w = bb.right - bb.left - this.m[1] - this.m[3];
        this.h = 750 - this.m[0] - this.m[2];
        //chart
        this.chart = d3.select("#Overview")
            .append("svg")
            .attr("width", this.w + this.m[1] + this.m[3])
            .attr("height", this.h + this.m[0] + this.m[2])
            .attr("class", "chart");
        this.histo = new Histogram(main, me, messageArray, timeMax, timeUnit);
        this.heatmap = new HeatMap(main, me, 60, traceArray, timeMax, timeUnit);
        this.heatmap.init();
        this.histo.init();
    }
}
