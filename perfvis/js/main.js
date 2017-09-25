//------------------Global setting of vis web app------
var global_host = "visws.csi.bnl.gov",
    global_port = 8888;

//--------------------Main function--------------------
class Main {
    constructor(host, port) {
        this.host = host;
        this.port = port;

        this.traces = new Data(5);

        this.c20 = d3.scale.category20().domain(this.traces.regions);
        this.overview = new Overview(this);
        this.detailview = new Detailview(this);
        this.profilevis = new ProfileVis(this);
        this.statisticsvis = new StatisticsVis(this);
        this.stackedBars = new StackedBars(this);
        this.treemaps = new Treemapview(this);
        this.legend = new Legend(this);

        this.sendQuery("profiles/0", this.getProfiles);//timers of the profiles.
        this.sendQuery("profiles/1", this.getProfiles);//counters of the profiles.        
        this.sendQuery("profiles/2", this.getProfiles);//timers of the profiles.
        this.sendQuery("profiles/3", this.getProfiles);//counters of the profiles.        
        this.sendQuery("profiles/4", this.getProfiles);//timers of the profiles.
        this.sendQuery("profiles/5", this.getProfiles);//counters of the profiles.
                
        //this.sendQuery("messages/" + this.traces.timeStamps.min + ":" + this.traces.timeStamps.max, this.getMessages);//Queries the messages
        //this.sendQuery("events/" + this.traces.timeStamps.min + ":" + this.traces.timeStamps.max, this.getEvents);//entry and exit events of the traces.
        this.init();

        this.timerType = 0;
        this.measure = "Calls";
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

    set(){
        var me = this;
        me.sendQuery("messages/" + me.traces.timeStamps.min + ":" + me.traces.timeStamps.max, me.getMessages);//Queries the messages
        me.sendQuery("events/" + me.traces.timeStamps.min + ":" + me.traces.timeStamps.max, me.getEvents);//entry and exit events of the traces.
        
    }

    update(extent) {
        var me = this;
        var fake = false;
        if (extent[0][0] == extent[1][0]) {
            extent[0][0] = this.traces.timeStamps.min;
            extent[1][0] = this.traces.timeStamps.max;
            extent[0][1] = 0;
            extent[1][1] = this.traces.threads.length - 1;
            fake = true;
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

        this.traces.threads.forEach(function(thread,i) {
            thread.clear();
            thread.filter(brush);
            me.detailview.tracevis.updateThread(thread, brush);
            me.profilevis.updateThread(thread);
            me.statisticsvis.updateThread(thread);
        });
        this.stackedBars.update(brush);
    }

    init() {
        var me = this;
        //this.overview.init();
        this.detailview.init();
        //this.overview.drawlegend(this.traces.regions);

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
        xmlhttp.open("GET", "http://" + me.host + ":" + me.port + "/" + queryStr, true);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                callback(me, JSON.parse(xmlhttp.responseText), queryStr);
            }
        }
        xmlhttp.send();
    }
    getEvents(me, obj, queryStr) {
        me.traces.setTraces(obj);
        me.update([[0, 0],[0, 0]])
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

var main = new Main(global_host, global_port);
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