// the histogram for the messages
class Histogram {
	constructor(main, parentview, messageArray, timeMax, timeUnit){

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

        this.binNum = 800;
        this.binUnit = timeMax/this.binNum;
        this.messages = [];

        for(var i = 0; i<this.binNum; i++){
            this.messages.push(0);
        }
        for(var i = 0; i < messageArray.length; i++){
            if(i*timeUnit>=timeMax){
                break;
            }else{
                this.messages[i*timeUnit/this.binUnit] += messageArray[i];
            }
        }
	}

	init(){
		//data
		var me = this;
        var maxHeight = 0;

        this.messages.forEach(function(d){
            if(maxHeight < d){
                maxHeight = d;
            }
        });
        me.y.domain([0,maxHeight]);
        me.axissvg.call(me.axis);

		me.g.selectAll("rect").remove();
		var rects = me.g.selectAll("rect").data(me.messages);

        rects.enter().append("rect")
            .attr("x", function(d,i) {
                return me.x(i*me.binUnit);
            })
            .attr("y", function(d) {
                return me.canvasHeight - me.y(d);
            })
            .attr("width", me.x(me.binUnit))
            .attr("height", function(d) {
                return me.y(d);// / locSets.length;
            })
            .attr("fill", "gray")
            .append("title") //asynch mode may generate different brush extents
            .text(function(d) {
                return d;// + ": " + (Math.min(brush.x1, d.end) - Math.max(brush.x0, d.start)).toString();
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
                me.main.updateBrush({x0:me.x.invert(s[0]),x1:me.x.invert(s[1]),nodes:[]});
            }
        }
    }
}