// The transition data for different stages of the trace_events. Now it is unused.
class Transition{
	constructor(tid, links, noThreads1, noThreads2){
		var me  = this;
		this.tid = tid;
		this.nodes = [];
		this.noThreads1 = noThreads1;
		this.noThreads2 = noThreads2;
		for(var i = 0; i< noThreads1;i++){
			this.nodes.push({name:i});
		}
		for(i = 0; i< noThreads2;i++){
			this.nodes.push({name:i});
		}

		this.links = [];
		links.forEach(function(link){
			me.links.push({source:link[1], target: noThreads1+link[2], value:link[3]});
		})
	}

	setNodePos(xstart, flowWidth, ystart, flowheight){
		var w1 = flowheight / this.noThreads1;
		var w2 = flowheight / this.noThreads2;

		for(var i = 0; i< this.noThreads1;i++){
			this.nodes[i].x = xstart;
			this.nodes[i].y = ystart + w1*i;
		}
		for(i = 0; i< this.noThreads2;i++){
			this.nodes[i + this.noThreads1].x = xstart + flowWidth;
			this.nodes[i + this.noThreads1].y = ystart + w2*i;
		}
	}
}
