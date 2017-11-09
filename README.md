# fsm
Prototyping ideas of FSM in my mind

# Ideas

## Clock

```
var clock = new FSM()

clock.defineState('tick').from('tock')
clock.defineState('tock').from('tick')

clock.enter('tick').do(function() {
  console.log('tick')

  wait(1e3)

  clock.become('tock')
})

clock.enter('tock').do(function() {
  console.log('tock')

  wait(1e3)
  
  clock.become('tick')
})

clock.start('tick')
```

## Authentication
```
var auth = FSM.create('auth')

auth.defineState('unauthenticated').from('authenticated', 'expiring')
auth.defineState('authenticated').from('unauthenticated', 'expiring')
auth.defineState('expiring').from('authenticated')

auth.enter('authenticated').do(function() {
  // session will expire after 60s
  wait(60e3)
  
  auth.become('expiring')
})

auth.enter('expiring').do(function() {
  var expiringSession = auth.data
  var refreshSessionSucceed = refreshSession(expiringSession)

  if (refreshSessionSucceed) auth.become('authenticated')
  else auth.become('unauthenticated')
})

// sign in
if (auth.at('unauthenticated')) {
  var session = createSession()
  auth.become('authenticated', session)
}

// sign out
if (auth.at('authenticated')) {
  var session = auth.data
  destroySession(session)
  auth.become('unauthenticated')
}

// on page load
var session = getSessionFromCookie()

if (session) auth.start('authenticated', session)
else auth.start('unauthenticated')
```

## Drag & Drop

```
var fsm = new FSM()
fsm.defineState('still').from('moving')
fsm.defineState('moving').from('still', 'moving')

fsm.enter('still').do(function() {
  console.log('enter still, unregister mouseup, mousemove')

  window.removeEventListener('mouseup', loop)
  window.removeEventListener('mousemove', loop)
})

fsm.exit('still').do(function() {
  console.log('exit still, register mouseup, mousemove')

  window.addEventListener('mouseup', loop)
  window.addEventListener('mousemove', loop)
})

fsm.enter('moving').do(function() {
  console.log(`moving ${fsm._data.screenX} ${fsm._data.screenY}`)
})

function loop(event) {
  if (event.type === 'mousedown') return fsm.become('moving', event)

  if (event.type === 'mouseup') return fsm.become('still')

  if (event.type === 'mousemove') return fsm.become('moving', event)
}

window.addEventListener('mousedown', loop)

fsm.start('still')
```
