class MoonPlot
  constructor: (@width, @height) ->

  draw: (@data) ->
    svg = d3.select('body')
                     .append('svg')
                     .attr('width', @width)
                     .attr('height', @height)
                     .attr('class', 'moonplot-container')
    xCenter = @width /2
    yCenter = @height /2
    radius = Math.min(@height, @width) / 3

    drawCircle(svg, xCenter, yCenter, radius, @height, @width)
    drawLunarCoreLabels(@data.lunarCoreLabels, svg,
                        xCenter,yCenter,radius)
    drawLunarSurfaceLabels(@data.lunarSurfaceLabels,svg,
                          xCenter,yCenter,radius,@height,@width)

  redraw: (@width, @height) ->
    d3.select('.moonplot-container').remove()
    @draw(@width, @height)
