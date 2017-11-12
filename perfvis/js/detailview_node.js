class StackedBars{
	constructor(main){
		this.main = main;
		var me = this;
		this.nodeIndex = -1;
		this.brush = {};
        this.timeBegin = main.traces.timeStamps.start;
        this.timeEnd = main.traces.timeStamps.end;

        this.m = [30, 170, 10, 50, 0]; //top right bottom left (space between main and mini)
        var bb = document.querySelector('#StackedBars')
                    .getBoundingClientRect();
       	this.w = bb.right - bb.left - this.m[1] - this.m[3];
        this.h = 300 - this.m[0] - this.m[2];
        //chart

        this.chart = d3.select("#StackedBars")
            .append("svg")
            .attr("width", this.w + this.m[1] + this.m[3])
            .attr("height", this.h + this.m[0] + this.m[2])
            .attr("class", "chart")
            .append("g")
            .attr("transform", "translate(" + this.m[3] + "," + this.m[0] + ")")
            .attr("width", this.w)
            .attr("height", this.h)
            .attr("class", "main");

        this.x = d3.scaleLinear()
            .domain([this.timeBegin, this.timeEnd])
            .range([0, this.w]); //brush, and mini
        this.mainAxis = d3.axisTop()
            .scale(this.x)
            .tickFormat(main.tickByTime);

        this.mainAxisSvg = this.chart.append("g")
            .attr("class", "x axis")
            .call(this.mainAxis);

        this.main.traces.threads.forEach(function(thread) {
            thread.nodeText = me.chart.append("g")
                .attr("class", "node_text");
            thread.nodeRect = me.chart.append("g")
                .attr("clip-path", "url(#clip)");
            thread.nodeLabel = me.chart.append("g")
                .attr("class", "node_label");
        });

	}

	setIndex(index){
        this.main.traces.threads.forEach(function(thread) {
			thread.nodeRect.selectAll("rect").remove();
			thread.nodeText.selectAll("text").remove();
			thread.nodeLabel.selectAll("text").remove();
		});
		this.nodeIndex = index;
		this.update();
	}

	update(){
		var me = this;
        // set scales
        var brush = me.main.traces.timeStamps;
        me.x.domain([brush.min, brush.max]);
        //update main x axis
        me.mainAxisSvg.call(me.mainAxis);
        if(me.nodeIndex!=-1){

        	me.updateThread(me.main.traces.threads[me.nodeIndex]);	
        }

	}

    updateThread(thread) {
		var me = this;
		var locSets = thread.locSets;

        thread.nodeLabel
            .append("text")
                .text(thread.location)
                .attr("x",-20)
                .attr("y", function(){
                    return me.h/2;
                })
                .attr("font-size", "16px")
                .attr("font-family", "sans-serif");
        var min_level = -100;

        var brush = me.main.traces.timeStamps;
        var rects = thread.nodeRect.selectAll("rect") //asynchronized mode!!!
            .data(thread.visItems);//the data is updated, then list the updated attrs below, otherwise these attr remain unchanged

        rects.enter().append("rect") //only re-enter updated rect!!!
            .attr("x", function(d) {
                return me.x(d.start);
            })
            .attr("y", function(d) {
                return (d.level-thread.min_level) * 10;
            })
            .attr("width", function(d) {
                return Math.max(me.x(d.end) - me.x(d.start), 1);
            })
            .attr("height", function(d) {
                return 10;// / locSets.length;
            })
            .attr("fill", function(d) {
                return me.main.getColor(d.region);
            })
            .attr("stroke","black")
            .attr("stroke-width", "0.5px")
            .attr("opacity", function(d){
                return (d.region.length+110)/(120+d.region.length);
            })
            .on("mouseover", function(d) {
                me.mouseOverPos = d;
            })
            .append("title") //asynch mode may generate different brush extents
            .text(function(d) {
                return d.region;// + ": " + (Math.min(brush.x1, d.end) - Math.max(brush.x0, d.start)).toString();
            });

        rects.exit().remove();

        //update main lane text
        // clean up previous plotting
        //thread.nodeText.selectAll("text").remove();
        //thread.nodeText.selectAll("line").remove();

        // does not include location index i
        if (locSets.length > 0) {
            // plot lane text
            thread.nodeText.append("text")
                .text(function() {
                    return thread.location;
                })
                .attr("x", -me.m[1])
                .attr("y", function() {
                    return me.h/2;
                })
                .attr("dy", ".5ex")
                .attr("text-anchor", "end")
                .attr("class", "laneText");
        }
    }
}