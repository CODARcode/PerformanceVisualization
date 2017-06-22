//--------------------Main function--------------------
class Main {
    constructor() {
        this.traces = new Traces(6);
        this.overview = {};
        this.tracevis = {};
        this.profilevis = {};
        this.statisticsvis = {};
        this.traceObjs = {};
        this.statesReady = false;
        this.eventsReady = false;

        this.sendQuery("states", this.getStates);
        this.sendQuery("events/" + this.traces.timeStamps.min + ":" + this.traces.timeStamps.max, this.getEvents);
        this.sendQuery("profiles/0", this.getProfiles);
        this.sendQuery("profiles/1", this.getProfiles);
    }

    updateData() {
        if (this.statesReady && this.eventsReady) {
            //console.log(this.traceObjs);
            this.traces.setTraces(this.traceObjs);
            this.initVisualization(); //-------------------------------------------
        }
    }

    update(extent) {
        var me = this;
        if (extent[0][0] == extent[1][0]) {
            extent[0][0] = this.traces.timeStamps.start;
            extent[1][0] = this.traces.timeStamps.end;
            extent[0][1] = 0;
            extent[1][1] = this.traces.threads.length - 1;
        }
        var brush = {
            x0: extent[0][0],
            y0: extent[0][1],
            x1: extent[1][0],
            y1: extent[1][1]
        };

        this.tracevis.update(brush);
        this.profilevis.update(brush);
        this.statisticsvis.update(brush);

        this.traces.threads.forEach(function(thread) {
            thread.clear();
            thread.filter(brush);
            me.tracevis.updateThread(thread, brush);
            me.profilevis.updateThread(thread);
            me.statisticsvis.updateThread(thread);
        });
    }

    initVisualization() {
        var me = this;
        this.overview = new Overview(this);
        this.tracevis = new TraceVis(this);
        this.profilevis = new ProfileVis(this);
        this.statisticsvis = new StatisticsVis(this);

        this.overview.init(me, me.traces.regions);
        this.overview.drawlegend(me.traces.regions);
        var profileMaxX = 0;

        this.traces.threads.forEach(function(thread) {
            me.tracevis.init(thread);
            var thisSum = me.profilevis.init(thread, me.traces.regions, false);
            if (thisSum > profileMaxX) {
                profileMaxX = thisSum;
            }
            me.statisticsvis.init(thread);
        });
        me.overview.initBrush();
        //console.log(profileMaxX);
        me.profilevis.setXAxis(profileMaxX);

        this.update([
            [0, 0],
            [0, 0]
        ]);
    }

    sendQuery(queryStr, callback) {
        var me = this;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "http://localhost:8888/" + queryStr, true);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                callback(me, JSON.parse(xmlhttp.responseText), queryStr);
            }
        }
        xmlhttp.send();
    }

    getStates(me, obj, queryStr) {
        me.traces.setStates(obj);
        me.statesReady = true;
        me.updateData();
    }
    getEvents(me, obj, queryStr) {
        me.traceObjs = obj;
        me.eventsReady = true;
        me.updateData();
    }

    getProfiles(me, obj, queryStr) {
        var flag = (queryStr.substring(9) == "0");
        me.traces.setProfiles(obj, flag);
    }

    setMeasure(measure, isTimer){
        var me = this;
        this.profilevis.setMeasure(measure);
        var profileMaxX = 0;
        this.traces.threads.forEach(function(thread) {
            var thisSum = me.profilevis.init(thread, me.traces.regions, isTimer);
            if (thisSum > profileMaxX) {
                profileMaxX = thisSum;
            }
        });
        this.profilevis.setXAxis(profileMaxX);
        this.traces.threads.forEach(function(thread) {
            me.profilevis.updateThread(thread);
        });
    }
}

var main = new Main();

$('.dropdown-inverse li > a').click(function(e) {
    $('#counter').text(this.innerHTML);
    main.setMeasure(this.innerHTML,false);
});