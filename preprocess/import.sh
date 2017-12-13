for i in {0..69}
do
	echo $i
	mongoimport --db codarvis --collection trace_events --file "trace."$i".json" --jsonArray
done

mongoimport --db codarvis --collection summary --file "summary.json" --jsonArray
