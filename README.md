# PerformanceVisualization
This is a visualization framework for Chimbuko. Performance instrumentation using Tau generates traces and profiles for a workflow. This framework provides the visualization of these input and user interactions to understand the performance.

There are four visualiztion components:
* **Overview** shows the summary number of the trace events and messages in different nodes and threads. It allows the user to select a time range of interest.
* **Detailed view** shows the function calls and the messages in the selected time range. The functions are visualized with nested rectangels. The user can further zoom in in this view.
* **Statistical view** shows the execution time of the functions in the selected time range.
* **Profile view** shows the metrics of timers and counters for each nodes and threads.
