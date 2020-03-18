let undo = require('.')
let undoable = undo.createHistory([])

module.exports = {
  undoable: undoable.module,
  UNDO: undoable.UNDO,
  REDO: undoable.REDO
}
