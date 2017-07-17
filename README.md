# PerformanceVisualization
This is a visualization framework for Chimbuko. Performance instrumentation using Tau to generate traces and profiles for a workflow. This framework provides the visualization of these input and user interactions to understand the performance.

There are four visualization components:
* **Overview** shows the summary of the whole workflow execution. The trace events indicating the start and end time of each function call is shown in a timeline. The intensity shows the depth of the call path. We also visualized the message counts (sent or received) in a separate histogram view along the timeline. For the interaction, it allows the user to select a time range of interest and see more details in the detailed view panel. In this example, we visualized a parallel workflow running on five nodes/threads.
![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/overview.png "Overview")
* **Detailed view** shows the function calls and the messages in the selected time range. The functions are visualized with nested rectangels that indicate their depthes in the call path. We use different transparency for overlapped functions. They are colored according to different call groups. Additionally, we visualized the message passing (send and receive) between functions. 
![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/traces.png "Detailed trace events")
The user can further zoom in in this view to obtain a zoom-in effect. In this mode, we add the stroke of the rectangle to enhance the separation of different functions. 
![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/traces_details.png "Zoom-in trace events")
* **Statistical view** shows the accumulated execution time of the functions in the selected time range and nodes.
![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/statistics.png "Statistics")
* **Profile view** shows the metrics of timers and counters for each nodes and threads.
![alt text](https://github.com/CODARcode/PerformanceVisualization/blob/master/snapshots/profiles.png "Profiles")
