var useCallback = require('react').useCallback
var Fragment = require('react').Fragment
var render = require('react-dom').render
var h = require('react').createElement
var StoreContext = require('storeon/react/context')
var createStore = require('storeon')
var devtools = require('storeon/devtools')
var connect = require('storeon/react/connect')
var logger = require('storeon/devtools/logger')

var undo = require('../../')

var history = undo.createHistory(['count1'])

function counter (store) {
  store.on('@init', function () {
    return {
      count1: 0,
      count2: 0
    }
  })
  store.on('inc', function (state) {
    return {
      count1: state.count1 + 1,
      count2: state.count2 + 1
    }
  })
}

function Tracker (props) {
  var hue = Math.round(255 * Math.random())
  var style = { backgroundColor: 'hsla(' + hue + ', 50%, 50%, 0.2)' }
  return h('div', { className: 'tracker', style: style }, props.value)
}

function Button (props) {
  var onClick = useCallback(function () {
    props.dispatch(props.event)
  })
  return h('button', { onClick: onClick }, props.text)
}

var Tracker1 = connect('count1', function (props) {
  return h(Tracker, {
    value: 'Counter 1: ' + props.count1
  })
})

var Tracker2 = connect('count2', function (props) {
  return h(Tracker, {
    value: 'Counter 2: ' + props.count2
  })
})

var Button1 = connect(function (props) {
  return h(Button, {
    dispatch: props.dispatch, event: 'inc', text: 'Increase counter'
  })
})

var ButtonUndo = connect(function (props) {
  return h(Button, {
    dispatch: props.dispatch, event: history.UNDO, text: 'UNDO'
  })
})

var ButtonRedo = connect(function (props) {
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

var store = createStore([counter, history.module, logger, devtools()])

render(
  h(StoreContext.Provider, { value: store }, h(App)),
  document.querySelector('main')
)
