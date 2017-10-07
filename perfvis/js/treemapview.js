class Treemapview{
	constructor(main){
		var me = this;
		this.main = main;

        this.m = [30, 50, 10, 50, 0]; //top right bottom left (space between main and mini)
        var bb = document.querySelector('#Treemaps')
                    .getBoundingClientRect();
       	this.w = bb.right - bb.left - this.m[1] - this.m[3];
        this.h = 300 - this.m[0] - this.m[2];

        this.noThreads = main.traces.noThreads;//threads.length;
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

	updateThread(thread, timerId, measure){

		var width = 200;
		var height = 200;
        var me = this;

        var profiles = {};
        var index = Math.floor(timerId/2);
        if(timerId%2==0){
            profiles = thread.timerProfiles[index];
        }else{
            profiles = thread.counterProfiles[index];
        }
        
        this.chart.selectAll("rect.thread" + thread.location).remove();
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var array = [];
        Object.keys(profiles).forEach(function(d) {
            array.push({"name":d,"children":[{"name":d,"size":profiles[d][measure]}]});
        })
		var treemap = d3.treemap().size([width, height])
        var root = d3.hierarchy(array, (d) => d.children).sum((d) => d.size);
        var tree = treemap(root)

		var node = this.chart.datum(root).selectAll("thread" + thread.location)
		    .data(tree.leaves())
		    	.enter()
		    	.append("rect")
		      .attr("class", "thread" + thread.location)
		      .attr("fill", function(d) {
		          return d.name == 'tree' ? '#fff' : color(d.name); })
		      .append('title')
		      .style("font-size", function(d) {
		          // compute font size based on sqrt(area)
		          return Math.max(20, 0.18*Math.sqrt(d.area))+'px'; })
		      .text(function(d) { return d.children ? null : d.name; });
	}
}