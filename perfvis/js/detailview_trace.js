/**
 * Created by wxu on 2/15/17.
 */
//This visualization uses nested rectangles to show the call paths of the functions.
class TraceVis {
    constructor(main, parentview, ypos) {
        var me = this;
        this.timeBegin = main.traces.timeStamps.start;
        this.timeEnd = main.traces.timeStamps.end;
        this.noThreads = main.traces.noThreads;
        this.main = main;
        this.m = [40, 50, 0, 30]; //top right bottom left (space between main and mini)
        this.detailRange = 1000;
        this.w = parentview.w - parentview.leftMargin;
        this.mainHeight = 1000; //has space between
        this.bandWidth = (this.mainHeight-this.m[0]) / this.noThreads;
        //scales
        this.x1 = d3.scaleLinear()
            .domain([this.timeBegin, this.timeEnd])
            .range([0, this.w]); //main

        var ranges = [];
        for(var i = 0;i<main.traces.nodeList.length;i++){
            ranges.push(me.m[0]+i*me.bandWidth);
        }
        this.y1 = d3.scaleOrdinal()
            .domain(main.traces.nodeList)
            .range(ranges);
        //axis
        this.mainAxis = d3.axisBottom()
            .scale(this.x1)
            .tickFormat(main.tickByTime);
        this.mouseOverPos;

        //chart
        var chart = parentview.chart.append("g")
            .attr("transform", "translate(0," + ypos + ")");

        chart.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", this.w)
            .attr("height", this.mainHeight);

        this.mainCanvas = chart.append("g")
            .attr("transform", "translate("+parentview.leftMargin+",0)")
            .attr("width", this.w)
            .attr("height", this.mainHeight)
            .attr("class", "main");

        //main x axis
        this.mainAxisSvg = this.mainCanvas.append("g")
            .attr("class", "x axis")
            .call(this.mainAxis);


        this.main.traces.threads.forEach(function(thread, i) {
            thread.main_lane_text = me.mainCanvas.append("g")
                .attr("class", "main_lane_text");
            thread.itemRect = me.mainCanvas.append("g")
                .attr("clip-path", "url(#clip)");
            thread.idLabel = me.mainCanvas.append("g")
                .attr("class", "idLabel");
        });

        this.messageLines = this.mainCanvas.append("g")
            .attr("class", "messages");
        this.messageCircles = this.mainCanvas.append("g")
            .attr("class", "messages");
        this.fort = this.mainCanvas.append("g")
            .attr("class", "fort");
    }
    update(){
		var me = this;
        // set scales
        me.x1.domain([me.main.traces.timeStamps.min, me.main.traces.timeStamps.max]);
        //update main x axis
        me.mainAxisSvg.call(me.mainAxis);
        me.bandWidth = (this.mainHeight-this.m[0])/me.main.traces.nodeList.length;
        var ranges = [];
        for(var i = 0;i<me.main.traces.nodeList.length;i++){
            ranges.push(me.m[0]+i*me.bandWidth);
        }
        me.y1.domain(me.main.traces.nodeList).range(ranges);

        this.messageLines.selectAll("line").remove();
        this.messageCircles.selectAll("circle").remove();
    }

