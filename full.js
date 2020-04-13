let { createHistory } = require('.')
let undoable = createHistory([])

module.exports = {
  undoable: undoable.module,
  UNDO: undoable.UNDO,
  REDO: undoable.REDO
}
