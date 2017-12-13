# Performance Visualization 0.1 Release (Dec 2017)

# Overview
This is a visualization framework for Chimbuko performance evaluation based on TAU instrumentation to collect traces and profiles for workflow executions. This framework provides the visualization of these input and user interactions to understand the overall performance. We also complete the initial design to visualize the result of anomaly detection.

We visualize five major types of performance information:
* trace function call events in execution time
* trace messages send/receive events among nodes/cores
* file transfer events among nodes/cores
* profile with different metrics
* outlier visualization (test phase)

We provide four levels of details for trace visualization:
* overview level -- showing general event heatmap
* trace call group level -- showing aggregated function call events based on call groups.  
* trace detail level -- showing real function execution in a selected range of time for selected node/core.
* node detail level -- showing an alternative cascaded view of the selected trace function execution. 

Our current release is for offline workflow examples. However, our front end that contains majority of functionalities is independent and well prepared for online access. The back end storage MongoDB can be replaced when the online data acess API is ready.

# Software Dependency 
Our framework is a Web Socket application. The front end is implemented in Javascript using D3.js library. Node.js is used as back end server that connects to a MongoDB database for data management. Before execution, some data preprocessing must be done, and the data in json format must be generated and imported to MongoDB.

# Data Dependency
The user specifies some input settings under `perfvis/js/configure.json`. As input data, we rely on both TAU and the analysis routine to generate a few json(csv) files.  We summarize them as below:
* `trace.*.json` files for `trace` data, which contain major trace events `entry`, `exit`, `send` and `receive`.
* `profile.json` file for `profile` data, which contains various metrics such as `timer` and `counter`.
* `*.csv` outlier files from analysis routine under `perfvis/outliers`, which contains normal and abnormal function calls of different job IDs.

# Preprocessing
The `preprocess` directory includes the scripts to generate data for the main routine and import corresponding data into the database.

* Precompute `summary` data for the *overview* panel of the visualization by running:
```
python summary.py
```
This python script generates `summary.json` which will later be imported to MongoDB. 

* Import json files to MongoDB as collections by running the following bash script. Users need to modify the setting (number of json files, etc.) in the script:
```
./import.sh
```
In specific, `summary.json` is imported to `summary` collection, `trace.*.json` is imported to `trace_events` collection, `profile.json` is imported to `counters` and `timers` collections respectively.

# Run
Software execution:
* Run MongoDB server to enable database access, and connect to our imported data `mongodbdata` where our database including the collections are stored:
```
mongod --dbpath mongodbdata
```
* Link the mongodb module to Node.js:
```
npm link mongodb
```
* Download the repo and go to the `perfvis` directory to start the back end:
```
node server.js
```
* Open any web browser that supports D3.js (we recommend Chrome, Firefox or Safari, but don't recommend IE), type the url with port number to start the front end. In our case, the url:port is `visws.csi.bnl.gov:8000` as the main url for the trace and profile information. For the anomaly detection, since it is still an initial result, we put that as a separte webpage `visws.csi.bnl.gov:8000/anomaly.html`. If you want to change the url or port, simply modify that in the first two lines of `perfvis/js/main.js` file:
```javascript
var global_host = "visws.csi.bnl.gov",
    global_port = 8000;
```

# Interface Description
There are five visualization components: *overview*, *trace view*, *node view*, *profile view* and *anomaly view*. We use a composition of LAMMPS and NWCHEM examples to illustrate their functionalities.

* **Overview** shows the summary of the whole workflow execution. The trace events indicating the start and end time of each function call is shown in a timeline. The intensity shows the depth of the call path. We also visualized the message counts (sent or received) in a separate histogram view along the timeline. For the interaction, it allows the user to select a time range of interest and see more details in the detailed view panel. In this example, we visualized a parallel workflow running on 69 nodes/threads. Flow diagrams indicate the file transfers among nodes.

![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/overview.png "Overview")

* **Trace view** shows the statistics of function calls and the messages in the selected time range, with respect to the groupings defined by Tau or the user. Stacked graphs are used to indicate the accumulated time spent in each call group. 

![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/traces.png "Trace events")

The user can select only interested groups by clicking on the group names in the legend. In this view, users can also select only their interested nodes.

![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/traces_toggled.png "Toggle trace events")

When zooming into certain granularity, the actual function calls are visualized with nested rectangels that indicate their depthes in the call path. They are colored according to different call groups. Additionally, we visualized the message passing (send and receive) between functions. 

![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/trace_details_zoomin.png "Zoom-in trace events")

* **Node view** shows the "drop down" execution of the functions in the selected time range and node. This view provides a clear comparison from the trace view in a nested structure.

![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/node_detail.png "Node details")

* **Profile view** shows the metrics of timers and counters for each nodes and threads of the workflow.

![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/profile.png "Profile")

* **Anomaly view** show the anomaly detection result from the analysis stage (Anomaly detection of function calls, now as a separate webpage). 

There are two modes: regular and aggregation modes. The former one plots all the *normal* and *abnormal* calls as small circles in the scatterplot. The latter one aggregates nearby *normal* calls into a single circle where its size reflects the number of calls inside the circle. The plots for *abnormal* calls remain unchanged. In both modes, the anomaly calles are highlighted in colors reflecting the node/core IDs, while the normal ones are in gray. We also support mouse hovering to show the node/core ID of a circle, or its included number of calls when it is an aggregated circle.

Regular mode:
![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/anomaly.png "Anomaly")

Aggregated mode:
![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/anomaly_aggregation.png "Anomaly when aggregated")
