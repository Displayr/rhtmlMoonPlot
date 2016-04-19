A R HTMLWidget that displays a moonplot for correspondence analysis.


# Installation

Prerequisites:

1. Must have node.js version >= 5.0 installed
2. tested on Linux/Windows, should work on OSX

Steps:

1. `npm install`
2. `bower install`
3. `gulp build`


# To develop and test in test browser context:

Prerequisites: Chrome installed (tested on OSX only, should work in Windows/Linux)

`gulp serve`

This should load a browser window, where a list of links to examples will be displayed. Choose an example or add another example to [R file](src/R/index.html). When changes to the [widget definition](src/scripts/moonplot.coffee) or any other file are saved, the browser will automatically reload.


# To test locally in r context

Prerequisite: `gulp build`

Run this sequence in R:

```
library('devtools')
install('dist/package')
source('dist/package/R/moonplot.R')
```

Or if you are re-running in dev:

```
remove.packages('moonplot','home/po/R/x86_64-pc-linux-gnu-library/3.2')
install('dist/package')
source('dist/package/R/moonplot.R')
moonplot("lksjdf")
```


# R Usage

The actual R package - the project deliverable - is automatically generated in the `dist/package` directory when you run `gulp build`.

The signature definition is documented in the main [R file](src/R/CroppedImage.R)


# To do

1. Integrate C
2. Clean up CoffeeScript code
3.
