//The server file starts a mongodb client, queries the mongodb, and return the json objects to the front end.
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var dburl = "mongodb://localhost:27017/codarvis";

http.createServer(function(request, response) {
    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);
    //console.log(uri);

    if (uri.substring(0, 10) == "/overview/"){
        query("summary",{},response);
    }else if (uri.substring(0, 10) == "/messages/"){
        var strArray = uri.substring(10).split(":");
        //console.log(strArray[0] + ", " + strArray[1] + ", " + strArray[2]);
        var numArray = strArray[2].split(",").map(Number);
        query("trace_events",{$and:[{$and:[{"source-node-id": {$in: numArray}}, {"destination-node-id": {$in: numArray}}]}, {$or:[{"event-type":"send"},{"event-type":"receive"}]},{time:{$gte:parseInt(strArray[0]),$lte:parseInt(strArray[1])}}]},response);
        //var timestamps = uri.substring(10).split(":");
        //query("trace_events",{$and:[{$or:[{"event-type":"send"},{"event-type":"receive"}]},{time:{$gte:parseInt(timestamps[0]),$lte:parseInt(timestamps[1])}}]},response);
    } else if (uri.substring(0, 8) == "/events/"){
        var strArray = uri.substring(8).split(":");
        //console.log(strArray[0] + ", " + strArray[1] + ", " + strArray[2]);
        var numArray = strArray[2].split(",").map(Number);
        query("trace_events",{$and:[{"node-id": {$in: numArray}}, {$or:[{"event-type":"entry"},{"event-type":"exit"}]},{time:{$gte:parseInt(strArray[0]),$lte:parseInt(strArray[1])}}]},response);
        //var timestamps = uri.substring(8).split(":");
        //query("trace_events",{$and:[{$or:[{"event-type":"entry"},{"event-type":"exit"}]},{time:{$gte:parseInt(timestamps[0]),$lte:parseInt(timestamps[1])}}]},response);
    } else if (uri.substring(0, 10) == "/profiles/"){
        if(uri.substring(10) == "0"){
            query("timers",{},response);
        }else if(uri.substring(10) == "1"){
            query("counters",{},response);
        }/*else if(uri.substring(10) == "2"){
            query("timers1",{},response);
        }else if(uri.substring(10) == "3"){
            query("counters1",{},response);
        }else if(uri.substring(10) == "4"){
            query("timers2",{},response);
        }else if(uri.substring(10) == "5"){
            query("counters2",{},response);
        }*/
    } else {
        fs.exists(filename, function(exists) {
            if (!exists) {
                response.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                response.write("404 Not Found\n");
                response.end();
                return;
            }
            if (fs.statSync(filename).isDirectory()) filename += '/index.html';
            fs.readFile(filename, "binary", function(err, file) {
                if (err) {
                    response.writeHead(500, {
                        "Content-Type": "text/plain"
                    });
                    response.write(err + "\n");
                    response.end();
                    return;
                }
                response.writeHead(200);
                response.write(file, "binary");
                response.end();
            });
        });
    }

    //read in anomaly csv filename list
    var csv_path = process.cwd() + "/outliers";
    fs.readdir(csv_path, function(err, items) {
        console.log(items.length);

        for (var i = 0; i < items.length; i++) {
            console.log(items[i]);
        }
    });

}).listen(8000, "0.0.0.0"); //listen from public by adding "0.0.0.0"


function query(dbName, queryObj, response){
    MongoClient.connect(dburl, function(err, db) {
        if (err) throw err;
        db.collection(dbName).find(queryObj).sort( { "time": 1 } ).toArray(function(err, result) {
            if (err) throw err;
            response.writeHead(200, {
                "Content-Type": "text/json"
            });
            response.end(JSON.stringify(result));
            console.log("Get "+result.length+" documents from "+dbName);
            db.close();
        });
    });
}

console.log("Server running on visws.csi.bnl.gov:8000");
