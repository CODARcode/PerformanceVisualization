# PerformanceVisualization
This is a visualization framework for Chimbuko. Performance instrumentation using Tau generates traces and profiles for a workflow. This framework provides the visualization of these input and user interactions to understand the performance.

There are four visualiztion components:
* **Overview** shows the summary number of the trace events and messages in different nodes and threads. It allows the user to select a time range of interest.
![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/overview.png "Overview")
* **Detailed view** shows the function calls and the messages in the selected time range. The functions are visualized with nested rectangels. 
![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/traces.png "Detailed trace events")
The user can further zoom in in this view to obtain a zoom-in effect:
![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/traces_details.png "Zoom-in trace events")
* **Statistical view** shows the execution time of the functions in the selected time range.
![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/statistics.png "Statistics")
* **Profile view** shows the metrics of timers and counters for each nodes and threads.
![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/profiles.png "Profiles")
