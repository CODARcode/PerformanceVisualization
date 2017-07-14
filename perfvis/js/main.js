//--------------------Main function--------------------
class Main {
    constructor() {
        this.traces = new Data(5);

        this.c20 = d3.scale.category20().domain(this.traces.regions);
        this.overview = new Overview(this);
        this.detailview = new Detailview(this);
        this.profilevis = new ProfileVis(this);
        this.statisticsvis = new StatisticsVis(this);
        this.legend = new Legend(this);

        this.sendQuery("messages/" + this.traces.timeStamps.min + ":" + this.traces.timeStamps.max, this.getMessages);//Queries the messages
        this.sendQuery("profiles/0", this.getProfiles);//timers of the profiles.
        this.sendQuery("profiles/1", this.getProfiles);//counters of the profiles.
        this.sendQuery("events/" + this.traces.timeStamps.min + ":" + this.traces.timeStamps.max, this.getEvents);//entry and exit events of the traces.
    }

    tickByTime(d){
        if(d>1000000){
            return d/1000000+"s";
        }else if(d>1000){
            return d/1000+"ms";
        }else{
            return d+"\u03BCs";
        }
    }
    getColor(name){
        var me = this;
        return me.c20(states[name]);
    }

    getTwoColor(index){
        if(index%2==0){
            return "Grey";
        }else{
            return "Gainsboro";
        }
    }

    getRegionColor(region){
        var me = this;
        return me.c20(region);
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

        this.detailview.update(brush);
        this.profilevis.update(brush);
        this.statisticsvis.update(brush);

        this.traces.threads.forEach(function(thread) {
            thread.clear();
            thread.filter(brush);
            me.detailview.tracevis.updateThread(thread, brush);
            me.profilevis.updateThread(thread);
            me.statisticsvis.updateThread(thread);
        });
    }

    init() {
        var me = this;
        this.overview.init();
        this.detailview.init();
        //this.overview.drawlegend(this.traces.regions);

        var profileMaxX = 0;
        this.traces.threads.forEach(function(thread) {
            var thisSum = me.profilevis.init(thread, me.traces.regions, false);
            if (thisSum > profileMaxX) {
                profileMaxX = thisSum;
            }
            me.statisticsvis.init(thread);
        });
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
    getEvents(me, obj, queryStr) {
        me.traces.setTraces(obj);
        me.init();    
    }

    getMessages(me, obj, queryStr){
        me.traces.setMessages(obj);
    }

    getProfiles(me, obj, queryStr) {
        me.traces.setProfiles(obj, (queryStr.substring(9) == "0"));
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
$('.fir li > a').click(function(e) {
    $('#timer').text(this.innerHTML);
    main.setMeasure(this.innerHTML,true);
});
$('.sec li > a').click(function(e) {
    $('#counter').text(this.innerHTML);
    main.setMeasure(this.innerHTML,false);
});