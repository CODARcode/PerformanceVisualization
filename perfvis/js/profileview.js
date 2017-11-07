//Profile visualizrion shows the profile informaiton, which visualize the metrics of timers and counters.

class ProfileVis {
    constructor(main) {
        var me = this;
        this.main = main;
        this.noThreads = main.traces.noThreads;//threads.length;
        var bb = document.querySelector('#Profiles')
            .getBoundingClientRect();
        var twidth = bb.right - bb.left;
        var theight = 700;
        this.m = [10, 90, 0, 90, 0]; //top right bottom left (space between main and mini)
        this.w = twidth - this.m[1] - this.m[3];
        this.h = theight - this.m[0] - this.m[2];
        this.height = this.h - this.m[4]; //has space between
		this.measure = "Calls";

        var formatPercent = d3.format(".0%");
        this.x = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.w]); //main

        this.y = d3.scaleLinear()
            .domain([0, this.noThreads])
            .range([this.m[4], this.h]); //main

        this.svg = d3.select("#Profiles")
            .append("svg")
            .attr("width", this.w + this.m[1] + this.m[3])
            .attr("height", this.h + this.m[0] + this.m[2])
            .attr("class", "chart")
            .append("g")
            .attr("transform", "translate(" + this.m[3] + "," + this.m[0] + ")");

        this.xaxis = d3.axisTop()
            .scale(this.x)
            .tickFormat(formatPercent);

        this.main.traces.threads.forEach(function(thread) {
            thread.profIdLabel = me.svg.append("g")
                .attr("class", "idLabel").append("text")
                .text(thread.location)
                .attr("x",-20)
                .attr("y", function(){
                    return me.y(thread.location);
                })
                .attr("font-size", "12px")
                .attr("font-family", "sans-serif");
        });
    }

    update(brush) {
		var me = this;
        //me.y.domain([~~brush.y0, Math.min(~~brush.y1 + 1, me.noThreads)]);
        //me.localLocLength = ~~brush.y1 - ~~brush.y0 + 1; //~~ means floor()
    }

    setMeasure(measure){
        this.measure = measure;
    }

    updateThread(thread) {
        //console.log(thread.location);
		var me = this;
		var barheight = me.h/me.noThreads-3;

        thread.profIdLabel
            .attr("y", function(){
                return me.y(thread.location);
            });

        thread.groups.selectAll("rect")
            .data(function(d){return d;})
            .enter()
            .append("rect")
            .attr("x",function(d) {return me.x(d[0]); })
            .attr("y", function(d) {
                return me.y(thread.location);
            })
            .attr("height", barheight)
            .attr("width", function(d) {
                return Math.max(me.x(d[1] - d[0]),0.1);
            })
            .on("mouseover", function() {
                thread.tooltip.style("display", null);
            })
            .on("mouseout", function() {
                thread.tooltip.style("display", "none");
            })
            .on("mousemove", function(d) {
                var xPosition = d3.mouse(this)[0] - 15;
                var yPosition = d3.mouse(this)[1] - 25;
                thread.tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                thread.tooltip.select("text").text(d.key + ":" + (d[1]-d[0]));
            });


        thread.tooltip.append("text")
            .attr("x", 15)
            .attr("y", 0)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");
    }

    setXAxis(max){
        this.x = d3.scaleLinear()
            .domain([0, max])
            .range([0, this.w]); //main
    }


    init(thread, regions, timerId) {
        var me = this;

        var profiles = {};
        var index = Math.floor(timerId/2);
        if(timerId%2==0){
            profiles = thread.timerProfiles[index];
        }else{
            profiles = thread.counterProfiles[index];
        }
        var sum = 0;
        var obj = {};
        Object.keys(profiles).forEach(function(d){
            sum += profiles[d][me.measure];
            obj[d] = profiles[d][me.measure];
        });
        obj['total'] = sum;
        //console.log(obj);
        this.svg.selectAll("g.thread" + thread.location).remove();
        var data = [obj];
        thread.groups = this.svg.selectAll("g.thread" + thread.location)
            .data(d3.stack().keys(Object.keys(profiles))(data))
            .enter().append("g")
            .attr("class", "thread" + thread.location)
            .style("fill", function(d,i) {
                return me.main.getTwoColor(i);
            });
        // Prep the tooltip bits, initial display is hidden
        thread.tooltip = this.svg.append("g")
            .attr("class", "tooltip")
            .style("opacity", 1)
            .style("display", "none");
        return sum;
    }
}