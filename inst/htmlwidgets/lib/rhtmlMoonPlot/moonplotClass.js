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
    drawCircle(this.data, svg, xCenter, yCenter, radius, this.height, this.width);
    drawLunarCoreLabels(this.data.lunarCoreLabels, svg, xCenter, yCenter, radius);
    return drawLunarSurfaceLabels(this.data.lunarSurfaceLabels, svg, xCenter, yCenter, radius, this.height, this.width);
  };

  MoonPlot.prototype.redraw = function(width, height, el) {
    this.width = width;
    this.height = height;
    d3.select('.moonplot-container').remove();
    return this.draw(this.data, el);
  };

  return MoonPlot;

})();
