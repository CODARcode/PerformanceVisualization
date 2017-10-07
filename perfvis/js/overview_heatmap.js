// The overview of the traces. It use opacity to show the number of events in a time range.
class HeatMap{
	constructor(main, overview, ypos, traceArray, timeEnd){
        var stageWidth = overview.w - overview.leftMargin;
		var me = this;
        this.leftMargin = overview.leftMargin;
        this.noThreads = traceArray.length;//
        this.main = main;
        this.traceArray = traceArray;

        this.bandWidth = (overview.h-ypos)/this.noThreads - 1;
        this.miniHeight = this.noThreads * this.bandWidth + 20; // 20 is for the height of axis
        //scales
        this.x = d3.scaleLinear()
            .domain([0, timeEnd])
            .range([0, stageWidth]); //brush, and mini
        this.y2 = d3.scaleLinear()
            .domain([0, this.noThreads])
            .range([20, overview.h-ypos+20]); //mini
        //axis
        this.miniAxis = d3.axisBottom()
            .scale(this.x)
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
    init(){
        var me = this;
        this.traceArray.forEach(function(d,i){
            me.initNode(d,i);
        });
    }

    initNode(data, id) {
        var me = this;
        this.mini.append("text")
            .attr("x",-me.leftMargin)
            .attr("y",me.y2(id))
            .text(id)
            .attr("font-size", "12px") 
            .attr("font-family", "sans-serif")
            .attr("alignment-baseline", "hanging")
            .on('click', function(d){
                me.main.traces.updateSelectedNodes(id);
                me.main.update({x0:0,x1:0,nodes:[]});
            });
        this.mini.append("g").selectAll("miniItems")
            .data(data)
            .enter().append("rect")
            .attr("x", function(d) {
                return me.x(d["_id"]["min"]);
            })
            .attr("y", me.y2(id))
            .attr("fill", "gray")
            .attr("fill-opacity", function(d){
                return 10*d["count"]/(d["_id"]["max"] - d["_id"]["min"]);
            })
            .attr("width", function(d) {
                return Math.max(me.x(d["_id"]["max"] - d["_id"]["min"]), 1);
            })
            .attr("height", me.bandWidth);

        this.mini.append("g").selectAll("fort")
            .data(fort)
            .enter().append("path") //only re-enter updated rect!!!
            //.filter(function(d) { return d.end <= me.main.traces.timeStamps.max})
            .attr("d", function(d) {
                var x1 = me.x(d.end);
                var x2 = me.x(d.start);
                var y1 = me.y2(d.nodestart);
                var y2 = me.y2(d.nodestart) + me.y2(1)-25;
                var y3 = me.y2(d.nodeend) + me.y2(1)-25;
                var y4 = me.y2(d.nodeend);
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
}