class ScatterPlot{
	constructor(){
        var bb = document.querySelector('#Outlier')
                    .getBoundingClientRect();
        this.margin = [40, 40, 40, 40]; //top right bottom left (space for label texts)
        var me = this;
        this.w = bb.right - bb.left;

        this.width = bb.right - bb.left - 2*this.margin[1] - 2*this.margin[3];
        var width = this.width;
		var height = this.width;

		this.xScale = d3.scaleLinear().range([0, width]).domain([0,1]); // value -> display
		this.xAxis = d3.axisBottom().scale(me.xScale);

		// setup y
		this.yScale = d3.scaleLinear().range([height, 0]).domain([0,1]); // value -> display
		this.yAxis = d3.axisLeft().scale(me.yScale);

		// setup fill color
		var cValue = function(d) { return d.Manufacturer;};
		this.color = d3.scaleOrdinal(d3.schemeCategory20).domain([0,10,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116]);
        this.svg = d3.select("#Outlier")
            .append("svg")
            .attr("width", me.w)
            .attr("height", me.w)
            .attr("class", "chart")
  			.append("g")
    		.attr("transform", "translate(" + me.margin[3] + "," + me.margin[0] + ")");

		  // x-axis
		this.xAxisSVG = this.svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")");

		this.xAxisSVG.append("text")
		      .attr("class", "label")
		      .attr("x", width)
		      .attr("y", 30)
		      .style("text-anchor", "end")
		      .style("text-anchor", "middle")
		      .text("time_by_lasttime");

		  // y-axis
		this.yAxisSVG = this.svg.append("g")
		      .attr("class", "y axis");

		this.yAxisSVG.append("text")
		      .attr("class", "label")
		      .attr("transform", "rotate(-90)")
		      .attr("y", -30)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .style("text-anchor", "middle")
		      .text("time_diff");

		  // draw legend
		  var legend = this.svg.selectAll(".legend")
		      .data(me.color.domain())
		    .enter().append("g")
		      .attr("class", "legend")
		      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		  // draw legend colored rectangles
		  legend.append("rect")
		      .attr("x", width - 18)
		      .attr("width", 18)
		      .attr("height", 12)
		      .style("fill", me.color);

		  // draw legend text
		  legend.append("text")
		      .attr("x", width - 24)
		      .attr("y", 6)
		      .attr("dy", ".35em")
		      .style("text-anchor", "end")
		      .text(function(d) { return d;})

	}
	update(fileName){
		var svg = this.svg;
		var xAxis = this.xAxis;
		var yAxis = this.yAxis;
		var color = this.color;
		var me = this;

		d3.csv(fileName, function(error, data) {

		  // change string (from CSV) into number format
		  data.forEach(function(d) {
		    d["time_by_lasttime"] = +d["time_by_lasttime"];
		    d["time_diff"] = +d["time_diff"];
		//    console.log(d);
		  });

		var xValue = function(d) { return d["time_by_lasttime"];}, // data -> value
		    xMap = function(d) { return me.xScale(xValue(d));}; // data -> display

		var yValue = function(d) { return d["time_diff"];}, // data -> value
		    yMap = function(d) { return me.yScale(yValue(d));}; // data -> display
		  // don't want dots overlapping axis, so add in buffer to data domain
		  var xRange = d3.max(data, xValue) - d3.min(data, xValue);
		  var yRange = d3.max(data, yValue) - d3.min(data, yValue);
		  me.xScale.domain([d3.min(data, xValue)-xRange/100, d3.max(data, xValue)+xRange/100]);
		  me.yScale.domain([d3.min(data, yValue)-yRange/100, d3.max(data, yValue)+yRange/100]);
		  me.xAxisSVG.call(me.xAxis)
		  me.yAxisSVG.call(me.yAxis)

		  // draw dots
		  svg.selectAll(".dot").remove();
		  	data.sort(function(a,b) {
          		return d3.ascending(+a.class, +b.class);
      		});
		  var dots = svg.selectAll(".dot")
		      .data(data);

		  dots.enter().append("circle")
		      .attr("class", "dot")
		      .attr("r", 3.5)
		      .attr("cx", xMap)
		      .attr("cy", yMap)
		      .style("fill", function(d) {
		      	var fillColor = "gray";
		      	if(d['class']==1){
		      		fillColor = color(d['node']);
		      	}
		      	return fillColor;
		      })
		      .style("stroke","black")
		      .style("stroke-width", function(d){
		      	return (d['class']==0)?0:0.5;
		      })
		      .style("fill-opacity", function(d){
		      	return (d['class']==0)?0.1:1;
		      })
   				.append("svg:title")
		      .text(function(d){return d.node;});
			dots.exit().remove();
		});
	}
}
var scatterplot = new ScatterPlot();
$('.thi li > a').click(function(e) {
    $('#outlier').text(this.innerHTML);
    scatterplot.update("../outliers/"+this.innerHTML+".csv");
});