################################################
####    MOONPLOT FOR CORRESPONDENCE ANALYSIS####
################################################

rm(list=ls())

corrected.corresp <- function(x)
{
  library(MASS)
  result <- corresp(x,2)
  #result$cor <- result$cor
  result$rscore <- sweep(result$rscore,2,result$cor,"*")
  result$cscore <- sweep(result$cscore,2,result$cor,"*")
  #Freq=x)
  result}

space <- function(x,gap=0.05)
{#ensures that the space between all obervations is at least gap
  n <- length(x)
  x.sort <- sort(x)
  x.order <- order(x,1:n)
  gap <- gap*diff(range(x))
  b <- x.sort[-1]-x.sort[-n]
  if(sum(b<gap)>0)
    b[b<gap] <- gap
  b <- c(x.sort[1],b)
  new.val <- function(b,x.sort)
  {sum((x.sort-cumsum(b))^2)}
  b <- optim(b,new.val,x.sort=x.sort,lower=c(-Inf,rep(gap,n-1)),method="L-BFGS-B")$par
  replace(x,x.order,cumsum(b))}


space.degrees <- function(x,gap=0.05)
{#variant of space which ensures minimum angles between alternatives
  n <- length(x)
  x <- x+(1:n)/1000
  x.sort <- sort(x)
  b <- x.sort
  diffs <- c(x.sort[1]+360-x.sort[n],x.sort[-1]-x.sort[-n])
  base <- (1:n)[max(diffs)==diffs]
  if (base==1)
  {  x.lookup <- x.sort}
  else
  {
    x.lookup <- c(x.sort[base:n],x.sort[1:(base-1)]+360)}
  x.lookup <- space(x.lookup,gap)
  if (base>1)
    x.lookup <- c(x.lookup[-1:-(n-base+1)]-360,x.lookup[1:(n-base+1)])
  if(min(x.lookup)<0)
    x.lookup[x.lookup<0] <- x.lookup[x.lookup<0]+360
  if(max(x.lookup)>360)
    x.lookup[x.lookup>360] <- x.lookup[x.lookup>360]-360
  result <- vector('numeric',n)
  for (i in 1:n)
    result[i] <- x.lookup[(1:n)[x.sort==x[i]]]
  result <- result-(1:n)/1000
  result
}


moonplot.symmetric <- function (x, y, var.axes = TRUE, col, cex = rep(par("cex"), 2),
                                xlabs = NULL, ylabs = NULL, expand = 1, xlab.offsets=NULL,xlab.pos=1,
                                xlab.mult = 1.1,ylab.mult=1.1,offsets=c(0,0),space.gap=0,
                                arrow.len = 0.1,y.cex=1.5,y.cex.scale=0.5,circle.scaler=1.1, ...)
  #y.cex.scale = values below 1 reduce font size differences
  # xlab.offsets = array of number of rows of x with two columns, showing how much the points representing the brands should be moved (for use to avoid overlapping brands)
{
  n <- nrow(x)
  p <- nrow(y)
  if (missing(xlabs)) {
    xlabs <- dimnames(x)[[1]]
    if (is.null(xlabs))
      xlabs <- 1:n
  }
  xlabs <- as.character(xlabs)
  dimnames(x) <- list(xlabs, dimnames(x)[[2]])
  if (missing(ylabs)) {
    ylabs <- dimnames(y)[[1]]
    if (is.null(ylabs))
      ylabs <- paste("Var", 1:p)
  }
  ylabs <- as.character(ylabs)
  dimnames(y) <- list(ylabs, dimnames(y)[[2]])
  if (length(cex) == 1)
    cex <- c(cex, cex)
  if (missing(col)) {
    col <- par("col")
    if (!is.numeric(col))
      col <- match(col, palette())
    col <- c(col, col + 1)
  }
  else if (length(col) == 1)
    col <- c(col, col)
  max.x <- c(max(x)*xlab.mult,min(x)*xlab.mult,max(y),min(y))
  max.x <- max(abs(max.x))
  xlim <- ylab.mult*max.x*c(-1,1)+offsets
  ylim <- xlim
  ratio <- 1#max(rangy1/rangx1, rangy2/rangx2)/expand
  on.exit(par(oldpar))
  oldpar <- par(pty = "s")
  par(plt=c(0,1,0,1))
  y.atan <- (atan(y[,2]/y[,1]))
  y.srt <- y.atan*180/pi
  srt.adj <- rep(0,n)
  y.srt[y[,1]<0] <- y.srt[y[,1]<0]+180
  y.srt[y[,2]<0] <- y.srt[y[,2]<0]+90
  y.srt <- space.degrees(y.srt,space.gap)
  y.moved <- array(NA,dim(y),dimnames=dimnames(y))
  y.moved[,1] <- sin(y.srt/180*pi)*max.x
  y.moved[,2] <- (max.x^2-y.moved[,1]^2)^.5
  y.moved <- abs(y.moved)*sign(y)
  z <- y.moved[,2]>0
  y.moved[z,1:2] <- y.moved[z,2:1]
  y.moved <- abs(y.moved)*sign(y)
  y.srt[y[,1]<0] <- y.srt[y[,1]<0]-180
  y.srt[y[,2]<0] <- y.srt[y[,2]<0]-90
  y.dist <- (y[,1]^2+y[,2]^2)^.5
  y.max.dist <- max(y.dist)
  y.pos = rep(4,p)
  y.pos[y.moved[,1]<0] <- 2
  if ( sum(offsets!=0))
  {x <- sweep(x,2,offsets,"+")
  y <- sweep(y,2,offsets,"+")}
  yCoords <<- y.moved
  xCoords <<- x
  sizeOfYLabels <<- c()
  for (i in 1:p)
    sizeOfYLabels <<- c(sizeOfYLabels, c(cex[2]*y.cex*(y.dist[i]/y.max.dist)^y.cex.scale))
  # print(xCoords)
  # print(yCoords)
  # print(sizeOfYLabels)
  return(list(xCoords, yCoords, sizeOfYLabels))
}

