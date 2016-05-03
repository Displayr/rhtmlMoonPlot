var MoonPlot;

MoonPlot = (function() {
  function MoonPlot(width, height) {
    this.width = width;
    this.height = height;
  }

  MoonPlot.prototype.draw = function(data, el) {
    var radius, svg, xCenter, yCenter;
    this.data = data;
    svg = d3.select(el).append('svg').attr('width', this.width).attr('height', this.height).attr('class', 'moonplot-container');
    xCenter = this.width / 2;
    yCenter = this.height / 2;
    radius = Math.min(this.height, this.width) / 3;
    this.textColor = '#333333';
    this.circleColor = '#042a4b';
    this.crossColor = 'grey';
    drawCircle(this.data, svg, xCenter, yCenter, radius, this.height, this.width, this.circleColor, this.crossColor, this.textColor);
    drawLunarCoreLabels(this.data.lunarCoreLabels, svg, xCenter, yCenter, radius, this.textColor);
    return drawLunarSurfaceLabels(this.data.lunarSurfaceLabels, svg, xCenter, yCenter, radius, this.height, this.width, this.textColor);
  };

  MoonPlot.prototype.redraw = function(width, height, el) {
    this.width = width;
    this.height = height;
    d3.select('.moonplot-container').remove();
    return this.draw(this.data, el);
  };

  return MoonPlot;

})();
