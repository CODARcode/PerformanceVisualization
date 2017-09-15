//The data is stored here. Including traces, messages, and profiles.
//The traces and profiles are stored in their threads(nodes).
class Data {
	constructor(noThreads){
		var me = this;
		this.regions = ["TAU_USER", "TAU_DEFAULT", "TAU_CALLPATH",
                "MPI","Others"];
		this.noThreads = noThreads;		
		//to set the time range change here. min and max are the time range in the overview, start and end are the time in the detailed view.
		this.timeStamps = {min:6110000,max:6150000,start:6110000, end:6150000};
		//this.timeStamps = {min:2640000,max:2760000,start:2640000, end:2760000};

		this.threads = [];
		for(var i = 0;i<12;i++){
		    me.threads.push(new Thread(i));
		}
		this.messages = [];

	}

	setTraces(traceObjs){
		var me = this;
		var stack = [];
		var level = [0,0,0,0,0];
		traceObjs.forEach(function(event){
			var threadId = parseInt(event["node-id"]);
			if(threadId === undefined){
				console.log(event["node-id"]);
			}
			if(event["event-type"] == "exit"){
				var startTime = me.timeStamps.start;
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
			}else if (event["event-type"] == "counter"||event["event-type"] == "trace end"){
			}else{
			    console.log("ERROR! "+event["event-type"]);
			}
		});
		while(stack.length>0){
			var event = stack.pop();
			var threadId = parseInt(event["node-id"]);
			me.threads[threadId].traces.push({
		        "start": event.time,
		        "end": me.timeStamps.end,
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