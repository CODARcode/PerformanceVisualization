//Statistic view shows the summarized execution time of the functions in the selected time range
class StatisticsVis{
	constructor(main){
        var me = this;
        this.timeBegin = main.traces.timeBegin;
        this.timeEnd = main.traces.timeEnd;
        this.noThreads = main.traces.noThreads;
        // chart for metedata

        this.main = main;
        var bb = document.querySelector('#Statistics')
                    .getBoundingClientRect();
        var mwidth = bb.right - bb.left;
        var mheight = 1000;
        this.mm = [20, 20, 5, 15, 120]; //top right bottom left (space for label texts)
        this.metaw = mwidth - this.mm[1] - this.mm[3];
        this.metah = mheight - this.mm[0] - this.mm[2];
        this.bandWidth = this.metah / this.noThreads;
        //scale
        this.metax = d3.scaleLinear()
            .domain([0, this.timeEnd - this.timeBegin])
            .range([0, this.metaw- this.mm[4]]); //metamain, leave space for text

        var ranges = [];
        for(var i = 0;i<main.traces.nodeList.length;i++){
            ranges.push(me.mm[0]+i*me.bandWidth);
        }
        this.y1 = d3.scaleOrdinal()
            .domain(main.traces.nodeList)
            .range(ranges);        //axis
        this.metaAxis = d3.axisTop()
            .scale(this.metax)
            .tickFormat(main.tickByTime);

        this.mouseOverPos;

        var metachart = d3.select("#Statistics")
            .append("svg")
            .attr("width", this.metaw)
            .attr("height", this.metah)
            .attr("class", "chart");

        this.metabar = metachart.append("g")
            .attr("transform", "translate(" + this.mm[3] + "," + this.mm[0] + ")")
            .attr("width", this.metaw)
            .attr("height", this.metah)
            .attr("class", "main");

        //meta x axis
        this.metaAxisSvg = this.metabar.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + this.mm[4] + "," + 0 + ")")
            .call(this.metaAxis);
	}
	init(thread){
        thread.barRect = this.metabar.append("g").attr("clip-path", "url(#clip)");
	}
	
	update(brush){
		var me = this;
        // set scales
        //me.y1.domain([~~brush.y0, Math.min(~~brush.y1 + 1, me.noThreads)]);
        me.metax.domain([0, brush.x1 - brush.x0]);
        //update main x axis
        me.metaAxisSvg.call(me.metaAxis);        
        var ranges = [];
        for(var i = 0;i<brush.nodes.length;i++){
            ranges.push(me.mm[0]+(i+1)*me.bandWidth);
        }
        me.y1.domain(brush.nodes).range(ranges);
        //me.localLocLength = ~~brush.y1 - ~~brush.y0 + 1; //~~ means floor()
	}
	updateThread(thread){
		var me = this;
		var locSets = thread.locSets;
		var locMaps = thread.locMaps;
        //------- plot bars -----------
        var bars = thread.barRect.selectAll("rect")
            .data(locSets);

        bars.enter().append("rect")
            .attr("x", me.mm[4])
            .attr("y", function(d) {
                return me.y1(thread.location) + locSets.indexOf(d) * (me.bandWidth-2) / locSets.length;
            })
            .attr("width", function(d) {
                return Math.max(me.metax(locMaps.get(d)), 1);
            })
            .attr("height", function(d) {
                return (me.bandWidth-2) / locSets.length;
            })
            .attr("fill", function(d) {
                return me.main.getColor(d);
            })
            .on("mouseover", function(d) {
                me.mouseOverPos = d;
            }).append("title")
            .text(function(d) {
                var spstr = d.split("=>").slice(-1)[0];
                return spstr + ": " + locMaps.get(d);
            });

        bars.exit().remove()
        //------------------------------

        //------- plot labels ----------
        var labels = thread.barRect.selectAll("text")
            .data(locSets);

        labels.enter().append("text")
            .text(function(d,i) {
                var sh = (me.bandWidth-2) / locSets.length;
                var skip = (8>sh)?Math.ceil(8/sh):0;

                if(skip==0||i%skip==0){
                    var spstr = d.split("=>").slice(-1)[0];
                    return spstr;
                }else{
                    return "";
                }
            })
            .attr("x", me.mm[4] - 2)
            .attr("y", function(d) {
                var sh = (me.bandWidth-2) / locSets.length;
                return me.y1(thread.location) + 10 + (locSets.indexOf(d) + 0.5) * sh;
            }) //for text alignment
            .attr("dy", ".5ex")
            .attr("text-anchor", "end")
            .style("font-size", function(d) {
                var sh = (me.bandWidth-2) / locSets.length;
                sh = Math.max(Math.min(~~sh, 13), 8);
                return sh.toString() + "px";
            });

        labels.exit().remove();
	}
}