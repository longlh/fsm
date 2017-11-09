class State {
  constructor(name) {
    this._name = name
  }

  from(...states) {
    this._previousStates = states
  }
}

class Defer {
  register(cb) {
    this._cb = cb;
  }
}

class FSM {
  constructor() {
    this._current = null
    this._data = null
    this._states = {}
    this._hooks = {}
  }

  defineState(name) {
    var state = this._states[name] = new State(name)

    return state
  }

  _become(desiredState, data, force) {
    if (!force) {
      // validate here
      let nextState = this._states[desiredState]

      if (!nextState) return false

      if (nextState._previousStates.indexOf(this._current) === -1) return false
    }

    var beforeEnterDefer = this._hooks[`beforeEnter:${desiredState}`]

    if (beforeEnterDefer) beforeEnterDefer._cb.call(this)

    let lastState = this._current
    this._current = desiredState
    this._data = data

    var exitDefer = this._hooks[`exit:${lastState}`]

    if (exitDefer) exitDefer._cb.call(this)

    var enterDefer = this._hooks[`enter:${desiredState}`]

    if (enterDefer) enterDefer._cb.call(this)

    return true
  }

  start(initialState, initialValue) {
    return this._become(initialState, initialValue, true)
  }

  become(state, data) {
    return this._become(state, data)
  }

  enter(state) {
    var defer = this._hooks[`enter:${state}`] = new Defer()

    return { do: defer.register.bind(defer) }
  }

  exit(state) {
    var defer = this._hooks[`exit:${state}`] = new Defer()

    return { do: defer.register.bind(defer) }
  }
}


if (typeof module !== 'undefined') module.exports = FSM
if (typeof window !== 'undefined') window.FSM = FSM
