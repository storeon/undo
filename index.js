/**
 * Storeon module to add undo and redo functionality
 */
var undoable = function (store) {
  var ignoreNext = false
  store.on('@init', function (state) {
    ignoreNext = true
    return {
      undoable: {
        past: [],
        present: state,
        future: []
      }
    }
  })

  store.on('@changed', function (state) {
    if (ignoreNext) {
      ignoreNext = false
      return
    }

    ignoreNext = true
    var undo = state.undoable

    delete state.undoable

    var past = undo.past
    var present = undo.present

    return {
      undoable: {
        past: [].concat(past, [present]),
        present: state,
        future: []
      }
    }
  })

  store.on('undo', function (state) {
    ignoreNext = true

    var undo = state.undoable
    if (undo.past.length === 0) return
    delete state.undoable

    var before = undo.past.pop()

    before.undoable = {
      present: Object.assign({}, before),
      past: undo.past,
      future: [].concat(undo.future, [state])
    }

    return before
  })

  store.on('redo', function (state) {
    ignoreNext = true

    var undo = state.undoable
    if (undo.future.length === 0) return

    delete state.undoable

    var next = undo.future.pop()

    next.undoable = {
      present: Object.assign({}, next),
      past: [].concat(undo.past, [state]),
      future: undo.future
    }

    return next
  })
}

module.exports = undoable
