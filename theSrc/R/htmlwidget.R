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
#' @param footer character. Sets the footer of the chart, defaults to NULL. The footer is left-aligned.
#' @param footer.font.size integer. Font size of the chart footer.font.size, defaults to 11 pixcels.
#' @param footer.font.family character. Font family of the chart footer.font.family, defaults to "sans-serif".
#' @param footer.font.color An RGB character to set the color of the chart footer.font.color. Defaults to "#000000".
#' @param subtitle character. Sets the subtitle of the chart, defaults to NULL. The subtitle is centred.
#' @param subtitle.font.size integer. Font size of the chart subtitle, defaults to 18 pixcels.
#' @param subtitle.font.family character. Font family of the chart subtitle, defaults to "sans-serif".
#' @param subtitle.font.color An RGB character to set the color of the chart subtitle. Defaults to "#000000".
#' @param title character. Sets the title of the chart, defaults to NULL. The title is centred.
#' @param title.font.size integer. Font size of the chart title, defaults to 24 pixcels.
#' @param title.font.family character. Font family of the chart title, defaults to "sans-serif".
#' @param title.font.color An RGB character to set the color of the chart title. Defaults to "#000000".
#' @param circle.width : The width of the circle circumference line
#' @param circle.color : The color of the circle circumference line
#' @param circle.cross.color : The color of the crosshairs that mark the center of the circle
#' @param circle.drag.area.width : How close to the circle do you need to click to start drag. Higher means larger click area, easier to click
#' @param link.color : The color of the label links
#' @param link.width : The width of the label links
#'
#' @import htmlwidgets
#'
#' @export
moonplot <- function(
  coreNodes = NULL,
  surfaceNodes = NULL,
  width = NULL,
  height = NULL,
  core.font.family = 'sans-serif',
  core.font.size = 14,
  core.font.color = '#333333',
  core.font.selected.color = '#0000dd',
  core.label.minimumDistance = 7,
  footer = NULL,
  footer.font.size = 11,
  footer.font.family = "sans-serif",
  footer.font.color = "#000000",
  subtitle = NULL,
  subtitle.font.size = 18,
  subtitle.font.family = "sans-serif",
  subtitle.font.color = "#000000",
  title = NULL,
  title.font.size = 24,
  title.font.family = "sans-serif",
  title.font.color = "#000000",
  surface.font.family = 'sans-serif',
  surface.font.baseSize = 14,
  surface.font.color = '#333333',
  surface.font.selected.color = '#0000dd',
  surface.label.minimumDistance = 15,
  surface.label.radialPadding = 3,
  circle.width = 1,
  circle.color = '#042a4b',
  circle.cross.color = 'grey',
  circle.drag.area.width = 8,
  link.color = 'grey',
  link.width = 1
) {

  x = list(
    title = title,
    titleFontSize = title.font.size,
    titleFontFamily = title.font.family,
    titleFontColor = title.font.color,
    subtitle = subtitle,
    subtitleFontSize = subtitle.font.size,
    subtitleFontFamily = subtitle.font.family,
    subtitleFontColor = subtitle.font.color,
    footer = footer,
    footerFontSize = footer.font.size,
    footerFontFamily = footer.font.family,
    footerFontColor = footer.font.color,
    coreLabels = jsonlite::toJSON(labels(coreNodes)[[1]]),
    surfaceLabels = jsonlite::toJSON(labels(surfaceNodes)[[1]]),
    coreNodes = jsonlite::toJSON(coreNodes),
    surfaceNodes = jsonlite::toJSON(surfaceNodes),
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
    circleDragAreaWidth = circle.drag.area.width,
    linkColor = link.color,
    linkWidth = link.width
  )

  htmlwidgets::createWidget(
    name = "rhtmlMoonPlot",
    x,
    width = width, # width is ignored, but must be passed or htmlwidgets has issues
    height = height, # height is ignored, but must be passed or htmlwidgets has issues
    sizingPolicy = htmlwidgets::sizingPolicy(
        padding = 0,
        browser.fill = TRUE, # resizing will not work if FALSE
        viewer.fill = TRUE
    ),
    package = "rhtmlMoonPlot"
  )
}
