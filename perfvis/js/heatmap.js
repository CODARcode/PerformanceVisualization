// The overview of the traces. It use opacity to show the number of events in a time range.
class HeatMap{
	constructor(main, overview, ypos){
        var stageWidth = overview.w - overview.leftMargin;
		var me = this;
        this.leftMargin = overview.leftMargin;
        this.noThreads = main.traces.threads.length;//
        var timeBegin = main.traces.timeStamps.start;
        var timeEnd = main.traces.timeStamps.end;
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
            .orient("bottom");

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

    init(thread) {
        var me = this;
        this.mini.append("text")
            .attr("x",-me.leftMargin)
            .attr("y",me.y2(thread.location)+15)
            .text("node-id: "+thread.location)
            .attr("font-size", "16px") 
            .attr("font-family", "sans-serif");
        this.mini.append("g").selectAll("miniItems")
            .data(thread.traces)
            .enter().append("rect")
            .attr("x", function(d) {
                if(me.x(d.start)<0){
                    console.log(d.start)
                }
                return me.x(d.start);
            })
            .attr("y", function(d) {
                return me.y2(thread.location);
            }) //4 means to leave a little distance
            .attr("fill", "gray")
            .attr("fill-opacity", .1)
            .attr("width", function(d) {
                return Math.max((me.x(d.end) - me.x(d.start)), 1);
            })
            .attr("height", me.bandWidth);

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