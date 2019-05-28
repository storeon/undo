var undo = require('.')
var undoable = undo.createHistory([])

module.exports = {
  undoable: undoable.module,
  UNDO: undoable.UNDO,
  REDO: undoable.REDO
}
