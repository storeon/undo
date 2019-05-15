# Storeon undo

<img src="https://storeon.github.io/storeon/logo.svg" align="right"
     alt="Storeon logo by Anton Lovchikov" width="160" height="142">

Tiny module for [Storeon] to add `undo` and `redo` functionality.

It is just 196 bytes module (it uses [Size Limit] to control the size) without any dependencies.

[Size Limit]: https://github.com/ai/size-limit
[Storeon]: https://github.com/storeon/storeon

```js
import { undoable, UNDO, REDO } from '@storeon/undo'

const store = createStore([
  /* all your modules */
  undoable
 ])

// now you can use UNDO and REDO with dispatch
dispatch(UNDO)
```

![Example of use the undo/redo functionality](example.gif)

## Installation

```
npm install @storeon/undo
```

## Usage

To using the undo/redo functionality you just need to add the `undoable` module to `createStore`.

```js
import createStore from 'storeon'
import { undoable, UNDO, REDO } from '@storeon/undo'

let counter = store => {
  store.on('@init', () => ({ counter: 0 }))

  store.on('inc', (state) => ({ counter: state.counter + 1}))
  store.on('dec', (state) => ({ counter: state.counter - 1}))
}

const store = createStore([
  counter,
  undoable
 ])
```

And now you can use the functions `undo` and `redo` to manipulate the history.

```js
const Counter = () => {
  const { dispatch, counter } = useStoreon('counter')
  return <React.Fragment>
    <div>{counter}</div>
    <button onClick={() => dispatch('inc')}>Inc</button>
    <button onClick={() => dispatch('dec')}>Dec</button>
  </React.Fragment>
}

const UndoRedo = () => {
  const { dispatch } = useStoreon()

  return <>
    <button onClick={() => dispatch(UNDO)}>Undo</button>
    <button onClick={() => dispatch(REDO)}>Redo</button>
  </>
}
```

If you need history only for some particular keys in state you can use `createHistory` function:

```js
import {createHistory} from './storeon-undo'

// history will be collect only for key `a`
const history = createHistory(['a'])
const { UNDO, REDO } = history

createStore([
  /* all your modules */
  history.module
])

// to change the history use the UNDO and REDO from `history` object
dispatch(UNDO)
```

![Example of history only for specific key](example_history.gif)

## LICENSE

MIT

## Acknowledgments

This module based on [Implementing Undo History recipe](https://redux.js.org/recipes/implementing-undo-history) article.
