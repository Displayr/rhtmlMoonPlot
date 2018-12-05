module.exports = function () {
  this.When(/^I click the "([^"]+)" square$/, function (squareName) {
    return this.context.templatePageObject.selectSquare(squareName)
  })

  this.Then(/^the "([^"]+)" square should be selected$/, function (squareName) {
    return this.context.templatePageObject.isSelected(squareName).then((isSelected) => {
      this.expect(isSelected).to.equal(true)
    })
  })
}
