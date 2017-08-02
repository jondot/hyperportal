#!/usr/bin/env node

const locus = require('locus')
const path = require('path')
const purdy = require('purdy')
const L = require('lodash')
const { table } = require('table')

// we don't need to see this file.
__locus_modules__.print = Object.assign(__locus_modules__.print, {
  file: () => {}
})

const models = require(path.join(
  process.cwd(),
  process.env.HYP_MODELS || path.join(__dirname, '../config/mngs')
))

const isSequelize = Model => !!Model.QueryInterface

// load up models
Object.assign(global, models)
console.log('Models:\n=======')
console.log(Object.keys(models).join('\n'))

const objectify = m => x => {
  // just always use toJSON for sequelize.
  m = isSequelize(x) ? 'toJSON' : m

  if (x[m]) {
    return x[m]()
  }
  if (L.isArray(x)) {
    return L.map(x, _ => _[m]())
  }
  return x
}
const tablify = x => {
  const a = L.isArray(x) ? x : [x]
  const header = Object.keys(L.maxBy(a, _ => Object.keys(_).length))
  const rows = L.map(a, _ => L.map(header, p => _[p]))
  return [header, ...rows]
}
const unglitchTable = t => {
  //fix up first line
  console.log(
    '\n' +
      L.map(
        purdy.stringify(t).split('\n'),
        (ln, i) => (i == 0 ? ln : ' ' + ln)
      ).join('\n')
  )
}

const o = _ => _.then(objectify('toObject')).then(purdy).catch(console.log)
const l = _ => _.then(console.log).catch(console.log)
const js = _ => _.then(objectify('toJSON')).then(purdy).catch(console.log)
const t = _ =>
  _.then(objectify('toObject'))
    .then(tablify)
    .then(table)
    .then(unglitchTable)
    .catch(console.log)
eval(locus)
