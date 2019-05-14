/**
 * Storeon module to add undo and redo functionality
 * @param {String[]} paths The keys of state object
 *    that will be store in history
 */
var createHistory = function (paths) {
  paths = paths || []

  var undo = Symbol('undo')
  var redo = Symbol('redo')

  var key = 'undoable'
  if (paths.length > 0) {
    undo = Symbol('undo_' + paths.join('_'))
    redo = Symbol('redo_' + paths.join('_'))

    key += '_' + paths.join('_')
  }

  return {
    module: function (store) {
      var ignoreNext = false
      store.on('@init', function (state) {
        ignoreNext = true
        var init = {}
        init[key] = {
          past: [],
          present: filterState(paths, state),
          future: []
        }
        return init
      })

      store.on('@changed', function (state) {
        if (ignoreNext) {
          ignoreNext = false
          return
        }

        ignoreNext = true
        var undoable = state[key]

        delete state[key]

        state = filterState(paths, state)
        var past = undoable.past
        var present = undoable.present

        var changed = {}
        changed[key] = {
          past: [].concat(past, [present]),
          present: state,
          future: []
        }

        return changed
      })

      store.on(undo, function (state) {
        ignoreNext = true

        var undoable = state[key]
        if (undoable.past.length === 0) return
        delete state[key]

        state = filterState(paths, state)

        var before = undoable.past.pop()

        before[key] = {
          present: Object.assign({}, before),
          past: undoable.past,
          future: [].concat(undoable.future, [state])
        }

        return before
      })

      store.on(redo, function (state) {
        ignoreNext = true

        var undoable = state[key]
        if (undoable.future.length === 0) return

        delete state[key]

        state = filterState(paths, state)

        var next = undoable.future.pop()

        next[key] = {
          present: Object.assign({}, next),
          past: [].concat(undoable.past, [state]),
          future: undoable.future
        }

        return next
      })
    },
    UNDO: undo,
    REDO: redo
  }
}

function filterState (paths, state) {
  if (paths.length === 0) {
    return state
  }

  var filteredState = { }
  paths.forEach(function (p) {
    filteredState[p] = state[p]
  })

  return filteredState
}

var undoable = createHistory()

module.exports = {
  undoable: undoable.module,
  UNDO: undoable.UNDO,
  REDO: undoable.REDO,
  createHistory: createHistory
}
