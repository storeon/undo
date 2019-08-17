let useCallback = require('react').useCallback
let Fragment = require('react').Fragment
let render = require('react-dom').render
let h = require('react').createElement
let StoreContext = require('storeon/react/context')
let createStore = require('storeon')
let devtools = require('storeon/devtools')
let connect = require('storeon/react/connect')
let logger = require('storeon/devtools/logger')

let undo = require('../../')

let history = undo.createHistory(['count1'])

function counter (store) {
  store.on('@init', () => {
    return {
      count1: 0,
      count2: 0
    }
  })
  store.on('inc', state => {
    return {
      count1: state.count1 + 1,
      count2: state.count2 + 1
    }
  })
}

function Tracker (props) {
  let hue = Math.round(255 * Math.random())
  let style = { backgroundColor: 'hsla(' + hue + ', 50%, 50%, 0.2)' }
  return h('div', { className: 'tracker', style }, props.value)
}

function Button (props) {
  let onClick = useCallback(() => {
    props.dispatch(props.event)
  })
  return h('button', { onClick }, props.text)
}

let Tracker1 = connect('count1', props => {
  return h(Tracker, {
    value: 'Counter 1: ' + props.count1
  })
})

let Tracker2 = connect('count2', props => {
  return h(Tracker, {
    value: 'Counter 2: ' + props.count2
  })
})

let Button1 = connect(props => {
  return h(Button, {
    dispatch: props.dispatch, event: 'inc', text: 'Increase counter'
  })
})

let ButtonUndo = connect(props => {
  return h(Button, {
    dispatch: props.dispatch, event: history.UNDO, text: 'UNDO'
  })
})

let ButtonRedo = connect(props => {
  return h(Button, {
    dispatch: props.dispatch, event: history.REDO, text: 'REDO'
  })
})

function App () {
  return h(Fragment, null,
    h('div', null, 'Only `counter 1` has a history, and can be undo/redo'),
    h('div', { className: 'container' },
      h('div', { className: 'tracker history' }, 'With history'),
      h('div', { className: 'tracker no_history' }, 'Without history'),
      h(Tracker1),
      h(Tracker2)
    ),
    h('div', { className: 'buttons' },
      h(Button1)
    ),
    h('div', { className: 'buttons' },
      h(ButtonUndo),
      h(ButtonRedo)
    )
  )
}

let store = createStore([counter, history.module, logger, devtools()])

render(
  h(StoreContext.Provider, { value: store }, h(App)),
  document.querySelector('main')
)
