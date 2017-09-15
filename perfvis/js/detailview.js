//the detailed view for the message bar chart and the detailed function calls visualization
class Detailview{
	constructor(main){
		var me = this;
		this.main = main;
		this.leftMargin = 30;

		var bb = document.querySelector('#Detailview')
            .getBoundingClientRect();

        this.m = [10, 10, 0, 10, 0]; //top right bottom left (space between main and mini)

       	this.w = bb.right - bb.left - this.m[1] - this.m[3];
        this.h = 680 - this.m[0] - this.m[2];

        this.chart = d3.select("#Detailview")
            .append("svg")
            .attr("width", this.w + this.m[1] + this.m[3])
            .attr("height", this.h + this.m[0] + this.m[2])
            .attr("class", "chart");
        this.histo = new MessageVis(main, me);
		this.tracevis = new TraceVis(main, me, 60);
	}

	init(){
        this.histo.init();
	}

	update(brush){
        var me = this;
        this.tracevis.update(brush);
        this.histo.update(brush);
	}
}