#!/usr/bin/env node

class Matrix {
  #root = []

  constructor(...dimensions) {
    if (Array.isArray(dimensions[0])) {
      this.#root = dimensions[0]
    } else {
      this.#root = this.#createNestedArray(dimensions)
    }
  }

  #createNestedArray(dimensions = [1]) {
    if (dimensions.length === 0) {
      return 0
    } else {
      return new Array(dimensions[0]).fill(0).map(() => {
        return this.#createNestedArray(dimensions.slice(1))
      })
    }
  }

  at(...indexes) {
    return this.#at(this.#root, indexes)
  }

  #at(array, indexes) {
    if (indexes.length === 1) {
      return array.at(indexes[0])
    } else {
      return this.#at(array.at(indexes[0]), indexes.slice(1))
    }
  }

  get(...indexes) {
    this.#get(this.#root, indexes)
  }

  #get(array, indexes) {
    if (indexes.length === 1) {
      return array[indexes[0]]
    } else {
      return this.#get(array[indexes[0]], indexes.slice(1))
    }
  }

  set(value, ...indexes) {
    this.#set(this.#root, value, indexes)
  }

  #set(array, value, indexes) {
    if (indexes.length === 1) {
      array[indexes[0]] = value
    } else {
      this.#set(array[indexes[0]], value, indexes.slice(1))
    }
  }

  forEach(callback) {
    this.#forEach(this.#root, callback)
  }

  #forEach(array, callback, indexes = []) {
    if (Array.isArray(array)) {
      array.forEach((item, index) => this.#forEach(item, callback, [...indexes, index ]))
    } else {
      callback(array, ...indexes)
    }
  }

  map(callback) {
    return new Matrix(this.#map(this.#root, callback))
  }

  #map(array, callback, indexes = []) {
    if (Array.isArray(array)) {
      return array.map((array, index) => this.#map(array, callback, [ ...indexes, index ]))
    } else {
      return callback(array, ...indexes)
    }
  }

  reduce(callback) {
    return this.#reduce(this.#root, callback)
  }

  #reduce(array, callback, indexes = []) {
    if (Array.isArray(array[0])) {
      return array.reduce((acc, array, index) => {
        const reduced = this.#reduce(array, callback, [ ...indexes, index ])
        if (Array.isArray(acc)) {
          return callback(undefined, reduced, ...indexes, index)
        } else {
          return callback(acc, reduced, ...indexes, index)
        }
      },
      array[0])
    } else {
      return array.reduce((acc, value, index) => callback(acc, value, ...indexes, index), array[0])
    }
  }

  toList() {
    const result = []

    this.forEach((value, ...indexes) => result.push({ value, indexes }))

    return result
  }

  toString() {
    const AXES = 'xyzabcdefghijklmnopqrstuvw'

    const result = this.toList().map(({ value, indexes }) => {
      const coordinates = indexes.map((value, index) => `${AXES.charAt(index)}: ${value}`).join(', ')
      return `[${coordinates}] = ${value}`
    })

    return result.join('\n')
  }
}

function initialize(matrix) {
  matrix.forEach(v => {
    const ix = Math.floor(Math.random() * X)
    const iy = Math.floor(Math.random() * Y)
    matrix.set(v + 1, ix, iy)
  })
}

const X = 5, Y = 5, Z = 500, CYCLES = X * Y * Z

const a = new Matrix(X, Y)

for (let i = 0; i < CYCLES; i++) initialize(a)
console.log(a.toString())

const min = a.reduce((acc, value) => acc < value ? acc : value)
const max = a.reduce((acc, value) => acc > value ? acc : value)

const b = a.toList()
  .map(({ value }) => ({ min: value - min, max: max - value }))
  .sort(({ min: v1 }, { min: v2 }) => v2 - v1)

console.log('c:', b)
console.log('min', min, 'max', max, 'diff', max - min, `(${Math.round(((max - min) / (X * Y * Z)) * 10000) / 100}%)`)
