/**
 * Storeon module to add undo and redo functionality
 * @param {String[]} paths The keys of state object
 *    that will be store in history
 * @param {Object} config The config object
 * @param {String} [config.key='undoable'] The default state key
 *    for storing history (when omitted and `paths` is not empty
 *    will be generated based on `paths` content)
 */
let createHistory = function (paths, config) {
  if (process.env.NODE_ENV === 'development' && !paths) {
    throw new Error('The paths parameter should be an array: createHistory([])')
  }
  config = config || {}

  let key = config.key || 'undoable'
  if (!config.key && paths.length > 0) {
    key += '_' + paths.join('_')
  }
  let undo = Symbol('u_' + key)
  let redo = Symbol('r_' + key)

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

      store.on('@changed', (state, changes) => {
        if (ignoreNext) {
          ignoreNext = false
          return
        }

        if (paths.length) {
          const changedKeys = Object.keys(changes)
          let inPaths = false

          for (let changedKey of changedKeys) {
            if (paths.indexOf(changedKey) > -1) {
              inPaths = true
              break
            }
          }

          if (!inPaths) {
            return
          }
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
        return Object.assign({}, before, {
          [key]: {
            present: before,
            past: undoable.past.slice(0, -1),
            future: [].concat(undoable.future, [state])
          }
        })
      })

      store.on(redo, state => {
        ignoreNext = true

        let undoable = state[key]
        if (undoable.future.length === 0) return

        state = filterState(paths, state)
        delete state[key]

        let next = undoable.future[undoable.future.length - 1]
        return Object.assign({}, next, {
          [key]: {
            present: next,
            past: [].concat(undoable.past, [state]),
            future: undoable.future.slice(0, -1)
          }
        })
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