moonplotFunc <- function (x, brands.row=T, type = c("symmetric", "rows", "columns"),trad.ca=F,xlab.offsets=NULL,xlab.pos=1,trad.ca.xlim=NULL, ...)
{
  if (!brands.row)
    x <- t(x)
  n <- nrow(x)
  obj <- MASS::corresp(x,2)
  type <- match.arg(type)
  X <- obj$rscore[, 1:2]
  if (type != "columns")
    X <- X %*% diag(obj$cor[1:2])
  colnames(X) <- rep("", 2)
  Y <- obj$cscore[, 1:2]
  if (type != "rows")
    Y <- Y %*% diag(obj$cor[1:2])
  colnames(Y) <- rep("", 2)
  #  Checking offets for x labels
  if (!is.null(xlab.offsets))
  {   if(sum(abs(xlab.offsets))==0)
  {warning("xlab.offsets are all 0")
    xlab.offsets=NULL}
    if(sum(dim(xlab.offsets)==c(n,2))!=2)
      stop("xlab.offsets must be an array with two columns and the same number of rows as x")}
    return(moonplot.symmetric(X, Y, var.axes = FALSE,xlab.offsets=xlab.offsets,xlab.pos=xlab.pos,...))
    # switch(type, symmetric = moonplot.symmetric(X, Y, var.axes = FALSE,xlab.offsets=xlab.offsets,xlab.pos=xlab.pos,...),
    #        rows = biplot.bdr(X, Y, ...), columns = biplot.bdr(Y, X, ...))
}


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

  result <- moonplotFunc(round(100*data),xlab.mult=1.2,y.cex.scale=0.5,space.gap=.012,xlab.offsets=matrix(c(0,0,-.2,-.2,0,-.38,.25,-.2,rep(0,8)),byrow=T,ncol=2),xlab.pos=1,col=1)

  data.lunarCoreNodes <- toJSON(xCoords)
  data.lunarCoreLabels <- toJSON(labels(xCoords)[[1]])
  data.lunarSurfaceNodes <- toJSON(yCoords)
  data.lunarSurfaceLabels <- toJSON(labels(yCoords)[[1]])
  data.lunarSurfaceSizes <- toJSON(sizeOfYLabels)


  # forward options using x
  x = list(
    lunarCoreNodes = data.lunarCoreNodes,
    lunarCoreLabels = data.lunarCoreLabels,
    lunarSurfaceNodes = data.lunarSurfaceNodes,
    lunarSurfaceLabels = data.lunarSurfaceLabels,
    lunarSurfaceSizes = data.lunarSurfaceSizes
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
