import { StoreonModule } from 'storeon'

declare namespace StoreonUndo {
  export interface Config {
    key?: string;
  }
}

/**
 * Storeon module to add undo and redo functionality
 * @param {String[]} paths The keys of state object
 *    that will be store in history
 * @param {Object} config The config object
 * @param {String} [config.key='undoable'] The default state key
 *    for storing history (when omitted and `paths` is not empty
 *    will be generated based on `paths` content)
 */
declare function createHistory<State>(
	paths: String[],
	config?: StoreonUndo.Config
): {
	module: StoreonModule<State>,
    UNDO: Symbol,
    REDO: Symbol
}

export = { createHistory }
