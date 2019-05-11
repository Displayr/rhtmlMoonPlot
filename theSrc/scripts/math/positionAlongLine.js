// Translate angles to position on line
module.exports = (rad, lengthOfLine) => ((rad + Math.PI) / (2 * Math.PI)) * lengthOfLine