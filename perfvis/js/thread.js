//----------------------data-----------------------
class Thread {
    constructor(lid, profiles) {
    	//data
    	var me = this;
        this.location = lid;

        this.timer = [];
        this.counter = [];
        this.timerProfiles = {};
        this.counterProfiles = {};

        this.traces = [];

        //traces vis
        this.main_lane_text = {};
        this.itemRect = {};
		
		//statistic vis
        this.barRect = {};

        //profile vis
        this.groups = {};
		me.stacks = [];
		this.visItems = [];
		this.locSets = []; //the array of region sets for all locations
		this.locMaps = new Map(); //the array of (region, time period) maps for all locations
	}

	addProfile(profile, isTimer){
		if(isTimer){
			this.timer.push(profile);
		}else{
			this.counter.push(profile);
		}
	}

	setProfiles(isTimer){
		var me = this;
		if(isTimer){
        	this.timer.forEach(function(d){
            	me.timerProfiles[d.Function] = d;
        	});	
		}else{
        	this.counter.forEach(function(d){
            	me.counterProfiles[d.Counter] = d;
        	});	
		}

		function isNumber(n) {
  			return !isNaN(parseFloat(n)) && isFinite(n);
		}
    }
	
	clear(){
		this.itemRect.selectAll("rect").remove();
		this.main_lane_text.selectAll("text").remove();
		this.main_lane_text.selectAll("line").remove();

        this.barRect.selectAll("rect").remove();
        this.barRect.selectAll("text").remove();
		
        this.groups.selectAll("rect").remove();
        this.tooltip.selectAll("text").remove();
	}
	
	filter(brush){
		var me = this;
		var visItems = me.traces.filter(function(d) {
			return d.start < brush.x1 && d.end > brush.x0 &&
				me.location >= ~~brush.y0 && me.location <= ~~brush.y1;
		});

		// regions in each location, no matter if it is within brush
		// the indices of locSets and locMaps are consistent with the ones of array locations

		var locSets = []; //the array of region sets for all locations
		var locMaps = new Map(); //the array of (region, time period) maps for all locations
		
		visItems.forEach(function(visItem) {
			// add new item, include redundant ones
			locSets.push(visItem.region);
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

