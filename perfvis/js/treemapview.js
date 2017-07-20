class Treemapview{
	constructor(main){
		var me = this;
		this.main = main;



        this.m = [30, 50, 10, 50, 0]; //top right bottom left (space between main and mini)
        var bb = document.querySelector('#Treemaps')
                    .getBoundingClientRect();
       	this.w = bb.right - bb.left - this.m[1] - this.m[3];
        this.h = 300 - this.m[0] - this.m[2];

        this.chart = d3.select("#Treemaps")
            .append("svg")
            .attr("width", this.w + this.m[1] + this.m[3])
            .attr("height", this.h + this.m[0] + this.m[2])
            .attr("class", "chart")
            .append("g")
            .attr("transform", "translate(" + this.m[3] + "," + this.m[0] + ")")
            .attr("width", this.w)
            .attr("height", this.h)
            .attr("class", "main");
		for(var i = 0;i<5;i++){

        	this.chart.append("g").append("text").text(i).attr("x",i*(230)).attr("y", 220)
        	.attr("font-size","16px")
        	.attr("font-family","sans-serif");
		}

	}

	updateThread(thread, isTimer, measure){

		var width = 200;
		var height = 200;
        var me = this;

        var profiles = thread.timerProfiles;
        if(!isTimer){
            profiles = thread.counterProfiles;
        }
        var array = [];
        Object.keys(profiles).forEach(function(d) {
            array.push({"name":d,"size":profiles[d][measure]});
        })
        console.log(array);

        var td = {"children":array};

    	var color = d3.scale.category20c();
        console.log(td);

		var treemap = d3.layout.treemap()
    		.size([width, height])
    		.sticky(true)
    		.value(function(d) { return d.size; });

        this.chart.selectAll("rect.thread" + thread.location).remove();


		var node = this.chart.datum(td).selectAll("thread" + thread.location)
		    .data(treemap.nodes)
		    	.enter()
		    	.append("rect")
		      .attr("class", "thread" + thread.location)
		      .call(position)
		      .attr("fill", function(d) {
		          return d.name == 'tree' ? '#fff' : color(d.name); })
		      .append('title')
		      .style("font-size", function(d) {
		          // compute font size based on sqrt(area)
		          return Math.max(20, 0.18*Math.sqrt(d.area))+'px'; })
		      .text(function(d) { return d.children ? null : d.name; });
	 
		function position() {
	  		this.attr("x", function(d) { return (width+30)*thread.location + d.x + "px"; })
	      		.attr("y", function(d) { return d.y + "px"; })
	      		.attr("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
	      		.attr("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
		}
	}
}