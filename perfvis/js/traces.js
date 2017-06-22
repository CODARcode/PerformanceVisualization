class Traces {
	constructor(noThreads){
		var me = this;

		this.noThreads = noThreads;

		//this.timeStamps = {min:0,max:54251700,start:0, end:54251700};
		this.timeStamps = {min:0,max:54251700,start:0, end:5425170};

		this.states = {};
		this.regions = [];

		this.threads = [];

		for(var i = 0;i<noThreads;i++){
		    me.threads.push(new Thread(i));
		}
	}

    setStates(states){
    	var me = this;
        states.forEach(function(state){
            me.states[state.name] = parseInt(state["group-id"]);
            me.regions.push(state.name);
        });
    }

	setTraces(traceObjs){
		var me = this;
		var stack = [];
		var level = 0;		traceObjs.forEach(function(event){
			if(event["event-type"] == "exit"){
				var startTime = 0;
				if(stack[stack.length - 1].name == event.name){
					startTime = stack[stack.length - 1].time;
					stack.pop();
				}
				if(me.threads[me.states[event.name]-1] === undefined){
					console.log(me.states[event.name]);
				}
		    	me.threads[me.states[event.name]-1].traces.push({
		        	"start": startTime,
		        	"end": event.time,
		        	"region": event.name,
		        	"level": level
		    	});
		    	level--;
			}else if(event["event-type"] == "entry"){
				stack.push(event);
				level++;
			}else if (event["event-type"] == "counter"||event["event-type"] == "trace end"){
			}else{
			    console.log("ERROR! "+event["event-type"]);
			}
		});
		while(stack.length>0){
			var event = stack.pop();
			me.threads[me.states[event.name]-1].traces.push({
		        "start": event.time,
		        "end": me.timeStamps.end,
		        "region": event.name,
		        "level": level
		    });
		    level--;
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

	setProfiles(profiles, isTimer){
		var me = this;
		profiles.forEach(function(profile){
			me.threads[profile["process index"]].addProfile(profile,isTimer);
		});
		this.threads.forEach(function(thread){
			thread.setProfiles(isTimer);
		});
	}
}
