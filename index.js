/**
 * Storeon module to add undo and redo functionality
 * @param {String[]} paths The keys of state object
 *    that will be store in history
 */
module.exports = {
  createHistory (paths) {
    if (process.env.NODE_ENV === 'development') {
      if (!paths) {
        throw new Error(
          'The paths parameter should be an array: createHistory([])'
        )
      }
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

          delete state[key]

          state = filterState(paths, state)
          let past = undoable.past
          let present = undoable.present

          return {
            [key]: {
              past: [].concat(past, [present]),
              present: state,
              future: []
            }
          }
        })

        store.on(undo, state => {
          ignoreNext = true

          let undoable = state[key]
          if (undoable.past.length === 0) return
          delete state[key]

          state = filterState(paths, state)

          let before = undoable.past.pop()

          before[key] = {
            present: Object.assign({}, before),
            past: undoable.past,
            future: [].concat(undoable.future, [state])
          }

          return before
        })

        store.on(redo, state => {
          ignoreNext = true

          let undoable = state[key]
          if (undoable.future.length === 0) return

          delete state[key]

          state = filterState(paths, state)

          let next = undoable.future.pop()

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
}

function filterState (paths, state) {
  if (paths.length === 0) {
    return state
  }

  let filteredState = {}
  for (let p of paths) {
    filteredState[p] = state[p]
  }

  return filteredState
}
