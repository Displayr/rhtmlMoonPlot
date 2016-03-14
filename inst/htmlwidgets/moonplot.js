HTMLWidgets.widget({
	
	name: "moonplot",
	
	type: "output",
	
	initialize: function(el, width, height) {
	  
	},
	
	resize: function(el, width, height, instance) {
	  
	},
	
	renderValue: function(el, x, instance) {
    var svgContainer = d3.select("body").append("svg")
                                        .attr("width", 200)
                                        .attr("height", 200);	
    
    
    var textnode = document.createTextNode("water");    
    //svgContainer.append("circle")
    //            .attr("cx", 30)
    //            .attr("cy", 30)
    //            .attr("r", 20);
	  
	  el.id = svgContainer.append("circle")
	                      .attr("cx", 30)
	                      .attr("cy", 30)
	                      .attr("r", 20);
	                      
	  el.appendChild(textnode);
	}
});