class StatisticsVis{
	constructor(main){
		
        var me = this;
        this.timeBegin = main.traces.timeBegin;
        this.timeEnd = main.traces.timeEnd;
        this.noThreads = main.traces.threads.length;
        // chart for metedata

        var bb = document.querySelector('#Statistics')
                    .getBoundingClientRect();
        var mwidth = bb.right - bb.left;
        var mheight = 450;
        this.mm = [20, 20, 5, 15, 80]; //top right bottom left (space for label texts)
        this.metaw = mwidth - this.mm[1] - this.mm[3];
        this.metah = mheight - this.mm[0] - this.mm[2];
        this.metaHeight = this.metah - this.mm[4];

        this.c20 = d3.scale.category20().domain(main.traces.regions);
        //scale
        this.y1 = d3.scale.linear()
            .domain([0, this.noThreads])
            .range([0, this.metah]); //main
        this.metax = d3.scale.linear()
            .domain([0, this.timeEnd - this.timeBegin])
            .range([0, this.metaw - this.mm[4]]); //metamain, leave space for text

        //axis
        this.metaAxis = d3.svg.axis()
            .scale(this.metax)
            .orient("top");

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
        me.y1.domain([~~brush.y0, Math.min(~~brush.y1 + 1, me.noThreads)]);
        me.metax.domain([0, brush.x1 - brush.x0]);
        //update main x axis
        me.metaAxisSvg.call(me.metaAxis);
        me.localLocLength = ~~brush.y1 - ~~brush.y0 + 1; //~~ means floor()
	}
	updateThread(thread){
		var me = this;
		var locSets = thread.locSets;
		var locMaps = thread.locMaps;
        //------- plot bars -----------
        var bars = thread.barRect.selectAll("rect")
            .data(locSets)
            .attr("x", me.mm[4])
            .attr("y", function(d) {
                return me.y1(i) + 10 + locSets.indexOf(d) * me.metaHeight * .8 / me.localLocLength / locSets.length;
            })
            .attr("width", function(d) {
                return Math.max(metax(locMaps.get(d)), 1);
            })
            .attr("height", function(d) {
                return metaHeight * .8 / me.localLocLength / locSets.length;
            })
            .attr("fill", function(d) {
                return me.c20(d);
            });

        bars.enter().append("rect")
            .attr("x", me.mm[4])
            .attr("y", function(d) {
				//console.log(me.y1(thread.location));
                return me.y1(thread.location) + 10 + locSets.indexOf(d) * me.metaHeight * .8 / me.localLocLength / locSets.length;
            })
            .attr("width", function(d) {
                return Math.max(me.metax(locMaps.get(d)), 1);
            })
            .attr("height", function(d) {
                return me.metaHeight * .8 / me.localLocLength / locSets.length;
            })
            .attr("fill", function(d) {
                return me.c20(d);
            })
            .on("mouseover", function(d) {
                me.mouseOverPos = d;
            }).append("title")
            .text(function(d) {
                return d + ": " + locMaps.get(d);
            });

        bars.exit().remove()
        //------------------------------

        //------- plot labels ----------
        var labels = thread.barRect.selectAll("text")
            .data(locSets)
            .attr("x", me.mm[4] - 2)
            .attr("y", function(d) {
                var sh = me.metaHeight * .8 / me.localLocLength / locSets.length;
                return me.y1(i) + 10 + (locSets.indexOf(d) + 0.5) * sh;
            }) //for text alignment
            .style("font-size", function(d) {
                var sh = me.metaHeight * .8 / me.localLocLength / locSets.length;
                sh = Math.max(Math.min(~~sh, 13), 8); //floor
                return sh.toString() + "px";
            });

        labels.enter().append("text")
            .text(function(d) {
                return d;
            })
            .attr("x", me.mm[4] - 2)
            .attr("y", function(d) {
                var sh = me.metaHeight * .8 / me.localLocLength / locSets.length;
                return me.y1(thread.location) + 10 + (locSets.indexOf(d) + 0.5) * sh;
            }) //for text alignment
            .attr("dy", ".5ex")
            .attr("text-anchor", "end")
            .style("font-size", function(d) {
                var sh = me.metaHeight * .8 / me.localLocLength / locSets.length;
                sh = Math.max(Math.min(~~sh, 13), 8);
                return sh.toString() + "px";
            });

        labels.exit().remove();
	}
}