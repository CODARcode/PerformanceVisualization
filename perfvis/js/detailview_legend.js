//THe legend for the function groups.
class Legend{
	constructor(main){

        var bb = document.querySelector('#Legend')
                    .getBoundingClientRect();
        var twidth = bb.right - bb.left;
        var theight = 450;
        var svg = d3.select("#Legend")
            .append("svg")
            .attr("width", twidth)
            .attr("height", theight)
            .attr("class", "chart")
		  	//.attr("transform", function(d, i) { return "translate(0,0)"; })
            .append("g");

		var legend = svg.selectAll(".legend")
		  .data(main.traces.regions)
		  .enter().append("g")
		  .attr("class", "legend")
		  .attr("transform", function(d, i) { return "translate(0," + (i * 19+10) + ")"; });
		 
		legend.append("rect")
		  .attr("x", 0)
		  .attr("width", 18)
		  .attr("height", 9)
		  .style("fill", function(d) {
            return main.getRegionColor(d);
            })
		  .on("click",function(d,i){
		  	main.traces.setSelectedRegions(i);
		  	if(main.traces.selectedRegions.includes(i)){
                d3.select(this).attr("fill-opacity", "1");
		  	}else{
                d3.select(this).attr("fill-opacity", "0.2");
		  	}
		  	main.updateBrush({x0:0,x1:0,nodes:[]});
		  });
		 
		legend.append("text")
		  .attr("x", 20)
		  .attr("y", 4)
		  .attr("dy", ".35em")
		  .style("text-anchor", "start")
		  .text(function(d) { 
		  	return d;
		  });

	}
}