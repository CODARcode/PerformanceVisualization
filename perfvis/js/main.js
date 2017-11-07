//------------------Global setting of vis web app------
var global_host = "visws.csi.bnl.gov",
    global_port = 8000;

//--------------------Main function--------------------
class Main {
    constructor(host, port) {
        this.sendQuery("overview/", this.initData);//timers of the profiles.
    }

    initData(me, obj, queryStr){
        //set overview data
        var traceArray = [];
        var messageArray = [];
        var nodeNum = 69;
        var timeMax = 4000000;
        var timeUnit = 1000;
        me.timeUnit = timeUnit;

        for(var i = 0; i<nodeNum; i++){
            traceArray.push([]);
        }
        obj.forEach(function(d){
            if(d["node"]==-1){
                messageArray = d["data"];
            }else{
                traceArray[d["node"]] = d["data"];
            }
        });

        me.traces = new Data(nodeNum, traceArray, timeMax, timeUnit);
        me.c20 = d3.scaleOrdinal(d3.schemeCategory20).domain(me.traces.regions);
        me.timerType = 0;
        me.measure = "Calls";


        me.overview = new Overview(me, traceArray, messageArray, timeMax, timeUnit);
        me.detailview = new Detailview(me);
        me.profilevis = new ProfileVis(me);
        me.statisticsvis = new StatisticsVis(me);
        me.stackedBars = new StackedBars(me);
        me.treemaps = new Treemapview(me);
        me.legend = new Legend(me);
        me.profileNum = 6;
        me.sendQuery("profiles/0", me.getProfiles);//timers of the profiles.
        me.sendQuery("profiles/1", me.getProfiles);//counters of the profiles.        
        me.sendQuery("profiles/2", me.getProfiles);//timers of the profiles.
        me.sendQuery("profiles/3", me.getProfiles);//counters of the profiles.        
        me.sendQuery("profiles/4", me.getProfiles);//timers of the profiles.
        me.sendQuery("profiles/5", me.getProfiles);//counters of the profiles.
        
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
    getColor(gid){
        var me = this;
        var key = me.traces.regions[gid];
        if(!key){
            key = "Others";
        }
        return me.c20(key);
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

    updateBrush(extent){
        var me = this;
        var needQuery = false;
        if(extent.nodes.length==0){
            extent.nodes = me.traces.nodeList;//all
        }
        if (extent.x0 == extent.x1) {
            extent.x0 = this.traces.timeStamps.min;
            extent.x1 = this.traces.timeStamps.max;
        }else if(extent.x1 - extent.x0 < me.timeUnit){
            needQuery = true;
        }

        if(needQuery){
            me.sendQuery("messages/" + me.traces.timeStamps.min + ":" + me.traces.timeStamps.max, me.getMessages);//Queries the messages
            me.sendQuery("events/" + me.traces.timeStamps.min + ":" + me.traces.timeStamps.max, me.getEvents);//entry and exit events of the traces.
        }else{
            me.update(extent, false);
        }
    }

    update(extent, detail) {
        var me = this;

        this.detailview.update(extent);
        this.profilevis.update(extent);
        this.statisticsvis.update(extent);

        this.traces.threads.forEach(function(thread,i) {
            thread.clear();
            if(me.traces.nodeList.indexOf(i)!=-1){
                thread.filter(extent);
                me.detailview.tracevis.updateThread(thread, extent, detail);
                me.profilevis.updateThread(thread);
                me.statisticsvis.updateThread(thread);
            }
        });
        this.stackedBars.update(extent);
    }

    initProfiles() {
        var me = this;
        this.detailview.init();

        var profileMaxX = 0;
        this.traces.threads.forEach(function(thread) {
            var thisSum = me.profilevis.init(thread, me.traces.regions, 0);
            if (thisSum > profileMaxX) {
                profileMaxX = thisSum;
            }
            me.statisticsvis.init(thread);
            me.treemaps.updateThread(thread, 0, "Calls");
        });
        me.profilevis.setXAxis(profileMaxX);
    }

    sendQuery(queryStr, callback) {
        var me = this;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", queryStr, true); //"http://localhost:8000/" +
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                callback(me, JSON.parse(xmlhttp.responseText), queryStr);
            }
        }
        xmlhttp.send();
    }
    getEvents(me, obj, queryStr) {
        me.traces.setTraces(obj);
        me.update({x0:me.traces.timeStamps.min,x1:me.traces.timeStamps.max,nodes:me.traces.nodeList}, true)
    }

    getMessages(me, obj, queryStr){
        me.traces.setMessages(obj);
    }

    getProfiles(me, obj, queryStr) {
        me.traces.setProfiles(obj, queryStr.substring(9));
        me.profileNum--;
        if(me.profileNum == 0){
            me.initProfiles();
        }
    }

    setMeasure(measure, timerType){
        var me = this;
        this.profilevis.setMeasure(measure);
        var profileMaxX = 0;
        this.traces.threads.forEach(function(thread) {
            var thisSum = me.profilevis.init(thread, me.traces.regions, timerType);
            if (thisSum > profileMaxX) {
                profileMaxX = thisSum;
            }
        });
        this.profilevis.setXAxis(profileMaxX);
        this.traces.threads.forEach(function(thread) {
            me.profilevis.updateThread(thread);
            me.treemaps.updateThread(thread, timerType, measure);
        });
    }
}

var main = new Main();
$('.vis li > a').click(function(e) {
    $('#vis_type').text(this.innerHTML);
    if(this.innerHTML=="Treemap"){
        $('#Treemaps').show();
        $('#Profiles').hide();
    }else{
        $('#Profiles').show();
        $('#Treemaps').hide();
    }
});
$('.zer li > a').click(function(e) {
    $('#pid').text(this.innerHTML);
    if(this.innerHTML == "NWCHEM Timer"){
        main.timerType = 0;
    }else if(this.innerHTML =="NWCHEM Counter"){
        main.timerType = 1;
    }else if(this.innerHTML =="TAU Timer"){
        main.timerType = 2;
    }else if(this.innerHTML =="TAU Counter"){
        main.timerType = 3;
    }else if(this.innerHTML =="TAU1 Timer"){
        main.timerType = 4;
    }else if(this.innerHTML =="TAU1 Counter"){
        main.timerType = 5;
    }
    if(main.timerType%2==0){
        $('#t_group').show();
        $('#c_group').hide();
    }else{
        $('#t_group').hide();
        $('#c_group').show();
    }

    main.setMeasure(main.measure,main.timerType);
});
$('.fir li > a').click(function(e) {
    $('#timer').text(this.innerHTML);
    main.measure = this.innerHTML;
    main.setMeasure(main.measure,main.timerType);
});
$('.sec li > a').click(function(e) {
    $('#counter').text(this.innerHTML);
    main.measure = this.innerHTML;
    main.setMeasure(main.measure,main.timerType);
});
$(document).ready(function() {  
   $(".dropdown-menu li a")[0].click();
});