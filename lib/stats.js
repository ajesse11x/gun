var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('opt', function(root){
	this.to.next(root);
	if(root.once){ return }
	if(typeof process === 'undefined'){ return }
	if(typeof require === 'undefined'){ return }
	var noop = function(){};
	var os = require('os') || {};
	var fs = require('fs') || {};
	fs.existsSync = fs.existsSync || require('path').existsSync;
	if(!fs.existsSync){ return }
	if(!process){ return }
	process.uptime = process.uptime || noop;
	process.cpuUsage = process.cpuUsage || noop;
	process.memoryUsage = process.memoryUsage || noop;
	os.totalmem = os.totalmem || noop;
	os.freemem = os.freemem || noop;
	os.loadavg = os.loadavg || noop;
	os.cpus = os.cpus || noop;
	setTimeout(function(){
		root.stats = Gun.obj.ify((fs.existsSync(__dirname+'/../stats.'+root.opt.file) && fs.readFileSync(__dirname+'/../stats.'+root.opt.file).toString())) || {};
		root.stats.up = root.stats.up || {};
		root.stats.up.start = root.stats.up.start || +(new Date);
		root.stats.up.count = (root.stats.up.count || 0) + 1;
	},1);
	setInterval(function(){
		if(!root.stats){ return }
		var stats = root.stats, tmp;
		(stats.up||{}).time = process.uptime();
		stats.memory = process.memoryUsage() || {};
		stats.memory.totalmem = os.totalmem();
		stats.memory.freemem = os.freemem();
		stats.cpu = process.cpuUsage() || {};
		stats.cpu.loadavg = os.loadavg();
		stats.peers = {};
		stats.peers.count = Object.keys(root.opt.peers||{}).length;
		stats.node = {};
		stats.node.count = Object.keys(root.graph||{}).length;
		fs.writeFile(__dirname+'/../stats.'+root.opt.file, JSON.stringify(stats, null, 2), function(err){});
	}, 1000 * 15);
	Object.keys = Object.keys || function(o){ return Gun.obj.map(o, function(v,k,t){t(k)}) }
});