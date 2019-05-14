var createStore = require('storeon')

var undo = require('../')
var undoable = undo.undoable
var UNDO = undo.UNDO
var REDO = undo.REDO
var createHistory = undo.createHistory

var store
var counter

beforeEach(function () {
  counter = function (s) {
    s.on('@init', function () {
      return { a: 0, b: 0 }
    })

    s.on('counter/add', function (state) {
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

it('should create separeted history for key', function () {
  var history = createHistory(['a'])

  var str = createStore([
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

it('undo with separeted history should revert only provided key', function () {
  var history = createHistory(['a'])

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

it('redo should update only provided key', function () {
  var history = createHistory(['a'])

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

it('the state should be added to past array', function () {
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

it('undo should revert state from past', function () {
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

it('redo should revert state from the future', function () {
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

it('redo should do nothing if future is empty', function () {
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

it('undo should do nothing if past is empty', function () {
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
