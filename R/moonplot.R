#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
moonplot <- function(message, width = NULL, height = NULL) {

  # forward options using x
  x = list(
    message = message
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