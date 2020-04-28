/**
 * Storeon module to add undo and redo functionality
 * @param {String[]} paths The keys of state object
 *    that will be store in history
 */
let createHistory = function (paths) {
  if (process.env.NODE_ENV === 'development' && !paths) {
    throw new Error(
      'The paths parameter should be an array: createHistory([])'
    )
  }

  let undo = Symbol('u')
  let redo = Symbol('r')

  let key = 'undoable'
  if (paths.length > 0) {
    undo = Symbol('u_' + paths.join('_'))
    redo = Symbol('r_' + paths.join('_'))

    key += '_' + paths.join('_')
  }

  return {
    module (store) {
      let ignoreNext = false

      store.on('@init', state => {
        ignoreNext = true
        return {
          [key]: {
            past: [],
            present: filterState(paths, state),
            future: []
          }
        }
      })

      store.on('@changed', state => {
        if (ignoreNext) {
          ignoreNext = false
          return
        }

        ignoreNext = true
        let undoable = state[key]

        state = filterState(paths, state)
        delete state[key]

        return {
          [key]: {
            past: [].concat(undoable.past, [undoable.present]),
            present: state,
            future: []
          }
        }
      })

      store.on(undo, state => {
        ignoreNext = true

        let undoable = state[key]
        if (undoable.past.length === 0) return

        state = filterState(paths, state)
        delete state[key]

        let before = undoable.past[undoable.past.length - 1]
        return Object.assign(
          {},
          before,
          {
            [key]: {
              present: before,
              past: undoable.past.slice(0, -1),
              future: [].concat(undoable.future, [state])
            }
          }
        )
      })

      store.on(redo, state => {
        ignoreNext = true

        let undoable = state[key]
        if (undoable.future.length === 0) return

        state = filterState(paths, state)
        delete state[key]

        let next = undoable.future[undoable.future.length - 1]
        return Object.assign(
          {},
          next,
          {
            [key]: {
              present: next,
              past: [].concat(undoable.past, [state]),
              future: undoable.future.slice(0, -1)
            }
          }
        )
      })
    },
    UNDO: undo,
    REDO: redo
  }
}

function filterState (paths, state) {
  if (paths.length === 0) {
    return Object.assign({}, state)
  }

  let filteredState = {}
  for (let p of paths) {
    filteredState[p] = state[p]
  }

  return filteredState
}

module.exports = { createHistory }
