class MoonPlot
  constructor: (@width, @height) ->

  draw: (@data, el) ->
    svg = d3.select(el)
            .append('svg')
            .attr('width', @width)
            .attr('height', @height)
            .attr('class', 'moonplot-container')
    xCenter = @width / 2
    yCenter = @height / 2
    radius = Math.min(@height, @width) / 3

    # Styling
    @textColor = '#333333'
    @circleColor = '#042a4b'
    @crossColor = 'grey'
    @linkWidth = 1

    drawCircle(@data, svg, xCenter, yCenter, radius, @height, @width, @circleColor, @crossColor, @textColor)

    drawLunarCoreLabels(@data.lunarCoreLabels, svg,
                        xCenter,yCenter,radius, @textColor, @linkWidth)
    drawLunarSurfaceLabels(@data.lunarSurfaceLabels,svg,
                          xCenter,yCenter,radius,@height,@width, @textColor, 14)


  redraw: (@width, @height, el) ->
    d3.select('.moonplot-container').remove()
    @draw(@data, el)
