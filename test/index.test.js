var createStore = require('storeon')

var undoable = require('../')

var store

beforeEach(function () {
  var counter = function (s) {
    s.on('@init', function () {
      return { b: 0 }
    })

    s.on('counter/add', function (state) {
      return { b: state.b + 1 }
    })
  }

  store = createStore([
    counter,
    undoable
  ])
})

it('the state should be added to past array', function () {
  store.dispatch('counter/add')

  expect(store.get()).toEqual({
    b: 1,
    undoable: {
      future: [],
      past: [{ b: 0 }],
      present: { b: 1 }
    }
  })
})

it('undo should revert state from past', function () {
  store.dispatch('counter/add')
  store.dispatch('counter/add')

  store.dispatch('undo')

  expect(store.get()).toEqual({
    b: 1,
    undoable: {
      future: [{ b: 2 }],
      past: [{ b: 0 }],
      present: { b: 1 }
    }
  })

  store.dispatch('undo')
  expect(store.get()).toEqual({
    b: 0,
    undoable: {
      future: [{ b: 2 }, { b: 1 }],
      past: [],
      present: { b: 0 }
    }
  })
})

it('redo should revert state from the future', function () {
  store.dispatch('counter/add')
  store.dispatch('counter/add')

  store.dispatch('undo')
  store.dispatch('undo')

  expect(store.get()).toEqual({
    b: 0,
    undoable: {
      future: [{ b: 2 }, { b: 1 }],
      past: [],
      present: { b: 0 }
    }
  })

  store.dispatch('redo')

  expect(store.get()).toEqual({
    b: 1,
    undoable: {
      future: [{ b: 2 }],
      past: [{ b: 0 }],
      present: { b: 1 }
    }
  })

  store.dispatch('redo')
  expect(store.get()).toEqual({
    b: 2,
    undoable: {
      future: [],
      past: [{ b: 0 }, { b: 1 }],
      present: { b: 2 }
    }
  })
})

it('redo should do nothing if future is empty', function () {
  store.dispatch('counter/add')
  store.dispatch('counter/add')

  store.dispatch('undo')
  store.dispatch('undo')

  expect(store.get()).toEqual({
    b: 0,
    undoable: {
      future: [{ b: 2 }, { b: 1 }],
      past: [],
      present: { b: 0 }
    }
  })

  store.dispatch('redo')
  store.dispatch('redo')
  store.dispatch('redo')
  store.dispatch('redo')
  store.dispatch('redo')

  expect(store.get()).toEqual({
    b: 2,
    undoable: {
      future: [],
      past: [{ b: 0 }, { b: 1 }],
      present: { b: 2 }
    }
  })
})

it('undo should do nothing if past is empty', function () {
  store.dispatch('counter/add')
  store.dispatch('counter/add')

  expect(store.get()).toEqual({
    b: 2,
    undoable: {
      future: [],
      past: [{ b: 0 }, { b: 1 }],
      present: { b: 2 }
    }
  })

  store.dispatch('undo')
  store.dispatch('undo')
  store.dispatch('undo')
  store.dispatch('undo')
  store.dispatch('undo')

  expect(store.get()).toEqual({
    b: 0,
    undoable: {
      future: [{ b: 2 }, { b: 1 }],
      past: [],
      present: { b: 0 }
    }
  })
})
