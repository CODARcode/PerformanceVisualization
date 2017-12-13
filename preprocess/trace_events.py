#optional for translate stimestamp string to int
import json
import string
from pprint import pprint

def loadStateMap(state_map):
	group = {}
	group['TAU_USER'] = 2
	group['TAU_DEFAULT'] = 3
	group['MPI'] = 4
	group['Others'] = 5
	with open('states.json') as data_file:
		states = json.load(data_file)
	for i, obj in enumerate(states):
		#print obj
		if states[obj] != 'TAU_CALLPATH':
			state_map[obj.strip()] = group[states[obj]]

def getEdges(path,index,offset):
	with open(path+str(index)+'.json') as data_file:
		data = json.load(data_file)
	
	state_map = {}
	if 'states' in data:
		for i,obj in enumerate(data['states']):
			state_map[obj['name'].strip()] = obj['group-id']
	else:
		loadStateMap(state_map)
		print "loaded states!", len(state_map)
	state_map["MPI_Allgather()"] = 6
	state_map["MPI_Barrier()"] = 7

	f = open('trace_events/trace.'+str(index+offset)+'.json', 'w')
	print>>f,"["
	for i, obj in enumerate(data['trace events']):
		if 'name' in obj:
			this_name = obj['name'].strip()
			group_id = 0
			if(this_name in state_map):
				group_id = int(state_map[this_name])
			obj['group-id'] = group_id
			if group_id==1:
				print "id is 1: ", this_name
			obj['name'] = this_name
		
		if 'node-id' in obj:
			obj['node-id'] = int(obj['node-id'])+offset
		elif 'destination-node-id' in obj and 'source-node-id' in obj:
			obj['destination-node-id'] = int(obj['destination-node-id'])+offset
			obj['source-node-id'] = int(obj['source-node-id'])+offset
		else:
			print obj

		if 'time' in obj:
			obj['time'] = int(float(obj['time']))
		elif 'timestamp' in obj:
			obj['time'] = int(float(obj['timestamp']))
		else:
			print obj

		print>>f,json.dumps(obj),","
	print >>f,"{ }]"
	f.close()

for i in range(0,6):
	getEdges('nwchem/trace_events_',i,64)
for i in range(0,64):
	getEdges('lammps_traces_vis/trace.',i,0)
