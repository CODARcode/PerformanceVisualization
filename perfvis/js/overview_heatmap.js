// The overview of the traces. It use opacity to show the number of events in a time range.
class HeatMap{
	constructor(main, overview, ypos, traceArray, timeEnd, timeUnit){
        var stageWidth = overview.w - overview.leftMargin;
		var me = this;
        this.leftMargin = overview.leftMargin;
        this.noThreads = traceArray.length;//
        this.main = main;
        this.binNum = 800;

        this.binNum = 800;
        this.binUnit = timeEnd/this.binNum;
        this.traces = [];
        for(var i = 0; i < this.noThreads; i++){
            this.traces.push([]);
            for(var j = 0;j<this.binNum;j++){
                this.traces[i].push(0);
            }
            for(var j = 0; j < traceArray[i][0].length; j++){
                if(j*timeUnit>=timeEnd){
                    break;
                }else{
                    for(var k = 0; k<traceArray[i].length;k++){
                        this.traces[i][j*timeUnit/this.binUnit] += traceArray[i][k][j];
                    }
                }
            }
        }

        this.maxOpacity = 0;
        this.traces.forEach(function(data){
            data.forEach(function(d){
                if(me.maxOpacity < d){
                    me.maxOpacity = d;
                }
            });
        });
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
        this.traces.forEach(function(d,i){
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
                if(me.main.traces.nodeList.includes(id)){
                    d3.select(this).attr("fill", "red");
                }else{
                    d3.select(this).attr("fill", "black");
                }
                me.main.update(false);
            })
            .on('mouseover', function(d){
                d3.select(this).style("cursor", "pointer"); 
            })
            .on('mouseout', function(d){
                d3.select(this).style("cursor", "default"); 
            });
        this.mini.append("g").selectAll("miniItems")
            .data(data)
            .enter().append("rect")
            .attr("x", function(d,i) {
                return me.x(i*me.binUnit);
            })
            .attr("y", me.y2(id))
            .attr("fill", "DimGray ")
            .attr("fill-opacity", function(d){
                return 1*d/me.maxOpacity;
            })
            .attr("width", function(d) {
                return Math.max(me.x(me.binUnit), 1);
            })
            .attr("height", me.bandWidth);

        this.mini.append("g").selectAll("fort")
            .data(me.main.traces.fort)
            .enter().append("path") //only re-enter updated rect!!!
            //.filter(function(d) { return d.end <= me.main.traces.timeStamps.max})
            .attr("d", function(d) {
                var x1 = me.x(d.end);
                var x2 = me.x(d.start);
                var y1 = me.y2(d.nodestart);
                var y2 = me.y2(d.nodestart) + me.y2(1) - me.y2(0);
                var y3 = me.y2(d.nodeend) + me.y2(1) - me.y2(0);
                var y4 = me.y2(d.nodeend);
                return "M"+x1+" "+y1+" L"+x1+" "+y2+" L"+x2+" "+y3+" L"+x2+" "+y4+"Z";
            })
            .attr("fill","snow")
            //.attr("stroke","gray")
            .attr("opacity", "0.1")
            .attr("fill-opacity", "0.2")
            .append("title") //asynch mode may generate different brush extents
            .text(function(d) {
                return "filename: "+d.file;// + ": " + (Math.min(brush.x1, d.end) - Math.max(brush.x0, d.start)).toString();
            });
    }
}