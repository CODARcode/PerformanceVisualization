#this file summarize the distribution statistics for all the trace_events: lammps and NWCHEM
import json
import string
from pprint import pprint

#add summary for message events
message_histo = [0]*6292

def getEdges(index, max_time):
	with open('trace_events/trace.'+str(index)+'.json') as data_file:    
	    data = json.load(data_file)
	unit = 1000  #time unit for statistics

	print(len(data))
	time_series = []
	stack = []
	group_len = 8
	for i in range(0,group_len):
		time_series.append([0] * (max_time//unit))
		stack.append([])
	
	t = -1 # current time unit slot
	i = 0
	while i<len(data):
		obj = data[i]
		if not 'name' in obj:
			message_histo[obj['time']//unit]+=1
			i+=1;
			continue
		this_name = obj['name']
		this_time = obj['time']
		this_type = obj['event-type']
		group_id = obj['group-id']
		
		if this_time>=(t+1)*unit:
			t+=1
			if t >= (max_time//unit):
				break
			for j in range(0,group_len):
				time_series[j][t] = len(stack[j]) * unit
			continue;
		i+=1
		
		if this_type=="entry":
			time_series[group_id][t] += (unit*(t+1) - this_time)
			stack[group_id].append(this_name)
		elif this_type == "exit":
			if(stack[group_id][-1]!=this_name):
				print "wrong "+this_name
			stack[group_id].pop()
			time_series[group_id][t] -= (unit*(t+1) - this_time)
		elif this_type != "counter":
			print "not entry or exit", obj
	f = open('summary.json', 'a')
	print >>f,time_series,","
	f.close()


f = open('summary.json', 'a')
print >>f,"{\"trace_events\":["
f.close()
for i in range(0,64):
	getEdges(i, 4000000)
	print "finish",i
for i in range(64,70):
	getEdges(i, 6292000)
	print "finish",i
f = open('summary.json', 'a')
print >>f,"],"
print >>f,"\"messages\":"
print >>f,message_histo
print >>f,"}"
f.close()