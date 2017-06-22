class HeatMap{
	constructor(stage, main, overview, xstart, stageWidth){
		var me = this;
        var threads = stage.threads;
        this.noThreads = stage.threads.length;//
        var timeBegin = stage.timeStamps.start;
        var timeEnd = stage.timeStamps.end;

        this.timeBegin = stage.timeStamps.start;
        this.timeEnd = stage.timeStamps.end;
        this.stage= stage;
        this.xstart = xstart;
        this.main = main;

        this.bandWidth = overview.h/threads.length - 5;
        this.miniHeight = this.noThreads * 20 + 20; // 20 is for the height of axis
        this.mainHeight = overview.h - this.miniHeight +10; //has space between
        //scales
        this.x = d3.scale.linear()
            .domain([timeBegin, timeEnd])
            .range([xstart, xstart+stageWidth]); //brush, and mini
        this.y2 = d3.scale.linear()
            .domain([0, this.noThreads])
            .range([0, overview.h]); //mini
        //axis
        this.miniAxis = d3.svg.axis()
            .scale(this.x)
            .orient("top");
        //color
        this.c20 = d3.scale.category20().domain(main.traces.regions);

        this.mini = overview.chart.append("g")
            .attr("transform", "translate(0," + this.mainHeight +")")
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
            .attr("fill-opacity", .2)
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