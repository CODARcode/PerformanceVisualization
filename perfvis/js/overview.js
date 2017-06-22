class Overview{
	constructor(main){
        var me = this;

        this.main = main;

        this.m = [10, 50, 15, 20, 0]; //top right bottom left (space between main and mini)
        var bb = document.querySelector('#Overview')
                    .getBoundingClientRect();
       	this.w = bb.right - bb.left - this.m[1] - this.m[3];
        this.h = 150 - this.m[0] - this.m[2];
        var regions = main.traces.regions;
        this.c20 = d3.scale.category20().domain(regions);
        //chart
        this.chart = d3.select("#Overview")
            .append("svg")
            .attr("width", this.w + this.m[1] + this.m[3])
            .attr("height", this.h + this.m[0] + this.m[2])
            .attr("class", "chart");
        this.heatmap = new HeatMap(main.traces, main, me, 0, this.w);
    }

    init(main){
        var me = this;
        main.traces.threads.forEach(function(d){
            me.heatmap.init(d);
        });
    }

    initBrush(){
        this.heatmap.initBrush();
    }


	drawlegend(regions){
		// Draw legend
		var me = this;
        var bb = document.querySelector('#Legend')
                    .getBoundingClientRect();
        var twidth = bb.right - bb.left;
        var theight = 450;
        var svg = d3.select("#Legend")
            .append("svg")
            .attr("width", twidth)
            .attr("height", theight)
            .attr("class", "chart")
		  	.attr("transform", function(d, i) { return "translate(-30,0)"; })
            .append("g");

		var legend = svg.selectAll(".legend")
		  .data(regions)
		  .enter().append("g")
		  .attr("class", "legend")
		  .attr("transform", function(d, i) { return "translate(0," + (i * 19+10) + ")"; });
		 
		legend.append("rect")
		  .attr("x", -5)
		  .attr("width", 18)
		  .attr("height", 9)
		  .style("fill", function(d) {return me.c20(d)});
		 
		legend.append("text")
		  .attr("x", 15)
		  .attr("y", 4)
		  .attr("dy", ".35em")
		  .style("text-anchor", "start")
		  .text(function(d) { 
		  	return d;
		  });
	}
}
