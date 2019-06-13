const gulp = require('gulp')
const rhtmlBuildUtils = require('rhtmlBuildUtils')

const dontRegisterTheseTasks = ['testSpecs', 'compileInternal']
const runSequence = rhtmlBuildUtils.registerGulpTasks({ gulp, exclusions: dontRegisterTheseTasks })

gulp.task('testSpecs', function () {
  console.log('skipping test')
  return true
})

const modifiedCompileInternalTaskSequence = rhtmlBuildUtils.taskSequences.compileInternal.concat(['parseTestPlan'])
gulp.task('compileInternal', function (done) {
  runSequence(...modifiedCompileInternalTaskSequence, done)
})

gulp.task('parseTestPlan', require('./build/tasks/parseTestPlan')(gulp))
