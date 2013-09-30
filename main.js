(function($){
	
//setup
window.main = {};
$(document).ready(function(){ main.init() });
var radius;

//start
main.init = function(){

	main.width = $(window).width();
	main.height = main.width * 0.45;

	radius = d3.scale.sqrt().range([0, ( (5/1100) * main.width )]);

	//svg
	main.svg = d3.select("svg")
    	.attr("width", main.width)
    	.attr("height", main.height)
  		.append("g");

  	main.divide = $('#divide');
  	main.divide.css('top',main.height*0.2).height(main.height * 0.6).hide();

  	main.$tooltip = $('#tooltip');

  	//hover
  	$('svg').hover(

  		function(){
  			main.divide.stop().fadeIn();
  		},
  		function(){
  			main.divide.stop().fadeOut();
  		}

  	)

  	//colors
  	window.colors = {
  		koffie: '#000000',
        espresso: '#af7e38',
        cappuccino: '#696952', 
        warmechoco: '#6b3a1d',  
        warmwater: '#549adc',  
        overig: '#bbbbbb'	 
  	}

  	//positions
  	window.positions = {};
  	window.positions.divided = {
  		left: {
  			x: main.width*0.4,
  			y: main.height/2
  		},
  		right: {
  			x: main.width*0.6,
  			y: main.height/2
  		}
  	}
  	window.positions.together = {
  		left: {
  			x: main.width*0.5,
  			y: main.height/2
  		},
  		right: {
  			x: main.width*0.5,
  			y: main.height/2
  		}
  	}

  	//execute
  	main.prepare();
  	main.makeForce();

};

//prepare data for d3
main.prepare = function(){

	//data
	main.nodes = [];
	main.edges = [];
	main.totals = [];

	//make nodes
	$.each(koffieData, function(group, item){

		main.totals[group] = 0;

		$.each(item, function(key, value){

			// for(var i=0;i<1;i++){
			for(var i=0;i<value;i++){

				//nodes
				main.nodes.push({
					'name': key,
					'group': group,
					'radius': radius(1),
					'color': colors[key],
					'value': value,
				});
				
			}

			if(main.totals[key]){
				main.totals[key] = main.totals[key] + value;
			} else {
				main.totals[key] = value;
			}

			main.totals[group] += value;

		});

	});

	//load correct y
	$.each(main.nodes, function(){
		this.y =  (main.height) * (this.value / main.totals[this.group]);
	});


};

main.makeForce = function(){

	main.force = d3.layout.force()
		.nodes(main.nodes)
		.size([main.width,main.height])
		.on("tick", main.tick)
		.start()

	main.circle = main.svg.selectAll("circle")
		.data(main.nodes)
		.enter().append("circle")
		.attr("r", function(d){ return d.radius; })
		.style("fill", function(d){ return d.color })
		.call(main.force.drag)
		.on('mouseover', main.tooltip)
        .on('mouseout', main.hideTooltip);

	//click
  	$('svg').click(function(){
  		if(!main.divideIt){
  			main.divideIt = true;
  		} else {
  			main.divideIt = false;
  		}
  		main.force.resume();
  	});


};

main.tick = function(e){
	main.circle
		.each(main.collide(e.alpha))
		.each(main.moveToCat(e.alpha))
		.attr("cx", function(d,i) { return d.x; })
		.attr("cy", function(d,i) { return d.y; });
};

main.moveToCat = function(alpha){
	return function(d){
		var center = positions.together[d.group];
		if(main.divideIt) center = positions.divided[d.group];

		//generate y
		var y = main.height * ((d.value / main.totals[d.group])*0.1) + main.height*0.5;

		d.x = d.x + (center.x - d.x) * 0.1 * alpha * 1.5;
		d.y = d.y + (y - d.y) * 0.1 * alpha * 1.9;

	};
};

//from Mike Bostock
main.collide = function(alpha) {
  var quadtree = d3.geom.quadtree(main.nodes);
  return function(d) {
    // var r = d.radius + radius.domain()[1] + padding,
    var r = d.radius + radius.domain()[1],
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            // r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
            r = d.radius + quad.point.radius + (d.color !== quad.point.color);
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2
          || x2 < nx1
          || y1 > ny2
          || y2 < ny1;
    });
  };
}

main.tooltip = function(d, i){

	var x = d3.select(this).attr('cx');
	x = parseInt(x) - ( d3.select(this).attr('r')/2);
	var y = d3.select(this).attr('cy');
	y = parseInt(y) - 55;

	var text = d.name;

	if(main.divideIt){
		text += ' ('+Math.round((d.value / main.totals[d.group])*100)+'%)';
	} else {
		text += ' ('+Math.round((d.value / main.totals[d.name])*100)+'%)';
	}

	main.$tooltip
		.css({
		'left': parseInt(x) + 'px',
		'top': parseInt(y) + 'px'
	})
		.stop()
		.fadeIn();

	main.$tooltip.find('.content')
		.text(text);

};

main.hideTooltip = function(){
	main.$tooltip.stop().fadeOut();
}

var radius = d3.scale.sqrt().range([0, ( (5/1150) * main.width )]);

	
}(jQuery));
