//The thread of the trace_events, in the sample datasets it is used as a node in a thread.
class Thread {
    constructor(lid, traceSummary, data) {
    	//data
    	var me = this;
        this.location = lid;
        this.data = data;

        this.timer = [[],[],[]];
        this.counter = [[],[],[]];
        this.timerProfiles = [{},{},{}];
        this.counterProfiles = [{},{},{}];
        this.timeUnit = data.timeUnit;
        this.maxUnitNum = data.timeStamps.max/this.timeUnit;

        this.traces = [];
        this.fullSummary = traceSummary;
        this.querySummary = [];
        this.filteredSummary = [];

        //traces vis
        this.main_lane_text = {};
        this.itemRect = {};
		
		//statistic vis
        this.barRect;
        this.idLabel = {};
        this.profileSum = 0;

        //profile vis
        this.groups;
		me.stacks = [];
		this.visItems = [];
		this.locSets = []; //the array of region sets for all locations
		this.locMaps = new Map(); //the array of (region, time period) maps for all locations
		this.min_level = 0;
	}

	addProfile(profile, timerId){
		var index = Math.floor(timerId/2);
		if(timerId%2==0){
			this.timer[index].push(profile);
		}else{
			this.counter[index].push(profile);
		}
	}

	setProfiles(timerId){
		var me = this;
		var index = Math.floor(timerId/2);
		if(timerId%2==0){
        	this.timer[index].forEach(function(d){
            	me.timerProfiles[index][d.Function] = d;
        	});	
		}else{
        	this.counter[index].forEach(function(d){
            	me.counterProfiles[index][d.Counter] = d;
        	});	
		}
		function isNumber(n) {
  			return !isNaN(parseFloat(n)) && isFinite(n);
		}
    }
	
	clear(){
		this.itemRect.selectAll("rect").remove();
		this.idLabel.selectAll("text").remove();
		this.main_lane_text.selectAll("text").remove();
		this.main_lane_text.selectAll("line").remove();
		this.nodeRect.selectAll("rect").remove();
		this.nodeText.selectAll("text").remove();
        this.barRect.selectAll("rect").remove();
    	this.barRect.selectAll("text").remove();

        this.groups.selectAll("rect").remove();
        this.tooltip.selectAll("text").remove();
	}

	setSummary(){
		var me = this;
		this.querySummary = [];
        this.maxLen = 0;
        for(var i = Math.ceil(me.data.timeStamps.min/this.timeUnit); i<me.data.timeStamps.max/this.timeUnit; i++){
        	var acc = 0;
        	for(var j = 0; j<me.fullSummary.length; j++){
        		if(me.data.selectedRegions.includes(j)&&i<me.fullSummary[j].length&&me.fullSummary[j][i]>0){
        			var obj = {};
        			obj["start"] = acc;
        			acc+=me.fullSummary[j][i];
        			obj["end"] = acc;
        			this.maxLen = Math.max(this.maxLen,acc);
        			obj["region"] = j;
        			obj["time"] = i*this.timeUnit;
        			this.querySummary.push(obj);
        		}
        	}
        }
	}
	
	filter(){
		var me = this;
		var brush = me.data.timeStamps;
		this.filteredSummary = me.querySummary.filter(function(d){
			return (me.data.selectedRegions.includes(d.region))&&((d.time <= brush.max && d.time >= brush.min)||(d.time+me.timeUnit >= brush.min&&d.time+me.timeUnit <= brush.max));
		});
		var visItems = me.traces.filter(function(d) {
			return (d.start <= brush.max && d.start >= brush.min)||(d.end >= brush.min&&d.end <= brush.max);// && me.location >= ~~brush.y0 && me.location <= ~~brush.y1;
		});

		// regions in each location, no matter if it is within brush
		// the indices of locSets and locMaps are consistent with the ones of array locations

		var locSets = []; //the array of region sets for all locations
		var locMaps = new Map(); //the array of (region, time period) maps for all locations
		me.min_level=Number.MAX_SAFE_INTEGER;
		me.max_level=0;
		visItems.forEach(function(visItem) {
			// add new item, include redundant ones
			locSets.push(visItem.region);
			if(visItem.level<me.min_level){
				me.min_level = visItem.level;
			}
			if(visItem.level>me.max_level){
				me.max_level = visItem.level;
			}
			// update location maps
			var val = locMaps.get(visItem.region);
			// consider the current extent
			var updatedval = 0,
				newstart = 0,
				newend = 0;
			if (visItem.end > brush.x1) {
				newend = brush.x1;
			} else {
				newend = visItem.end;
			}
			if (visItem.start < brush.x0) {
				newstart = brush.x0;
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
		//console.log(me.min_level);
		locSets = Array.from(locMaps.keys());
		locSets.sort(); //sort in order to increase stability for display
		
		this.visItems = visItems;
		this.locSets = locSets;
		this.locMaps = locMaps;
	}
	
    print() {
        console.log(this)
    }
}

