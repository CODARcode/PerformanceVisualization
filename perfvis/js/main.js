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
        var traceArray = obj[0]["traces"];
        var messageArray = obj[0]["messages"];
        var nodeNum = traceArray.length;
        var timeMax = 0;

        traceArray.forEach(function(node){
            node.forEach(function(d){
                var time = parseInt(d["_id"]["max"]);
                if(time>timeMax){
                    timeMax = time;
                }
            });
        });
        me.traces = new Data(nodeNum, timeMax);
        me.c20 = d3.scaleOrdinal(d3.schemeCategory20).domain(me.traces.regions);
        me.timerType = 0;
        me.measure = "Calls";


        me.overview = new Overview(me, traceArray, messageArray, timeMax);
        me.detailview = new Detailview(me);
        me.profilevis = new ProfileVis(me);
        me.statisticsvis = new StatisticsVis(me);
        me.stackedBars = new StackedBars(me);
        me.treemaps = new Treemapview(me);
        me.legend = new Legend(me);

        me.sendQuery("profiles/0", me.getProfiles);//timers of the profiles.
        me.sendQuery("profiles/1", me.getProfiles);//counters of the profiles.        
        me.sendQuery("profiles/2", me.getProfiles);//timers of the profiles.
        me.sendQuery("profiles/3", me.getProfiles);//counters of the profiles.        
        me.sendQuery("profiles/4", me.getProfiles);//timers of the profiles.
        me.sendQuery("profiles/5", me.getProfiles);//counters of the profiles.
        me.initProfiles();
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
        var key = states[name];
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

    set(){
        var me = this;
        me.sendQuery("messages/" + me.traces.timeStamps.min + ":" + me.traces.timeStamps.max, me.getMessages);//Queries the messages
        me.sendQuery("events/" + me.traces.timeStamps.min + ":" + me.traces.timeStamps.max, me.getEvents);//entry and exit events of the traces.
    }

    update(extent) {
        var me = this;
        var fake = false;
        if (extent.x0 == extent.x1) {
            extent.x0 = this.traces.timeStamps.min;
            extent.x1 = this.traces.timeStamps.max;
            fake = true;
        }
        if(extent.nodes.length==0){
            extent.nodes = me.traces.nodeList;//all
        }

        this.detailview.update(extent);
        this.profilevis.update(extent);
        this.statisticsvis.update(extent);

        this.traces.threads.forEach(function(thread,i) {
            thread.clear();
            if(me.traces.nodeList.indexOf(i)!=-1){
                thread.filter(extent);
                me.detailview.tracevis.updateThread(thread, extent);
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
        me.update({x0:0,x1:0,nodes:[]})
    }

    getMessages(me, obj, queryStr){
        me.traces.setMessages(obj);
    }

    getProfiles(me, obj, queryStr) {
        me.traces.setProfiles(obj, queryStr.substring(9));
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