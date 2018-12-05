
class MoonPlotDependency {
  constructor () {
    console.log('MoonPlotDependency constructor')
    this.foo = 'x'
  }

  doThings () {
    return this.foo
  }
}

module.exports = MoonPlotDependency
