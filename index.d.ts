import { StoreonModule } from 'storeon'

/**
 * Storeon module to add undo and redo functionality
 * @param {String[]} paths The keys of state object
 *    that will be store in history
 */
declare function createHistory<State>(
	paths: String[]
): {
	module: StoreonModule<State>,
    UNDO: Symbol,
    REDO: Symbol
}

export = { createHistory }
