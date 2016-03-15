HTMLWidgets.widget({
	
	name: "moonplot",
	
	type: "output",
	
	initialize: function(el, width, height) {
	  var xlabels = ["Coke", "V", "Red Bull", "Lift Plus", "Diet Coke", "Fanta", "Lift", "Pepsi"];
	  
	  
	  var xCoords1 = [-0.24883943,
	                  0.44569980,
	                  0.46998036,
	                  0.47185128,
	                  -0.09772208,
	                  -1.26063599,
	                  -0.49093411,
	                  -0.26108416
	                 ];
	                 
    var xCoords2 = [
      -0.2010188,
      0.1067263,
      0.1311230,
      0.1528544,
      -0.5236680,
      0.4705187,
      -0.5165743,
      -0.2601922
    ];	                 
	                 
	  
	  var svgContainer = d3.select("body").append("svg")
                                        .attr("width", width)
                                        .attr("height", height);	
    
    
    //var textnode = document.createTextNode(x.message);    

	  var xCenter = 200;
	  var yCenter = 200;
	  var radius = 200;
	  svgContainer.append("circle")
	              .attr("cx", xCenter)
	              .attr("cy", yCenter)
	              .attr("r", radius)
	              .style("fill", "green")
	              .style("stroke", "red")
	              .style("fill-opacity", 0.2);
	              
	  
    for(var i = 0; i < xlabels.length; i++) {
      
      if (xCoords1[i] < -1) {
        xCoords1[i] = -1;
      }
      
      var x = xCoords1[i]*radius + xCenter;
      var y = -xCoords2[i]*radius + yCenter;
      
      
  	  svgContainer.append("text")
  	              .style("fill", "black")
  	              .attr("x", x)
  	              .attr("y", y)
  	              .text(xlabels[i]);
    }
	  
	              
	 
	  el.id = svgContainer;
	},
	
	resize: function(el, width, height, instance) {
	  
	},
	
	renderValue: function(el, x, instance) {
    
	}
});