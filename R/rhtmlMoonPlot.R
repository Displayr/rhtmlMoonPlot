#' rhtmlMoonPlot
#'
#' Uses correspondence analysis to create a Moon Plot
#'
#' @author Po Liu <pliu0771@uni.sydney.edu>
#'
#' @source https://github.com/NumbersInternational/rhtmlMoonPlot
#'
#' @param coreNodes Coordinates of nodes in the center of the moon
#' @param surfaceNodes Coordinates of nodes outside of the moon
#' @param width Width of the viewer window
#' @param height Height of viewer window
#'
#' @import htmlwidgets
#'
#' @export
moonplot <- function(
  coreNodes=NULL,surfaceNodes=NULL,
  width = NULL,
  height = NULL) {

  data.lunarCoreNodes <- jsonlite::toJSON(coreNodes)
  data.lunarCoreLabels <- jsonlite::toJSON(labels(coreNodes)[[1]])
  data.lunarSurfaceNodes <- jsonlite::toJSON(surfaceNodes)
  data.lunarSurfaceLabels <- jsonlite::toJSON(labels(surfaceNodes)[[1]])

  # forward options using x
  x = list(
    lunarCoreNodes = data.lunarCoreNodes,
    lunarCoreLabels = data.lunarCoreLabels,
    lunarSurfaceNodes = data.lunarSurfaceNodes,
    lunarSurfaceLabels = data.lunarSurfaceLabels
  )

  # create widget
  htmlwidgets::createWidget(
    name = "rhtmlMoonPlot",
    x,
    width = width,
    height = height,
    sizingPolicy = htmlwidgets::sizingPolicy(
            padding = 5,
            browser.fill = TRUE, # resizing will not work if FALSE
            viewer.fill = TRUE
        ),
    package = "rhtmlMoonPlot"
  )
}
