//The data is stored here. Including traces, messages, and profiles.
//The traces and profiles are stored in their threads(nodes).
class Data {
	constructor(noThreads, timeMax){
		var me = this;
		this.regions = ["TAU_USER", "TAU_DEFAULT", "TAU_CALLPATH",
                "MPI","Others"];
		this.noThreads = noThreads;		
		//to set the time range change here. min and max are the time range in the overview, start and end are the time in the detailed view.
		this.timeStamps = {min:0,max:timeMax,start:0, end:1};;
		//this.timeStamps = {min:2640000,max:2760000,start:2640000, end:2760000};
		this.nodeList = [];

		this.threads = [];
		for(var i = 0;i<noThreads;i++){
		    me.threads.push(new Thread(i));
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

	setTraces(traceObjs){
		var me = this;
		var stack = [];
		var level = Array(me.noThreads).fill(0);
		me.threads.forEach(function(thread){
			thread.traces.length = 0;
		});
		traceObjs.forEach(function(event){
			var threadId = parseInt(event["node-id"]);
			if(threadId === undefined){
				console.log(event["node-id"]);
			}
			if(event["event-type"] == "exit"){
				var startTime = me.timeStamps.min;
				if(stack.length >= 1&&stack[stack.length - 1].name == event.name){
					startTime = stack[stack.length - 1].time;
					stack.pop();
				}
		    	me.threads[threadId].traces.push({
		        	"start": startTime,
		        	"end": event.time,
		        	"region": event.name,
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
		});
		while(stack.length>0){
			var event = stack.pop();
			var threadId = parseInt(event["node-id"]);
			me.threads[threadId].traces.push({
		        "start": event.time,
		        "end": me.timeStamps.max,
		        "region": event.name,
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
		console.log(messages);
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