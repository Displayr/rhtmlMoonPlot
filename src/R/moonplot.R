#' MoonPlot
#'
#' Uses correspondence analysis to create a Moon Plot
#'
#' @import htmlwidgets
#'
#' @export
moonplot <- function(
  data, 
  width = NULL, 
  height = NULL) {

  # forward options using x
  x = list(
    data = data
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