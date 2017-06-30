//used in the transition visualization
class Link{
	constructor(threadid1, threadid2, weight){
		this.source = threadid1;
		this.target = threadid2;
		this.value = weight;
	}
}