// the histogram for the messages
class Histogram {
	constructor(main, parentview, messageArray, timeMax){

        var thisWidth = parentview.w - parentview.leftMargin;
		var me = this;
        var timeBegin = 0;
        this.timeEnd = timeMax;
        this.main = main;
        this.canvasHeight = 60; // 20 is for the height of axis
        //scales
        this.thisWidth = thisWidth;

        this.x = d3.scaleLinear()
            .domain([timeBegin, this.timeEnd])
            .range([0, thisWidth]); //brush, and mini

        this.y = d3.scaleLinear()
            .domain([0, 1])
            .range([this.canvasHeight, 0]); //brush, and mini

        this.axis = d3.axisLeft()
            .scale(this.y).ticks(3);

        this.g = parentview.chart.append("g")
            .attr("transform", "translate("+parentview.leftMargin+",0)")
            .attr("width", thisWidth)
            .attr("height", this.canvasHeight)
            .attr("class", "histo");

        this.axissvg = this.g.append("g")
            .attr("class", "y axis")
            .call(this.axis);

        this.messageArray = messageArray;
	}

	init(){
		//data
		var me = this;
        var maxHeight = 0;

        this.messageArray.forEach(function(d){
            if(maxHeight < d["count"]/(d["_id"]["max"] - d["_id"]["min"])){
                maxHeight = d["count"]/(d["_id"]["max"] - d["_id"]["min"]);
            }
        });
        me.y.domain([0,maxHeight]);
        me.axissvg.call(me.axis);

		me.g.selectAll("rect").remove();
		var rects = me.g.selectAll("rect").data(me.messageArray);

        rects.enter().append("rect")
            .attr("x", function(d) {
                return me.x(d["_id"]["min"]);
            })
            .attr("y", function(d) {
                return me.y(d["count"]/(d["_id"]["max"] - d["_id"]["min"]));
            })
            .attr("width", function(d) {
                return me.x((d["_id"]["max"] - d["_id"]["min"]));
            })
            .attr("height", function(d) {
                return me.canvasHeight - me.y(d["count"]/(d["_id"]["max"] - d["_id"]["min"]));// / locSets.length;
            })
            .attr("fill", "gray")
            .append("title") //asynch mode may generate different brush extents
            .text(function(d) {
                return d["count"];// + ": " + (Math.min(brush.x1, d.end) - Math.max(brush.x0, d.start)).toString();
            });

        rects.exit().remove();
        this.initBrush();
	}

    initBrush(){
        //brush
        var me = this;

        this.brush = d3.brushX()
            .extent([[0, 0], [me.thisWidth, me.canvasHeight]])
            //.on("start brush", brushmoved)
            .on("end", brushmoved);

        this.g.append("g")
            .attr("class", "x brush")
            .call(this.brush);

        function brushmoved() {
            var s = d3.event.selection;
            if (s != null) {
                me.main.traces.timeStamps.min = me.x.invert(s[0]);
                me.main.traces.timeStamps.max = me.x.invert(s[1]);
                me.main.set();
            }
        }
    }
}