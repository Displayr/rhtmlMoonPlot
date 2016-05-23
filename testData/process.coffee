_ = require 'lodash'
fs = require 'fs'
csv = require 'fast-csv'

dataset = 'testData3'

fs.createReadStream(dataset + 'CoreNodes.csv')
  .pipe(csv())
  .on('data', (data) ->
    console.log '[' + data[1] + ',' + data[2] + '],')
    # console.log '\"' + data[0] + '\",')
  .on('end', () -> console.log 'Done.')