    updateMessages() {
        var me = this;
        var brush = me.main.traces.timeStamps;
        // draw messagelines here
        var linkMessages = [];

        var myMap = new Map();

        me.main.traces.messages.forEach(function(d){
            if(d.timestamp>=brush.min&&d.timestamp<=brush.max){
                if(d["event-type"] == "receive"){
                    //if found, pop and push to linkMessages
                    var d0 = myMap.get(d["source-node-id"]+","+d["destination-node-id"]);
                    if(d0 !== undefined){
                        linkMessages.push({source:parseInt(d["source-node-id"]),destination:parseInt(d["destination-node-id"]),start:d0.timestamp,end:d.timestamp});
                    }
                    myMap.set(d["source-node-id"]+","+d["destination-node-id"],undefined);
                } else {
                    myMap.set(d["source-node-id"]+","+d["destination-node-id"],d);
                }
            }
        });
        this.fort.selectAll("path").remove();
        var fortsvg = this.fort.selectAll("path")
            .data(me.main.traces.fort);
        fortsvg.enter().append("path") //only re-enter updated rect!!!
            .filter(function(d) { return d.start >=brush.min&& d.end <= brush.max&&me.main.traces.nodeList.includes(d.nodestart) &&me.main.traces.nodeList.includes(d.nodeend);})
            .attr("d", function(d) {
                var x1 = me.x1(d.end);
                var x2 = me.x1(d.start);
                var y1 = me.y1(d.nodestart);
                var y2 = me.y1(d.nodestart)+this.bandWidth;
                var y3 = me.y1(d.nodeend)+this.bandWidth;
                var y4 = me.y1(d.nodeend);
                return "M"+x1+" "+y1+" L"+x1+" "+y2+" L"+x2+" "+y3+" L"+x2+" "+y4+"Z";
            })
            .attr("fill","white")
            .attr("stroke","gray")
            .attr("opacity", 0.5)
            .append("title") //asynch mode may generate different brush extents
            .text(function(d) {
                return "filename: "+d.file;// + ": " + (Math.min(brush.x1, d.end) - Math.max(brush.x0, d.start)).toString();
            });
        fortsvg.exit().remove();

        var messagecsvg = this.messageCircles.selectAll("circle")
            .data(linkMessages)
            //.filter(function(d) { return me.main.traces.nodeList.includes(d.source)&&me.main.traces.nodeList.includes(d.destination);}); //the data is updated, then list the updated attrs below, otherwise these attr remain unchanged

        messagecsvg.enter().append("circle") //only re-enter updated rect!!!
            .attr("cx", function(d) {
                return me.x1(d.start);
            })
            .attr("cy", function(d) {
                return me.y1(d.source)+me.bandWidth/2;
            })
            .attr("r", 2)
            .attr("fill","gray");

        messagecsvg.enter().append("circle") //only re-enter updated rect!!!
            .attr("cx", function(d) {
                return me.x1(d.end);
            })
            .attr("cy", function(d) {
                return me.y1(d.destination)+me.bandWidth/2;
            })
            .attr("r", 2)
            .attr("fill","gray");

        messagecsvg.exit().remove();

        var messagesvg = this.messageLines.selectAll("line")
            .data(linkMessages)
            //.filter(function(d) { return me.main.traces.nodeList.includes(d.source)&&me.main.traces.nodeList.includes(d.destination);});//the data is updated, then list the updated attrs below, otherwise these attr remain unchanged
        messagesvg.enter().append("line") //only re-enter updated rect!!!
            .attr("x1", function(d) {
                return me.x1(d.start);
            })
            .attr("y1", function(d) {
                return me.y1(d.source)+me.bandWidth/2;
            })
            .attr("x2", function(d) {
                return me.x1(d.end);
            })
            .attr("y2", function(d) {
                return me.y1(d.destination)+me.bandWidth/2;
            })
            .attr("stroke","white")
            .attr("stroke-width", "2px");
        messagesvg.enter().append("line") //only re-enter updated rect!!!
            .attr("x1", function(d) {
                return me.x1(d.start);
            })
            .attr("y1", function(d) {
                return me.y1(d.source)+me.bandWidth/2;
            })
            .attr("x2", function(d) {
                return me.x1(d.end);
            })
            .attr("y2", function(d) {
                return me.y1(d.destination)+me.bandWidth/2;
            })
            .attr("stroke","gray")
            .attr("stroke-opacity",0.5)
            .attr("stroke-width", "1px");
        messagesvg.exit().remove();
    }

