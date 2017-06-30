// The transition visualization for different stages of the trace_events. Now it is unused.
class FlowVis {
    constructor(transition, overview, main, xstart, flowWidth) {
      var me = this;
        this.transition = transition;
        //console.log(this.transition);

        var formatNumber = d3.format(",.0f"),
            format = function(d) { return formatNumber(d) + "m CHF"; };

        this.xstart = xstart;
        this.miniHeight = 100; // 20 is for the height of axis
        var mainHeight = overview.h - this.miniHeight +10; //has space between

        transition.setNodePos(xstart, flowWidth-12, mainHeight, overview.h);

        var sankey = d3.sankey()
            .nodeWidth(25) // was 15
            .nodePadding(10) // was 10
            .size([flowWidth, this.miniHeight]);

        var svg = overview.chart;

        var path = sankey.link();

        sankey.nodes(transition.nodes)
            .links(transition.links)
            .layout2();

        var link = svg.append("g").selectAll(".link")
            .data(transition.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke-width", function(d) {
                return Math.max(1, d.dy);
            })
            .style("stroke", "gray")
            .style("opacity", 0.5)
            .sort(function(a, b) {
                return b.dy - a.dy;
            });

        link.append("title")
            .text(function(d) {
                return d.source.name + " → " + d.target.name + "\n" + format(d.value);
            });
        // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky

        var node = svg.append("g").selectAll(".node")
            .data(transition.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y+ ")";
            });

        node.append("rect")
            .attr("height", sankey.nodeWidth())
            .attr("width", function(d) {
                return d.dy;
            })
            .style("fill", "white")
            .style("stroke", "gray")
            .append("title")
            .text(function(d) {
                return d.name + "\n" + format(d.value);
            });

        node.append("text")
            .attr("text-anchor", "middle")
            .attr("x", function(d) {
                return d.dy / 2
            })
            .attr("y", sankey.nodeWidth() / 2)
            .attr("dy", ".35em")
            .text(function(d) {
                return d.name;
            })
            .filter(function(d) {
                return d.x < flowWidth / 2;
            });
    }

    dragmove(d) {
        //d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
        d3.select(this).attr("transform", "translate(" + (d.x = Math.max(0, Math.min(flowWidth - d.dy, d3.event.x))) + "," + d.y + ")");
        sankey.relayout();
        link.attr("d", path);
    }

    init() {

    }
}