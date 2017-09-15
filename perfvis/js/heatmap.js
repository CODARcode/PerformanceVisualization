// The overview of the traces. It use opacity to show the number of events in a time range.
class HeatMap{
	constructor(main, overview, ypos){
        var stageWidth = overview.w - overview.leftMargin;
		var me = this;
        this.leftMargin = overview.leftMargin;
        this.noThreads = traceArray.length;//
        var timeBegin = 0;
        var timeEnd = 6308000;
        this.main = main;

        this.bandWidth = (overview.h-ypos)/this.noThreads - 5;
        this.miniHeight = this.noThreads * this.bandWidth + 20; // 20 is for the height of axis
        //scales
        this.x = d3.scale.linear()
            .domain([timeBegin, timeEnd])
            .range([0, stageWidth]); //brush, and mini
        this.y2 = d3.scale.linear()
            .domain([0, this.noThreads])
            .range([20, overview.h-ypos+20]); //mini
        //axis
        this.miniAxis = d3.svg.axis()
            .scale(this.x)
            .orient("bottom")
            .tickFormat(main.tickByTime);

        this.mini = overview.chart.append("g")
            .attr("transform", "translate("+overview.leftMargin+"," + ypos +")")
            .attr("width", stageWidth)
            .attr("height", this.miniHeight)
            .attr("class", "mini");

        //mini x axis
        this.mini.append("g")
            .attr("class", "x axis")
            .call(this.miniAxis);


	}

    init(data, id) {
        var me = this;
        this.mini.append("text")
            .attr("x",-me.leftMargin)
            .attr("y",me.y2(id)+15)
            .text("node-id: "+id)
            .attr("font-size", "16px") 
            .attr("font-family", "sans-serif");
        this.mini.append("g").selectAll("miniItems")
            .data(data)
            .enter().append("rect")
            .attr("x", function(d,i) {
                return me.x(i*10000);
            })
            .attr("y", me.y2(id)) //4 means to leave a little distance
            .attr("fill", "gray")
            .attr("fill-opacity", function(d){
                return d/100;
            })
            .attr("width", function(d, i) {
                return Math.max((me.x((i+1)*10000) - me.x(i*10000)), 1);
            })
            .attr("height", me.bandWidth);

        this.mini.append("g").selectAll("fort")
            .data(fort)
            .enter().append("path") //only re-enter updated rect!!!
            .filter(function(d) { return d.end <= me.main.traces.timeStamps.max})
            .attr("d", function(d) {
                var x1 = me.x(d.end);
                var x2 = me.x(d.start);
                var y1 = me.y2(0);
                var y2 = me.y2(0) + me.y2(1)-25;
                var y3 = me.y2(4) + me.y2(1)-25;
                var y4 = me.y2(4);
                return "M"+x1+" "+y1+" L"+x1+" "+y2+" L"+x2+" "+y3+" L"+x2+" "+y4+"Z";
            })
            .attr("fill","white")
            .attr("stroke","gray")
            .attr("opacity", 0.2)
            .append("title") //asynch mode may generate different brush extents
            .text(function(d) {
                return "filename: "+d.file;// + ": " + (Math.min(brush.x1, d.end) - Math.max(brush.x0, d.start)).toString();
            });
    }

    initBrush(){
        //brush
        var me = this;
        this.brush = d3.svg.brush()
            .x(this.x)
            .y(this.y2)
            .on("brushend", function() {
                var extent = me.brush.extent();
                me.main.update(extent);
            });

        this.mini.append("g")
            .attr("class", "x brush")
            .call(this.brush);
	}
}