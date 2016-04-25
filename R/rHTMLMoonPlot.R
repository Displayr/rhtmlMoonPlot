#' MoonPlot
#'
#' Uses correspondence analysis to create a Moon Plot
#'
#' @import htmlwidgets
#'
#' @export
moonplot <- function(
  coreNodes=NULL,surfaceNodes=NULL,
  width = NULL,
  height = NULL) {

  data.lunarCoreNodes <- toJSON(coreNodes)
  data.lunarCoreLabels <- toJSON(labels(coreNodes)[[1]])
  data.lunarSurfaceNodes <- toJSON(surfaceNodes)
  data.lunarSurfaceLabels <- toJSON(labels(surfaceNodes)[[1]])

  # forward options using x
  x = list(
    lunarCoreNodes = data.lunarCoreNodes,
    lunarCoreLabels = data.lunarCoreLabels,
    lunarSurfaceNodes = data.lunarSurfaceNodes,
    lunarSurfaceLabels = data.lunarSurfaceLabels
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'moonplot',
    x,
    width = width,
    height = height,
    package = 'moonplot'
  )
}
