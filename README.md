# Performance Visualization
This is a visualization framework for Chimbuko. Performance instrumentation using Tau to generate traces and profiles for a workflow. This framework provides the visualization of these input and user interactions to understand the performance.

There are four visualization components:
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
