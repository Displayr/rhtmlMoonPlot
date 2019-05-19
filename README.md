A R HTMLWidget that displays a moonplot for correspondence analysis.

# To run locally in R context

Run this sequence in R:

```
library('devtools')
install()

CSDperceptions <- matrix(c(0.3004, 0.6864, 0.4975, 0.2908, 0.2781, 0.2642, 0.1916, 0.284,  0.3514, 0.2534, 0.2089, c(  0.0198, 0.4604, 0.2151, 0.5235, 0.1151, 0.12,   0.5457, 0.3041, 0.06312,    0.384,  0.06064), c(  0.01114,    0.4111, 0.1904, 0.4494, 0.06931,    0.1112, 0.4716, 0.2859, 0.0495, 0.3296, 0.03837), c(  0.01114,    0.2373, 0.089,  0.2707, 0.05322,    0.06436,    0.2756, 0.1656, 0.02967,    0.1916, 0.02228), c(  0.0198, 0.177,  0.07054,    0.0297, 0.0396, 0.02719,    0.0136, 0.02847,    0.0198, 0.02847,    0.02472), c(  0.4543, 0.1275, 0.07673,    0.02847,    0.07293,    0.1077, 0.01609,    0.05198,    0.321,  0.01856,    0.0297), c(  0.06807,    0.1089, 0.06064,    0.0198, 0.1174, 0.04084,    0.01609,    0.01733,    0.03465,    0.01361,    0.03589), c(  0.08168,    0.224,  0.1015, 0.04579,    0.04815,    0.04084,    0.03094,    0.05562,    0.05322,    0.04084,    0.02847)),nrow=8,byrow=TRUE, dimnames=list(Brand=c('Coke','V',"Red Bull","Lift Plus",'Diet Coke','Fanta','Lift','Pepsi'), Attribute=c('Kids', 'Teens',    "Enjoy life",   'Picks you up', 'Refreshes',    'Cheers you up',    'Energy',   'Up-to-date',   'Fun',  'When tired',   'Relax')))

obj <- MASS::corresp(CSDperceptions,2)
coreNodes <- obj$rscore[, 1:2]
surfaceNodes <- obj$cscore[, 1:2]
rhtmlMoonPlot::moonplot(coreNodes, surfaceNodes)

```

# rhtmlTemplate

An R HTMLWidget project template.

# Installation in R

1. `library(devtools)`
1. `install_github('Displayr/rhtmlTemplate')`

Simplest Example to verify installation:

```
rhtmlTemplate::template()
```


# Local Installation to Develop/Contribute

**Prerequisites** - For help installing prerequisites see the `Prequisite Installation Help` section below

1. nodejs >= 6.9.5
1. yarn > 0.21 (install via npm install -g yarn)
1. python 2.7 - one of the nodejs libraries needs python during the installation process
1. (optional) r >= 3.0.0 - you can develop without R, but cannot produce r docs or test in r 

## Installing the rhtmlTemplate code

1. Change directory to the place where you put git projects
1. type `git clone git@github.com:Displayr/rhtmlTemplate.git` ENTER
1. type `cd rhtmlTemplate` ENTER
1. type `yarn install` ENTER
    1. `yarn install` is noisy and will print several warnings about `UNMET` and `DEPRECATED`. Ignore these and only make note of errors. If it fails, try running it again.
1. type `gulp serve` ENTER
    1. If `gulp serve` does not work try `./node_modules/.bin/gulp serve`. To correct this and to make your nodejs life easier you should add `./node_modules/.bin` to your PATH. Consult the Internet for instructions on how to do so on your OS of choice.

If this worked, then the `gulp serve` command opened your browser and you are looking at `http://localhost:9000`. You should see a page listing a bunch of links to examples, each example shows the simple 4 square widget template. These examples are defined in the [internal www content directory](theSrc/internal_www/content).

## Prerequisite Installation Help

### Install nodejs on OSX

1. Install brew by following instructions here : http://brew.sh/
1. Install nvm (node version manager) by running `brew install nvm`
1. Install node by running `nvm install 6.1.0` on the terminal

### Install nodejs on Windows

1. Setup nodist. https://github.com/marcelklehr/nodist and find the link to the official installer.
1. Open the command prompt. Type: `nodist v6.1.0`
1. Type `node -v` and verify the version is correct

