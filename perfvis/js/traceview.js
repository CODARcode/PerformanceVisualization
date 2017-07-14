/**
 * Created by wxu on 2/15/17.
 */
//This visualization uses nested rectangles to show the call paths of the functions.
class TraceVis {
    constructor(main, parentview, ypos) {
        var me = this;
        this.timeBegin = main.traces.timeStamps.start;
        this.timeEnd = main.traces.timeStamps.end;
        this.noThreads = main.traces.threads.length;

        this.main = main;
        this.m = [20, 50, 0, 30]; //top right bottom left (space between main and mini)

        this.w = parentview.w - parentview.leftMargin;
        this.mainHeight = 500; //has space between
        //scales
        this.x = d3.scale.linear()
            .domain([this.timeBegin, this.timeEnd])
            .range([0, this.w]); //brush, and mini
        this.x1 = d3.scale.linear()
            .domain([this.timeBegin, this.timeEnd])
            .range([0, this.w]); //main
        this.y1 = d3.scale.linear()
            .domain([0, this.noThreads])
            .range([20, this.mainHeight+20]); //main
        this.y2 = d3.scale.linear()
            .domain([0, this.noThreads])
            .range([20, this.miniHeight+20]); //mini
        //axis
        this.mainAxis = d3.svg.axis()
            .scale(this.x1)
            .orient("bottom")
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


        //brush
        this.brush = d3.svg.brush()
            .x(this.x1)
            .y(this.y1)
            .on("brush", function() {
                me.mousebrush.style("visibility","visible");
            })
            .on("brushend", function() {
                var extent = me.brush.extent();
                me.main.update(extent);
                me.mousebrush.style("visibility","hidden");
            });
        this.mousebrush =  this.mainCanvas.append("g")
            .attr("class", "x brush")
            .call(this.brush);


        this.main.traces.threads.forEach(function(thread) {
        thread.main_lane_text = me.mainCanvas.append("g")
            .attr("class", "main_lane_text");
        thread.itemRect = me.mainCanvas.append("g")
            .attr("clip-path", "url(#clip)");
        });
        this.messageLines = this.mainCanvas.append("g")
            .attr("class", "messages");

        this.messageCircles = this.mainCanvas.append("g")
            .attr("class", "messages");
    }
    update(brush){
		var me = this;
        // set scales
        me.x1.domain([brush.x0, brush.x1]);
        me.y1.domain([~~brush.y0, Math.min(~~brush.y1 + 1, me.noThreads)]);
        //update main x axis
        me.mainAxisSvg.call(me.mainAxis);
		me.localLocLength = ~~brush.y1 - ~~brush.y0 + 1; //~~ means floor()
        
        me.updateMessages(brush);
        //brush
        this.brush
            .x(this.x1)
            .y(this.y1);
    }

