var queue = require('../config/queue')
var waiting_queue = require('../config/waiting_queue');
var fontService = require('../service/font');

var schedule = function(){
	if (queue.getCount() < 2 && waiting_queue.getCount() > 0){
		request = waiting_queue.pop_last()
		queue.push(request)
		fontService.startToMakingFont(request)
		console.log('yeap')
	}else{
		console.log('nope')
	}
}