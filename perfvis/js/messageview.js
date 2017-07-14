// the histogram for the messages
class MessageVis {
	constructor(main, parentview){
		this.main = main;

        var thisWidth = parentview.w - parentview.leftMargin;
		var me = this;
        this.noThreads = main.traces.threads.length;//
        var timeBegin = main.traces.timeStamps.start;
        var timeEnd = main.traces.timeStamps.end;
        this.main = main;

        this.max = 0.1;
        this.canvasHeight = 60; // 20 is for the height of axis
        //scales
        this.x = d3.scale.linear()
            .domain([timeBegin, timeEnd])
            .range([0, thisWidth]); //brush, and mini

        this.y = d3.scale.linear()
            .domain([0, this.max])
            .range([this.canvasHeight, 0]); //brush, and mini

        this.axis = d3.svg.axis()
            .scale(this.y)
            .orient("left").ticks(3);

        this.g = parentview.chart.append("g")
            .attr("transform", "translate("+parentview.leftMargin+",0)")
            .attr("width", thisWidth)
            .attr("height", this.canvasHeight)
            .attr("class", "histo");

        this.axissvg = this.g.append("g")
            .attr("class", "y axis")
            .call(this.axis);

        this.data = [];
        for(var i = 0;i<100;i++){
        	this.data.push({});
        }
	}

	init(){
		//data
		var me = this;
		me.filterData({x0:me.main.traces.timeStamps.start,x1:me.main.traces.timeStamps.end});
		me.draw();
	}
	
	filterData(brush){
		var me = this;
		//console.log(brush);
        for(var i = 0;i<100;i++){
        	this.data[i] = {time:Math.floor((brush.x1-brush.x0)*i/100)+brush.x0,amount:0};
        }
        this.max = 0.1;
        me.main.traces.messages.forEach(function(d){
        	if(d.timestamp>=brush.x0&&d.timestamp<=brush.x1){
        		var index = Math.floor(100*(d.timestamp - brush.x0)/ (brush.x1-brush.x0+0.01));
        		//console.log(d);
        		me.data[index].amount++;
        		if(me.data[index].amount>me.max){
        			me.max = me.data[index].amount;
        		}
        	}
        });
        me.y.domain([0,me.max]);
        me.axissvg.call(me.axis);

	}

	draw(){
		var me = this;
		me.g.selectAll("rect").remove();
		var rects = me.g.selectAll("rect").data(me.data);

        rects.enter().append("rect")
            .attr("x", function(d) {
                return me.x(d.time);
            })
            .attr("y", function(d) {
                return me.canvasHeight - me.canvasHeight*d.amount/me.max;
            })
            .attr("width", function(d) {
                return 10;
            })
            .attr("height", function(d) {
                return me.canvasHeight*d.amount/me.max;// / locSets.length;
            })
            .attr("fill", "gray")
            .append("title") //asynch mode may generate different brush extents
            .text(function(d) {
                return d.amount;// + ": " + (Math.min(brush.x1, d.end) - Math.max(brush.x0, d.start)).toString();
            });

        rects.exit().remove();
	}

	update(brush){
		//filter data
		var me = this;
		me.x.domain([brush.x0, brush.x1]);
		me.filterData(brush)
		me.draw();
	}
}