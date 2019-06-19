module.exports = function (box, ctm) {
  const xn = ctm.e + (box.x * ctm.a) + (box.y * ctm.c)
  const yn = ctm.f + (box.x * ctm.b) + (box.y * ctm.d)
  return { x: xn, y: yn }
}