class MoonPlot
  constructor: (@width, @height) ->

  draw: (@data, el) ->
    svg = d3.select(el)
                     .append('svg')
                     .attr('width', @width)
                     .attr('height', @height)
                     .attr('class', 'moonplot-container')
    xCenter = @width /2
    yCenter = @height /2
    radius = Math.min(@height, @width) / 3

    drawCircle(@data, svg, xCenter, yCenter, radius, @height, @width)

    drawLunarCoreLabels(@data.lunarCoreLabels, svg,
                        xCenter,yCenter,radius)
    drawLunarSurfaceLabels(@data.lunarSurfaceLabels,svg,
                          xCenter,yCenter,radius,@height,@width)


  redraw: (@width, @height, el) ->
    d3.select('.moonplot-container').remove()
    @draw(@data, el)
