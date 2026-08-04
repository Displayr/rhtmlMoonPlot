#!/usr/bin/env node

// Cross platform replacement for `gulp testVisual --env=local --branch=`git rev-parse --abbrev-ref HEAD``
// Command substitution with backticks does not work on Windows (cmd.exe), so resolve the
// branch name here and forward any extra arguments through to gulp.

const { execFileSync, spawnSync } = require('child_process')

const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim()

const result = spawnSync(
  'gulp',
  ['testVisual', '--env=local', `--branch=${branch}`, ...process.argv.slice(2)],
  { stdio: 'inherit', shell: true }
)

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status === null ? 1 : result.status)
