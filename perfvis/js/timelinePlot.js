/**
 * Created by wxu on 2/15/17.
 */
//--------------------trace visualization---------------------
class TraceVis {
    constructor(regions, main) {
        var me = this;
        this.timeBegin = main.stages[0].timeBegin;
        this.timeEnd = main.stages[0].timeEnd;
        this.noThreads = main.stages[0].threads.length;


        var bb = document.querySelector('#TimelinePlot')
                    .getBoundingClientRect();
        var twidth = bb.right - bb.left;
        var theight = 450;
        this.m = [20, 50, 0, 10, 0]; //top right bottom left (space between main and mini)
        this.w = twidth - this.m[1] - this.m[3];
        this.h = theight - this.m[0] - this.m[2];
        this.mainHeight = this.h - this.m[4]; //has space between
        //scales
        this.x = d3.scale.linear()
            .domain([this.timeBegin, this.timeEnd])
            .range([0, this.w]); //brush, and mini
        this.x1 = d3.scale.linear()
            .domain([this.timeBegin, this.timeEnd])
            .range([0, this.w]); //main
        this.y1 = d3.scale.linear()
            .domain([0, this.noThreads])
            .range([0, this.mainHeight]); //main
        this.y2 = d3.scale.linear()
            .domain([0, this.noThreads])
            .range([0, this.miniHeight]); //mini
        //axis
        this.mainAxis = d3.svg.axis()
            .scale(this.x1)
            .orient("top");
        //color
        this.c20 = d3.scale.category20().domain(regions);

        this.mouseOverPos;

        //chart
        var chart = d3.select("#TimelinePlot")
            .append("svg")
            .attr("width", this.w + this.m[1] + this.m[3])
            .attr("height", this.h + this.m[0] + this.m[2])
            .attr("class", "chart");

        chart.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", this.w)
            .attr("height", this.mainHeight);

        this.main = chart.append("g")
            .attr("transform", "translate(" + this.m[3] + "," + this.m[0] + ")")
            .attr("width", this.w)
            .attr("height", this.mainHeight)
            .attr("class", "main");

        //main x axis
        this.mainAxisSvg = this.main.append("g")
            .attr("class", "x axis")
            .call(this.mainAxis);


        // chart for metedata

        var bb2 = document.querySelector('#Statistics')
                    .getBoundingClientRect();
        var mwidth = bb2.right - bb2.left;
        var mheight = theight;
        this.mm = [20, 20, 5, 15, 80]; //top right bottom left (space for label texts)
        this.metaw = mwidth - this.mm[1] - this.mm[3];
        this.metah = mheight - this.mm[0] - this.mm[2];
        this.metaHeight = this.mainHeight;

        //scale
        this.metax = d3.scale.linear()
            .domain([0, this.timeEnd - this.timeBegin])
            .range([0, this.metaw - this.mm[4]]); //metamain, leave space for text

        //axis
        this.metaAxis = d3.svg.axis()
            .scale(this.metax)
            .orient("top");


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


    init(thread) {
        var me = this;
        //main lane text
        thread.main_lane_text = this.main.append("g")
            .attr("class", "main_lane_text");
        thread.itemRect = this.main.append("g")
            .attr("clip-path", "url(#clip)");

        thread.barRect = this.metabar.append("g").attr("clip-path", "url(#clip)");
    }

    update(me, threads, extent){
        if(extent[0][0] == extent[1][0]){
            extent[0][0] = me.timeBegin;
            extent[1][0] = me.timeEnd;
            extent[0][1] = 0;
            extent[1][1] = threads.length-1;
        }
        var rects,
            brush_x0 = extent[0][0],
            brush_y0 = extent[0][1],
            brush_x1 = extent[1][0],
            brush_y1 = extent[1][1]; //~~ means floor()
        // set scales
        me.x1.domain([brush_x0, brush_x1]);
        me.y1.domain([~~brush_y0, Math.min(~~brush_y1 + 1, me.noThreads)]);
        me.metax.domain([0, brush_x1 - brush_x0]);

        threads.forEach(function(thread) {
            me.updateThread(me, thread, extent);
        })
        //update main x axis
        me.mainAxisSvg.call(me.mainAxis);
        //update main x axis
        me.metaAxisSvg.call(me.metaAxis);
    }

    updateThread(me, thread, extent) {
        var rects,
            brush_x0 = extent[0][0],
            brush_y0 = extent[0][1],
            brush_x1 = extent[1][0],
            brush_y1 = extent[1][1],
            localLocLength = ~~brush_y1 - ~~brush_y0 + 1; //~~ means floor()

        var visItems = thread.traces.filter(function(d) {
            return d.start < brush_x1 && d.end > brush_x0 &&
                thread.location >= ~~brush_y0 && thread.location <= ~~brush_y1;
        });
        //console.log(thread.location)
        //console.log(visItems)

        // if nothing is selected
        if (brush_x0 == brush_x1) {
            thread.barRect.selectAll("rect").remove();
            thread.barRect.selectAll("text").remove();
            thread.itemRect.selectAll("rect").remove();
            thread.main_lane_text.selectAll("text").remove();
            thread.main_lane_text.selectAll("line").remove();
            return;
        }


        // regions in each location, no matter if it is within brush
        // the indices of locSets and locMaps are consistent with the ones of array locations
        var locSets = []; //the array of region sets for all locations
        var locMaps = new Map(); //the array of (region, time period) maps for all locations

        visItems.forEach(function(visItem) {
            // add new item, include redundant ones
            locSets.push(visItem.region);
            // update location maps
            var val = locMaps.get(visItem.region);
            // consider the current extent
            var updatedval = 0,
                newstart = 0,
                newend = 0;
            if (visItem.end > brush_x1) {
                newend = brush_x1;
            } else {
                newend = visItem.end;
            }
            if (visItem.start < brush_x0) {
                newstart = brush_x0;
            } else {
                newstart = visItem.start;
            }
            updatedval = newend - newstart;
            if (val) {
                val = val + updatedval;
                locMaps.set(visItem.region, val);
            } else {
                locMaps.set(visItem.region, updatedval);
            }
            //console.log(i, locMaps[0].size, locMaps[1].size, locMaps[2].size, locMaps[3].size);
        })

        locSets = Array.from(locMaps.keys());
        locSets.sort(); //sort in order to increase stability for display


        //update main item rects
        thread.itemRect.selectAll("rect").remove(); //---to be fixed---

        rects = thread.itemRect.selectAll("rect") //asynchronized mode!!!
            .data(visItems) //the data is updated, then list the updated attrs below, otherwise these attr remain unchanged
            .attr("x", function(d) {
                return me.x1(d.start);
            })
            .attr("y", function(d) {
                return me.y1(thread.location) + 10 +
                    locSets.indexOf(d.region) *
                    mainHeight * .8 / localLocLength / locSets.length;
            })
            .attr("width", function(d) {
                return Math.max(me.x1(d.end) - me.x1(d.start), 1);
            })
            .attr("height", function(d) {
                return mainHeight * .8 / localLocLength / locSets.length;
            })
            .attr("fill", function(d) {
                return me.c20(d.region);
            });

        rects.enter().append("rect") //only re-enter updated rect!!!
            .attr("class", function(d) {
                return "mainItem" + d.location;
            })
            .attr("x", function(d) {
                return me.x1(d.start);
            })
            .attr("y", function(d) {
                return me.y1(thread.location) + 10 +
                    locSets.indexOf(d.region) *
                    me.mainHeight * .8 / localLocLength / locSets.length;
            })
            .attr("width", function(d) {
                return Math.max(me.x1(d.end) - me.x1(d.start), 1);
            })
            .attr("height", function(d) {
                return me.mainHeight * .8 / localLocLength / locSets.length;
            })
            .attr("fill", function(d) {
                return me.c20(d.region);
            })
            .on("mouseover", function(d) {
                me.mouseOverPos = d;
            }).append("title") //asynch mode may generate different brush extents
            .text(function(d) {
                return d.region + ": " + (Math.min(brush_x1, d.end) - Math.max(brush_x0, d.start)).toString();
            });

        rects.exit().remove();

        //update main lane text
        // clean up previous plotting
        thread.main_lane_text.selectAll("text").remove();
        thread.main_lane_text.selectAll("line").remove();

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
        /////////////

        //update meta item rects
        thread.barRect.selectAll("rect").remove();
        thread.barRect.selectAll("text").remove();


        //------- plot bars -----------
        var bars = thread.barRect.selectAll("rect")
            .data(locSets)
            .attr("x", me.mm[4])
            .attr("y", function(d) {
                return me.y1(i) + 10 + locSets.indexOf(d) * me.metaHeight * .8 / localLocLength / locSets.length;
            })
            .attr("width", function(d) {
                return Math.max(metax(locMaps.get(d)), 1);
            })
            .attr("height", function(d) {
                return metaHeight * .8 / localLocLength / locSets.length;
            })
            .attr("fill", function(d) {
                return me.c20(d);
            });

        bars.enter().append("rect")
            .attr("x", me.mm[4])
            .attr("y", function(d) {
                return me.y1(thread.location) + 10 + locSets.indexOf(d) * me.metaHeight * .8 / localLocLength / locSets.length;
            })
            .attr("width", function(d) {
                return Math.max(me.metax(locMaps.get(d)), 1);
            })
            .attr("height", function(d) {
                return me.metaHeight * .8 / localLocLength / locSets.length;
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
                var sh = me.metaHeight * .8 / localLocLength / locSets.length;
                return me.y1(i) + 10 + (locSets.indexOf(d) + 0.5) * sh;
            }) //for text alignment
            .style("font-size", function(d) {
                var sh = me.metaHeight * .8 / localLocLength / locSets.length;
                sh = Math.max(Math.min(~~sh, 13), 8); //floor
                return sh.toString() + "px";
            });

        labels.enter().append("text")
            .text(function(d) {
                return d;
            })
            .attr("x", me.mm[4] - 2)
            .attr("y", function(d) {
                var sh = me.metaHeight * .8 / localLocLength / locSets.length;
                return me.y1(thread.location) + 10 + (locSets.indexOf(d) + 0.5) * sh;
            }) //for text alignment
            .attr("dy", ".5ex")
            .attr("text-anchor", "end")
            .style("font-size", function(d) {
                var sh = me.metaHeight * .8 / localLocLength / locSets.length;
                sh = Math.max(Math.min(~~sh, 13), 8);
                return sh.toString() + "px";
            });

        labels.exit().remove();

        //update the item labels
        /*        labels = itemRects.selectAll("text")
                        .data(visItems, function(d) { return d.start; }) //return the unique property
                        .attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 2);});

                labels.enter().append("text")
                        .text(function(d) {return d.region;})
                        .attr("x", function(d) {return x1(Math.max(d.start, minExtent));})
                        .attr("y", function(d) {return y1(d.location + .5);})
                        .attr("text-anchor", "start");

                labels.exit().remove();
        */
    }
}
//main lanes and texts
/*    main.append("g").selectAll(".laneLines")
            .data(traces)
            .enter().append("line")
            .attr("x1", m[1])
            .attr("y1", function(d) {return y1(d.location);})
            .attr("x2", w)
            .attr("y2", function(d) {return y1(d.location);})
            .attr("stroke", "lightgray")

    main.append("g").selectAll(".laneText")
            .data(lanes)
            .enter().append("text")
            .text(function(d) {return d;})
            .attr("x", -m[1])
            .attr("y", function(d, i) {return y1(i + .5);})
            .attr("dy", ".5ex")
            .attr("text-anchor", "end")
            .attr("class", "laneText");
*/