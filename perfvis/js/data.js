//The data is stored here. Including traces, messages, and profiles.
//The traces and profiles are stored in their threads(nodes).
class Data {
	constructor(noThreads, traceSummary, timeMax, timeUnit){
		var me = this;
		this.fort = [{"file":"trajectory-2.002","start":2.95E+06,"end":2.80E+06,"nodestart":0,"nodeend":4},
					 {"file":"trajectory-2.004","start":2.9502E+06,"end":2.802E+06,"nodestart":6,"nodeend":10},
		      		 {"file":"trajectory-2.006","start":2.9702E+06,"end":2.822E+06,"nodestart":16,"nodeend":20},
		      		 {"file":"trajectory-2.008","start":2.9704E+06,"end":2.824E+06,"nodestart":22,"nodeend":26},
		      		 {"file":"trajectory-4.002","start":2.706E+06,"end":1.89E+06,"nodestart":60,"nodeend":64},
		      		 {"file":"trajectory-4.004","start":2.706E+06,"end":1.89E+06,"nodestart":62,"nodeend":66}];
		this.regions = ["Others", "TAU_Others", "TAU_USER", "TAU_DEFAULT", "MPI", "FLUSH", "MPI_Allgather()", "MPI_Barrier()"];
		this.noThreads = noThreads;		
		//to set the time range change here. min and max are the time range in the overview, start and end are the time in the detailed view.
		this.timeStamps = {min:0,max:timeMax,start:0, end:1};
		this.timeUnit = timeUnit;
		this.nodeList = [];
		this.selectedRegions = [];
		for(var i = 0;i<this.regions.length;i++){
			this.selectedRegions.push(i);
		}
		this.threads = [];
		for(var i = 0;i<noThreads;i++){
		    me.threads.push(new Thread(i, traceSummary[i], me));
		    this.nodeList.push(i);
		}
		this.messages = [];
	}

	updateSelectedNodes(nodeid){
		if(this.nodeList.length==this.noThreads){
			this.nodeList = [nodeid];
		}else{
			var index = this.nodeList.indexOf(nodeid);
			if(index==-1){
				this.nodeList.push(nodeid);
			}else{
				this.nodeList.splice(index, 1);
			}
		}
		if(this.nodeList.length==0){
			for(var i = 0;i<this.noThreads;i++){
		    	this.nodeList.push(i);
			}
		}
	}
	querySummary(){
		this.threads.forEach(function(d){
			d.setSummary();
		});
	}

	setSelectedRegions(id){
		var index = this.selectedRegions.indexOf(id);
		if(index == -1){
			this.selectedRegions.push(id);
		}else{
			this.selectedRegions.splice(index,1);
		}
	}
	setTraces(traceObjs){
		var me = this;
		var stack = [];
		var level = Array(me.noThreads).fill(0);
		me.threads.forEach(function(thread){
			thread.traces.length = 0;
		});
		traceObjs.forEach(function(event){
			var threadId = parseInt(event["node-id"]);
			if(threadId !== undefined){//||this.selectedRegions.includes(event["group-id"])){
				if(event["event-type"] == "exit"){
					var startTime = me.timeStamps.min;
					if(stack.length >= 1){
						startTime = stack[stack.length - 1].time;
						if(stack[stack.length - 1].name == event.name){
							stack.pop();
						}
					}
					//if(threadId<64&&event["group-id"]){
					//	console.log(event);
					//}
			    	me.threads[threadId].traces.push({
			        	"start": startTime,
			        	"end": event.time,
			        	"name": event["name"],
			        	"region": event["group-id"],
			        	"level": level[threadId]
			    	});
			    	level[threadId]--;
				}else if(event["event-type"] == "entry"){
					stack.push(event);
					level[threadId]++;
				}else if (event["event-type"] == "counter"||event["event-type"] == "send"||event["event-type"] == "trace end"){
				}else{
				    console.log("ERROR! "+event["event-type"]);
				}
			}
		});
		while(stack.length>0){
			var event = stack.pop();
			var threadId = parseInt(event["node-id"]);
			me.threads[threadId].traces.push({
		        "start": event.time,
		        "end": me.timeStamps.max,
		        "name": event["name"],
		        "region": event["group-id"],
		        "level": level[threadId]
		    });
		    level[threadId]--;
		}

		function compare(a,b) {
  			if (a.level < b.level)
    			return -1;
  			if (a.level > b.level)
    			return 1;
  			return 0;
		}
		me.threads.forEach(function(thread){
			thread.traces.sort(compare);
		});
	}

	setMessages(messages){
		this.messages = messages;
		//console.log(messages);
	}

	setProfiles(profiles, timerType){
		var me = this;
		var timerId = parseInt(timerType);
		profiles.forEach(function(profile){
			me.threads[profile["process index"]].addProfile(profile,timerId);		
		});
		this.threads.forEach(function(thread){
			thread.setProfiles(timerId);
		});

	}
}