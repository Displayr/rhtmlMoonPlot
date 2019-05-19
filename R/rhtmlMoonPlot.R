#' rhtmlMoonPlot
#'
#' Uses correspondence analysis to create a Moon Plot
#'
#' @author Po Liu <po.liu@displayr.com>
#'
#' @source https://github.com/Displayr/rhtmlMoonPlot
#'
#' @param coreNodes : Coordinates of nodes in the center of the moon (assumes coreNodes is transformed output of MASS::corresp then $rscore[, 1:2])
#' @param surfaceNodes : Coordinates of nodes outside of the moon (assumes surfaceNodes is transformed output of MASS::corresp then $cscore[, 1:2])
#' @param core.font.family : Font family for core labels
#' @param core.font.size : Font size for core labels
#' @param core.font.color : Font color for core labels
#' @param core.font.selected.color : Font color for core labels while it is being moved
#' @param core.label.minimumDistance : Relative minimum distance between core labels. Larger numbers, more minimum distance
#' @param surface.font.family : Font family for surface labels
#' @param surface.font.baseSize : Base font size for surface labels. Actual font size is a multiplier applied to this base.
#' @param surface.font.color : Font color for surface labels
#' @param surface.font.selected.color : Font color for surface labels while it is being moved
#' @param surface.label.minimumDistance : Relative minimum distance between surface labels. Larger numbers, more minimum distance
#' @param surface.label.radialPadding : Padding between the circle and the surface label
#' @param circle.width : The width of the circle circumference line
#' @param circle.color : The color of the circle circumference line
#' @param circle.cross.color : The color of the crosshairs that mark the center of the circle
#' @param link.color : The color of the label links
#' @param link.width : The width of the label links
#'
#' @import htmlwidgets
#'
#' @export
moonplot <- function(
  coreNodes = NULL,
  surfaceNodes = NULL,
  core.font.family = 'sans-serif',
  core.font.size = 14,
  core.font.color = '#333333',
  core.font.selected.color = '#0000dd',
  core.label.minimumDistance = 7,
  surface.font.family = 'sans-serif',
  surface.font.baseSize = 14,
  surface.font.color = '#333333',
  surface.font.selected.color = '#0000dd',
  surface.label.minimumDistance = 15,
  surface.label.radialPadding = 3,
  circle.width = 1,
  circle.color = '#042a4b',
  circle.cross.color = 'grey',
  link.color = 'grey',
  link.width = 1
) {

  x = list(
    coreLabels = labels(coreNodes)[[1]],
    surfaceLabels = labels(surfaceNodes)[[1]],
    coreNodes = coreNodes,
    surfaceNodes = surfaceNodes,
    coreLabelFontFamily = core.font.family,
    coreLabelFontSize = core.font.size,
    coreLabelFontColor = core.font.color,
    coreLabelFontSelectedColor = core.font.selected.color,
    coreLabelMinimumLabelDistance = core.label.minimumDistance,
    surfaceLabelFontFamily = surface.font.family,
    surfaceLabelFontBaseSize = surface.font.baseSize,
    surfaceLabelFontColor = surface.font.color,
    surfaceLabelFontSelectedColor = surface.font.selected.color,
    surfaceLabelMinimumLabelDistance = surface.label.minimumDistance,
    surfaceLabelRadialPadding = surface.label.radialPadding,
    circleStrokeWidth = circle.width,
    circleColor = circle.color,
    crossColor = circle.cross.color,
    linkColor = link.color,
    linkWidth = link.width
  )

  htmlwidgets::createWidget(
    name = "rhtmlMoonPlot",
    x,
    width = 600, # width is ignored, but must be passed or htmlwidgets has issues
    height = 600, # height is ignored, but must be passed or htmlwidgets has issues
    sizingPolicy = htmlwidgets::sizingPolicy(
        padding = 0,
        browser.fill = TRUE, # resizing will not work if FALSE
        viewer.fill = TRUE
    ),
    package = "rhtmlMoonPlot"
  )
}
