let createStore = require('storeon')

let undo = require('../')
let full = require('../full')
let undoable = full.undoable
let UNDO = full.UNDO
let REDO = full.REDO
let createHistory = undo.createHistory

let store
let counter

beforeEach(() => {
  counter = function (s) {
    s.on('@init', () => {
      return { a: 0, b: 0 }
    })

    s.on('counter/add', state => {
      return {
        a: state.a + 1,
        b: state.b + 1
      }
    })
  }

  store = createStore([
    counter,
    undoable
  ])
})

it('should throw the help error in development mode', () => {
  process.env.NODE_ENV = 'development'
  expect(() => {
    createHistory()
  }).toThrow('The paths parameter should be an array: createHistory([])')
})

it('should throw the error in production mode', () => {
  process.env.NODE_ENV = 'production'
  expect(() => {
    createHistory()
  }).toThrow('Cannot read property \'length\' of undefined')
})

it('should create separeted history for key', () => {
  let history = createHistory(['a'])

  let str = createStore([
    counter,
    history.module
  ])

  str.dispatch('counter/add')

  expect(str.get()).toEqual({
    a: 1,
    b: 1,
    undoable_a: {
      future: [],
      past: [{ a: 0 }],
      present: { a: 1 }
    }
  })
})

it('undo with separeted history should revert only provided key', () => {
  let history = createHistory(['a'])

  store = createStore([
    counter,
    history.module
  ])

  store.dispatch('counter/add')
  store.dispatch('counter/add')
  store.dispatch('counter/add')

  expect(store.get()).toEqual({
    a: 3,
    b: 3,
    undoable_a: {
      future: [],
      past: [{ a: 0 }, { a: 1 }, { a: 2 }],
      present: { a: 3 }
    }
  })

  store.dispatch(history.UNDO)

  expect(store.get()).toEqual({
    a: 2,
    b: 3,
    undoable_a: {
      future: [{ a: 3 }],
      past: [{ a: 0 }, { a: 1 }],
      present: { a: 2 }
    }
  })
})

it('redo should update only provided key', () => {
  let history = createHistory(['a'])

  store = createStore([
    counter,
    history.module
  ])

  store.dispatch('counter/add')
  store.dispatch('counter/add')
  store.dispatch('counter/add')

  expect(store.get()).toEqual({
    a: 3,
    b: 3,
    undoable_a: {
      future: [],
      past: [{ a: 0 }, { a: 1 }, { a: 2 }],
      present: { a: 3 }
    }
  })

  store.dispatch(history.UNDO)
  store.dispatch(history.UNDO)
  store.dispatch(history.UNDO)

  expect(store.get()).toEqual({
    a: 0,
    b: 3,
    undoable_a: {
      future: [{ a: 3 }, { a: 2 }, { a: 1 }],
      past: [],
      present: { a: 0 }
    }
  })

  store.dispatch(history.REDO)

  expect(store.get()).toEqual({
    a: 1,
    b: 3,
    undoable_a: {
      future: [{ a: 3 }, { a: 2 }],
      past: [{ a: 0 }],
      present: { a: 1 }
    }
  })
})

it('the state should be added to past array', () => {
  store.dispatch('counter/add')

  expect(store.get()).toEqual({
    a: 1,
    b: 1,
    undoable: {
      future: [],
      past: [{ a: 0, b: 0 }],
      present: { a: 1, b: 1 }
    }
  })
})

it('undo should revert state from past', () => {
  store.dispatch('counter/add')
  store.dispatch('counter/add')

  store.dispatch(UNDO)

  expect(store.get()).toEqual({
    a: 1,
    b: 1,
    undoable: {
      future: [{ a: 2, b: 2 }],
      past: [{ a: 0, b: 0 }],
      present: { a: 1, b: 1 }
    }
  })

  store.dispatch(UNDO)
  expect(store.get()).toEqual({
    a: 0,
    b: 0,
    undoable: {
      future: [{ a: 2, b: 2 }, { a: 1, b: 1 }],
      past: [],
      present: { a: 0, b: 0 }
    }
  })
})

it('redo should revert state from the future', () => {
  store.dispatch('counter/add')
  store.dispatch('counter/add')

  store.dispatch(UNDO)
  store.dispatch(UNDO)

  expect(store.get()).toEqual({
    a: 0,
    b: 0,
    undoable: {
      future: [{ a: 2, b: 2 }, { a: 1, b: 1 }],
      past: [],
      present: { a: 0, b: 0 }
    }
  })

  store.dispatch(REDO)

  expect(store.get()).toEqual({
    a: 1,
    b: 1,
    undoable: {
      future: [{ a: 2, b: 2 }],
      past: [{ a: 0, b: 0 }],
      present: { a: 1, b: 1 }
    }
  })

  store.dispatch(REDO)
  expect(store.get()).toEqual({
    a: 2,
    b: 2,
    undoable: {
      future: [],
      past: [{ a: 0, b: 0 }, { a: 1, b: 1 }],
      present: { a: 2, b: 2 }
    }
  })
})

it('redo should do nothing if future is empty', () => {
  store.dispatch('counter/add')
  store.dispatch('counter/add')

  store.dispatch(UNDO)
  store.dispatch(UNDO)

  expect(store.get()).toEqual({
    a: 0,
    b: 0,
    undoable: {
      future: [{ a: 2, b: 2 }, { a: 1, b: 1 }],
      past: [],
      present: { a: 0, b: 0 }
    }
  })

  store.dispatch(REDO)
  store.dispatch(REDO)
  store.dispatch(REDO)
  store.dispatch(REDO)
  store.dispatch(REDO)

  expect(store.get()).toEqual({
    a: 2,
    b: 2,
    undoable: {
      future: [],
      past: [{ a: 0, b: 0 }, { a: 1, b: 1 }],
      present: { a: 2, b: 2 }
    }
  })
})

it('undo should do nothing if past is empty', () => {
  store.dispatch('counter/add')
  store.dispatch('counter/add')

  expect(store.get()).toEqual({
    a: 2,
    b: 2,
    undoable: {
      future: [],
      past: [{ a: 0, b: 0 }, { a: 1, b: 1 }],
      present: { a: 2, b: 2 }
    }
  })

  store.dispatch(UNDO)
  store.dispatch(UNDO)
  store.dispatch(UNDO)
  store.dispatch(UNDO)
  store.dispatch(UNDO)

  expect(store.get()).toEqual({
    a: 0,
    b: 0,
    undoable: {
      future: [{ a: 2, b: 2 }, { a: 1, b: 1 }],
      past: [],
      present: { a: 0, b: 0 }
    }
  })
})
