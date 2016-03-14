HTMLWidgets.widget({
	
	name: "moonplot",
	
	type: "output",
	
	factory: function(el, width, height) {
		
		// create our moonplot obj and bind it to the element
		var mp = new moonplot(el.id);
		
		return {
			renderValue: function(x) {
				
			},
			
			resize: function(width, height) {
				
			}
			
			m: mp
		};
		
	}
});