### Python on OSX - it should come installed. If not

1. Install brew (if not done already) by following instructions here : http://brew.sh/
1. Install python by running `brew install python` on the terminal - make sure you get 2.7

### Python on Windows

1. Download version 2.7 from https://www.python.org/downloads/

### R on OSX

1. Install brew by following instructions here : http://brew.sh/
1. Run the following commands:
    ```
    brew tap homebrew/science
    brew install Caskroom/cask/xquartz
    brew install r
    ```
1. Now start r by running the R `r` command, and in the R terminal run these commands:
    ```
        install.packages("devtools")
        install.packages("roxygen2")
    ```

# Developing and Contributing

rhtmlTemplate relies heavily on [rhtmlBuildUtils](https://github.com/Displayr/rhtmlBuildUtils). You should read through the docs in the rhtmlBuildUtils repo to understand:
 
 1. which gulp tasks are available
 1. the constraints on file layout in your widget project
 1. How to perform visual testing.
 
 Here are a few important notes (both detailed in the rhtmlBuildUtils docs) you must keep in mind:

1. The last thing you do before committing is run `gulp build` to ensure all the autogenerated files are up to date.
2. (With some exceptions) ONLY EDIT THINGS IN these directories: `theSrc`, `bdd`, `docs`, and sometimes `build` !! Many of the other files are auto generated based on the contents of `theSrc`. As an example, if you edit `R/rhtmlTemplate.R` and then run `gulp build` your changes will be DELETED FOREVER!, because `R/rhtmlTemplate.R` is just a copy of `theSrc/R/htmlwidget.R`. See [htmlwidget_build_system](docs/htmlwidget_build_system.md) for more details.

## Contributing to rhtmlTemplate
1. Do not work in master, as the master branch of rhtmlTemplate is used to verify the R server build process.
1. Create a branch, make some changes, add test for your changes, update the docs if necessary, push your branch, and create a pull request on github.

## How the git prepush hook works (aka: My git push got rejected ?!)

This project uses the npm [husky](https://github.com/typicode/husky) module to add git lifecycle hooks to the project. These are defined in the `scripts` section of the [package.json](./package.json) file.
 
Of particular interest is the `prepush` entry which runs a script that checks the project code style using the `gulp lint` command. If there are errors, then it will reject your git push command. You have two options:
  
1. Fix the errors and try pushing again. To see which errors are in the code run `gulp lint`. To autofix as many as possible run `gulp lint --fix`; this will only report the errors it could not auto-fix. Don't forget to commit your code again before pushing.
1. If you must (not recommended) add a --no-verify (i.e., `git push origin head --no-verify`) to skip the style checking.

Here is an illustrative sequence:

```bash
Kyles-MBP:rhtmlTemplate kyle$ git push origin head

> husky - npm run -s prepush

...

/Users/kyle/projects/numbers/rhtmlTemplate/bdd/steps/loadThePage.steps.js
  8:47  error  Missing semicolon  semi

✖ 1 problem (1 error, 0 warnings)

[17:50:09] 'lint' errored after 4.85 s

...

Kyles-MBP:rhtmlTemplate kyle$ gulp lint --fix
[17:50:16] Starting 'lint'...
[17:50:21] Finished 'lint' after 4.94 s

Kyles-MBP:rhtmlTemplate kyle$ git commit -a -m 'fix the style'
...

Kyles-MBP:rhtmlTemplate kyle$ git push origin head
```

# Docs

**Doc manifest**
* [internal_web_server](https://github.com/Displayr/rhtmlBuildUtils/blob/more-docs/docs/.internal_web_server.md) - instruction on how the internal web server works
* [visual_regression_testing](https://github.com/Displayr/rhtmlBuildUtils/blob/more-docs/docs/.visual_regression_testing.md) - instructions on how to add visual regressiopn testing
* [widget_repo_layout](https://github.com/Displayr/rhtmlBuildUtils/blob/more-docs/docs/.widget_repo_layout.md) - instructions on the role each file in the widget repo and naming conventions
* [extending the template](docs/extending_the_template.md) - instructions on using the template to create a new htmlwidget project
* [how the code works](docs/how_the_code_works.md) - a walkthrough of how the rhtmlTemplate and its successors actually work