    updateSummary(thread){
        var me = this;
        var rects = thread.itemRect.selectAll("rect") //asynchronized mode!!!
            .data(thread.filteredSummary); //the data is updated, then list the updated attrs below, otherwise these attr remain unchanged            

        var timeUnit = me.main.timeUnit;
        rects.enter().append("rect") //only re-enter updated rect!!!
            .attr("class", function(d) {
                return "mainItem" + d.location;
            })
            .attr("x", function(d) {
                return me.x1(d.time);
            })
            .attr("y", function(d) {
                return me.y1(thread.location) + me.bandWidth*(d.start)/thread.maxLen;
            })
            .attr("width", function(d) {
                return me.x1(d.time+timeUnit) - me.x1(d.time);
            })
            .attr("height", function(d) {
                var thisHeight = me.bandWidth*(d.end-d.start)/thread.maxLen;
                if(thisHeight<1) thisHeight = 1;
                return thisHeight;
            })
            .attr("fill", function(d) {
                return me.main.getColor(d.region);
            })
            .attr("stroke","black")
            .attr("stroke-width", 0)
            .attr("opacity", function(d){
                return (d.region.length+110)/(120+d.region.length);
            })
            .on("mouseover", function(d) {
                me.mouseOverPos = d;
            })
            .append("title") //asynch mode may generate different brush extents
            .text(function(d) {
                return me.main.traces[d.region];// + ": " + (Math.min(brush.x1, d.end) - Math.max(brush.x0, d.start)).toString();
            });

        rects.exit().remove();
    }
    updateDetails(thread){
        var me = this;
        var rects = thread.itemRect.selectAll("rect") //asynchronized mode!!!
            .data(thread.visItems); //the data is updated, then list the updated attrs below, otherwise these attr remain unchanged
        //console.log(thread.max_level);
        //console.log(thread.min_level);
        //console.log(thread.location);

        rects.enter().append("rect") //only re-enter updated rect!!!
            .attr("class", function(d) {
                return "mainItem" + d.location;
            })
            .attr("x", function(d) {
                if(me.x1(d.start)==0&&(me.bandWidth-4) * (thread.max_level+1 - d.level)/(thread.max_level+1 - thread.min_level)<4){
                    console.log(d);   
                }
                return me.x1(d.start);
            })
            .attr("y", function(d) {
                var thisHeight = (me.bandWidth-4) * (thread.max_level+1 - d.level)/(thread.max_level+1 - thread.min_level);
                if(thisHeight<1) thisHeight = 1;
                return me.y1(thread.location) + me.bandWidth/2 -thisHeight/2;
            })
            .attr("width", function(d) {
                return Math.max(me.x1(d.end) - me.x1(d.start), 1);
            })
            .attr("height", function(d) {
                var thisHeight = (me.bandWidth-4) * (thread.max_level+1 - d.level)/(thread.max_level+1 - thread.min_level);
                if(thisHeight<1){
                    thisHeight = 1;
                }
                return thisHeight;// / locSets.length;
            })
            .attr("fill", function(d) {
                return me.main.getColor(d.region);
            })
            .attr("stroke","gray")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", "0.05px")
            .on("mouseover", function(d) {
                me.mouseOverPos = d;
            })
            .append("title") //asynch mode may generate different brush extents
            .text(function(d) {
                return d.name;// + ": " + (Math.min(brush.x1, d.end) - Math.max(brush.x0, d.start)).toString();
            });

        rects.exit().remove();
    }

    updateThread(thread, detail) {
		var me = this;
		var locSets = thread.locSets;
        var idLebals = thread.idLabel.selectAll("text").data([0]);
        idLebals.enter().append("text")
            .text(thread.location)
            .attr("x",-20)
            .attr("y", function(){
                return me.y1(thread.location)+me.bandWidth/2;
            })
            .attr("font-size", "12px")
            .attr("font-family", "sans-serif")
            .on('click', function(d){
                me.main.stackedBars.setIndex(thread.location);
                /*if(me.main.stackedBars.nodeIndex == thread.location){
                    d3.select(this).attr("fill", "red");
                }else{
                    d3.select(this).attr("fill", "black");
                }*/
            })
            .on('mouseover', function(d){
                d3.select(this).style("cursor", "pointer"); 
            })
            .on('mouseout', function(d){
                d3.select(this).style("cursor", "default"); 
            });
        if(detail){
            me.updateDetails(thread);
        }else{
            me.updateSummary(thread);
        }

        //update main lane text
        // clean up previous plotting
        //thread.main_lane_text.selectAll("text").remove();
        //thread.main_lane_text.selectAll("line").remove();

        // does not include location index i
        if (locSets.length > 0) {
            // plot lane text
            thread.main_lane_text.append("text")
                .text(function() {
                    return thread.location;
                })
                .attr("x", -me.m[1])
                .attr("y", function() {
                    return me.y1(thread.location);
                })
                .attr("dy", ".5ex")
                .attr("text-anchor", "end")
                .attr("class", "laneText");

            // plot lane line
            thread.main_lane_text.append("line")
                .attr("x1", 0)
                .attr("y1", function() {
                    return me.y1(thread.location);
                })
                .attr("x2", me.w)
                .attr("y2", function() {
                    return me.y1(thread.location);
                })
                .attr("stroke", "lightgray");
        }
    }
}