    updateMessages(brush) {
        var me = this;
        this.messageLines.selectAll("line").remove();
        this.messageCircles.selectAll("circle").remove();
        // draw messagelines here
        var linkMessages = [];

        var myMap = new Map();

        me.main.traces.messages.forEach(function(d){
            if(d.timestamp>=brush.x0&&d.timestamp<=brush.x1){
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

        var messagecsvg = this.messageCircles.selectAll("circle")
            .data(linkMessages); //the data is updated, then list the updated attrs below, otherwise these attr remain unchanged

        messagecsvg.enter().append("circle") //only re-enter updated rect!!!
            .attr("cx", function(d) {
                return me.x1(d.start);
            })
            .attr("cy", function(d) {
                return me.y1(d.source) + me.y1(1)/2;
            })
            .attr("r", 2)
            .attr("fill","black");
        messagecsvg.enter().append("circle") //only re-enter updated rect!!!
            .attr("cx", function(d) {
                return me.x1(d.end);
            })
            .attr("cy", function(d) {
                return me.y1(d.destination) + me.y1(1)/2;
            })
            .attr("r", 2)
            .attr("fill","black");

        messagecsvg.exit().remove();

        var messagesvg = this.messageLines.selectAll("line")
            .data(linkMessages); //the data is updated, then list the updated attrs below, otherwise these attr remain unchanged

        messagesvg.enter().append("line") //only re-enter updated rect!!!
            .attr("x1", function(d) {
                return me.x1(d.start);
            })
            .attr("y1", function(d) {
                return me.y1(d.source) + me.y1(1)/2;
            })
            .attr("x2", function(d) {
                return me.x1(d.end);
            })
            .attr("y2", function(d) {
                return me.y1(d.destination) + me.y1(1)/2;
            })
            .attr("stroke","white")
            .attr("stroke-width", function(){
                if((brush.x1 - brush.x0)<3000){
                    return "3px"
                }else{
                    return "0px"
                }
            });
        messagesvg.enter().append("line") //only re-enter updated rect!!!
            .attr("x1", function(d) {
                return me.x1(d.start);
            })
            .attr("y1", function(d) {
                return me.y1(d.source) + me.y1(1)/2;
            })
            .attr("x2", function(d) {
                return me.x1(d.end);
            })
            .attr("y2", function(d) {
                return me.y1(d.destination) + me.y1(1)/2;
            })
            .attr("stroke","black")
            .attr("stroke-width", function(){
                if((brush.x1 - brush.x0)<3000){
                    return "2px"
                }else{
                    return "1px"
                }
            });
        messagesvg.exit().remove();


    }

    updateThread(thread, brush) {
		var me = this;
		var locSets = thread.locSets;


        var id = this.mainCanvas.selectAll("idLabel").data([thread.location]);
        id.enter().append("text")
            .text(thread.location)
            .attr("x",-20)
            .attr("y", function(){
                return me.y1(thread.location)+40;
            })
            .attr("font-size", "16px")
            .attr("font-family", "sans-serif");
        id.exit().remove();

        var rects = thread.itemRect.selectAll("rect") //asynchronized mode!!!
            .data(thread.visItems) //the data is updated, then list the updated attrs below, otherwise these attr remain unchanged
            .attr("x", function(d) {
                return me.x1(d.start);
            })
            .attr("y", function(d) {
                return me.y1(thread.location) + 10 + d.level * 2;
            })
            .attr("width", function(d) {
                return Math.max(me.x1(d.end) - me.x1(d.start), 1);
            })
            .attr("height", function(d) {
                return mainHeight * .8 / me.localLocLength - d.level * 5;// / locSets.length;
            })
            .attr("fill", function(d) {
                return me.main.getColor(d.region);
            });

        rects.enter().append("rect") //only re-enter updated rect!!!
            .attr("class", function(d) {
                return "mainItem" + d.location;
            })
            .attr("x", function(d) {
                return me.x1(d.start);
            })
            .attr("y", function(d) {
                return me.y1(thread.location) + 10 + d.level * 2;
            })
            .attr("width", function(d) {
                return Math.max(me.x1(d.end) - me.x1(d.start), 1);
            })
            .attr("height", function(d) {
                var thisHeight = me.mainHeight * .8 / me.localLocLength - d.level * 5;
                if(thisHeight<5){
                    thisHeight = 5;
                }
                return thisHeight;// / locSets.length;
            })
            .attr("fill", function(d) {
                return me.main.getColor(d.region);
            })
            .attr("stroke","black")
            .attr("stroke-width",function(){
                if((brush.x1 - brush.x0)<3000){
                    return "0.5px";
                }else{
                    return 0;
                }
            })
            .attr("opacity", function(d){
                return (d.region.length+110)/(120+d.region.length);
            })
            .on("mouseover", function(d) {
                me.mouseOverPos = d;
            })
            .append("title") //asynch mode may generate different brush extents
            .text(function(d) {
                return d.region;// + ": " + (Math.min(brush.x1, d.end) - Math.max(brush.x0, d.start)).toString();
            });

        rects.exit().remove();

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
                    return me.y1(thread.location + .5);
                })
                .attr("dy", ".5ex")
                .attr("text-anchor", "end")
                .attr("class", "laneText");

            // plot lane line
            thread.main_lane_text.append("line")
                .attr("x1", 0)
                .attr("y1", function() {
                    return me.y1(thread.location + 1);
                })
                .attr("x2", me.w)
                .attr("y2", function() {
                    return me.y1(thread.location + 1);
                })
                .attr("stroke", "lightgray");
        }
    }
}