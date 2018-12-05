
# How does the template widget work

In addition to being a template for the creation of new html widgets, the rhtmlTemplate widget is a functioning widget meant to demonstrate a few principles. This will be discussed in this document.

The interaction between the R servers, `R_opencpu`, and the `displayr` UI are not covered here.

There are several relevant files:

1. `theSrc/R/htmlMoonPlot.r` : defines the R function signature and does some input formatting before invoking the HTML Widget
1. `theSrc/scripts/rhtmlMoonPlot.js` : registers the `rhtmlTemplate` with the HTMLWidget framework. This file is deliberately very light on details and just calls methods on the Template class
1. `theSrc/scripts/MoonPlot.js` : defines a class that does all of the work creating the htmlwidget.

## `theSrc/R/htmlTemplate.r`

For a simple widget there is not much to be done in the R file. In the `rhtmlTemplate` example the R file parses the JSON string into an object, pulls out the width and height, and calls the `htmlwidgets::createWidget` function to begin the process of rendering the widget. In more complicated widgets, the R file may contain multiple functions that can be used to invoke the htmlwidget in different ways. The R functions can contain parsing logic so that the R functions have simple interfaces that mask the complexity of the underlying widget API from the user.

## `theSrc/R/rhtmlMoonPlot.js`

The format of this file is pretty strict, not much can or should be changed here. I wanted to structure my complex widget code as a class to gain all of the benefits of OO programming. The htmlwidget interface was not ideally suited for this, so the `rhtmlMoonPlot.js` file provides a bridge between the class structure I have used in `MoonPlot.js` and `Pictograph.js` with the requirements of the `HTMLWidgets.widget` function signature.

Any htmlwidget using the new interface (i.e, calling HTMLWidgets.widget with an object that has a factory method) must satisfy these requirements:

* Have a `name` and an `type:output` - there are probably other types but I have never seen one
* call HTMLWidgets.widget with an object that has a factory method
* the factory method must return an object that implements 2 methods `renderValue`, and `resize`

So as said not much flexibility in this file, most customization occurs in your main class (in our case `MoonPlot.js`).

Seperating the widget code into a class (i.e., `MoonPlot.js`) also allows us to create widgets without the R interface, which is important for quick testing in a browser context.

The `rhtmlMoonPlot.js` wrapper also handles any errors thrown when interacting the the Template class. If an error is thrown, the error will be rendered to the user using the `DisplayError` class, and the error will be "rethrown" so displayr can handle it.

## `theSrc/scripts/MoonPlot.js`

As stated, this contains most of the business logic for the widget. There is a lot of flexibility in how each widget is implemented, but to satisfy the if you want to use `rhtmlMoonPlot.js` wrapper, then your class only needs to implement the following top level functions:

* **constructor(element, width, height, stateChangedCallback)**: instantiate the widget in the DOM element provided. Save an internal reference to the element reference as you will need it in subsequent calls to `draw()` and `resize()`. Save an internal reference to the stateChangedCallback and call this function any time the user changes the state of the widget. When the widget is reloaded, the saved user state will be provided in the initial call to `setUserState`.
* **resize(newWidth, newHeight)**: resize the widget
* **setConfig(config)**: process and the initial or the new config
* **setUserState(userState)**: process and the initial or the new state
* **draw()**: draw or redraw the widget 

**It is important to note that displayr will make subsequent calls to renderValue with update configs if the user changes the config or requests a redraw. The widget must handle these calls and update or replace the existing rendered widget.**

## Sequence of calls during widget initialisation

We now describe the inner workings in detail. Note that you don't need to copy these patterns, but it might make things easier if you do.

When the htmlwidget framework is called from R it begins by calling the `factory` function in `rthmlTemplate.js`. This creates a new instance of the `Template` class and returns an object with two methods: `renderValue` and `resize`. 

The Template constructor does not do much, other than initialize state. In this case state represents which square is selected. We start off with no squares selected.

Next the htmlwidget framework calls the `renderValue()` function on the object returned from `factory()` defined in rhtmlMoonPlot.js. The renderValue function parses the config and traps errors. next it calls `Template.setConfig`, then calls `Template.setUserState()` and finally `Template.draw`.

In `setConfig()` you validate and normalize all of the input config so that the rest of the Widget code can safely assume the format of the config. rhtmlTemplate does not really have any config validation and normalization. Have a look at rhtmlPictographs to see a more concrete example of what setConfig is supposed to do.

In `setUserState()` you validate and normalize the input userState. Consider that the userState could be from a previous version of the widget. Your new version must handle old state versions.

`Template.draw()` is just a wrapper that calls three subsequent functions:
* _manipulateRootElementSize: This function sets the width and height of the DOM container. If resizable set to 100% so the widget will grow to fit the displayr container. If not resizable set to a fixed value. You should not need to modify it.
* _addRootSvgToRootElement: This function creates the root SVG element, saves it to this.outerSvg, and sets the `viewBox` and `preserveAspectRatio` settings (TODO : doc these values as well as resiazable).
* _redraw: This is where all the specific logic of the html widget is realized.

You are free to throw descriptive errors via the `throw new Error("good description")` pattern. These will be rendered to the user and eventually caught and handled.