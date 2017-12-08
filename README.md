# Performance Visualization 0.1 Release (Dec 2017)

# Overview
This is a visualization framework for Chimbuko performance evaluation based on TAU instrumentation to collect traces and profiles for workflow executions. This framework provides the visualization of these input and user interactions to understand the overall performance. We also test the initial result from anomaly detection and visualize that to our dashboard.

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

# Installation
Software Dependency: Our framework is a Web Socket application. The front end is implemented in Javascript using D3.js library. Node.js is used as back end server that connects to a MongoDB database for data management. Before execution, the data in json format must be generated and import to MongoDB. <span style="color:blue">An example of how to import the json file is included.</span>

# Run
Software execution:
* Run MongoDB server to enable database access, and connect to our imported data *mongodbdata*:
```
mongod --dbpath mongodbdata
```
* Link the mongodb module to Node.js:
```
npm link mongodb
```
* Download the repo and go to the *perfvis* directory to start the back end:
```
node server.js
```
* Open any web browser, type the url with port number to start the front end.

# Interface Description
There are five visualization components:
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
