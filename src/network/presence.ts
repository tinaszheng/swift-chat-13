import { app } from './init'
import {
  getDatabase,
  ref,
  onDisconnect,
  onValue,
  serverTimestamp,
  set,
} from 'firebase/database'

const database = getDatabase(app)

// Taken from https://firebase.google.com/docs/firestore/solutions/presence
export function registerPresence(userId: string) {
  // Create a reference to this user's specific status node.
  // This is where we will store data about being online/offline.
  const userStatusDatabaseRef = ref(database, '/status/' + userId)

  // We'll create two constants which we will write to
  // the Realtime database when this device is offline
  // or online.
  const isOffline = { state: 'offline', last_changed: serverTimestamp() }
  const isOnline = { state: 'online', last_changed: serverTimestamp() }

  // Create a reference to the special '.info/connected' path in
  // Realtime Database. This path returns `true` when connected
  // and `false` when disconnected.
  const connectedRef = ref(database, '.info/connected')
  onValue(connectedRef, async (snapshot) => {
    // If we're not currently connected, don't do anything.
    if (snapshot.val() == false) {
      return
    }

    // If we are currently connected, then use the 'onDisconnect()'
    // method to add a set which will only trigger once this
    // client has disconnected by closing the app,
    // losing internet, or any other means.
    await onDisconnect(userStatusDatabaseRef).set(isOffline)
    // The promise returned from .onDisconnect().set() will
    // resolve as soon as the server acknowledges the onDisconnect()
    // request, NOT once we've actually disconnected:
    // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

    // We can now safely set ourselves as 'online' knowing that the
    // server will mark us as offline once we lose connection.
    set(userStatusDatabaseRef, isOnline)
  })
}

type Presence = {
  state: 'online' | 'offline'
  last_changed: number
}

// Takes a callback that returns the userIds of people who are online
export function listenForPresence(callback: (userIds: string[]) => void) {
  const statusDatabaseRef = ref(database, '/status')
  onValue(statusDatabaseRef, (snapshot) => {
    const presences = snapshot.val() as { [userId: string]: Presence }
    const onlineIds = Object.entries(presences)
      .filter(([userId, presence]) => presence.state === 'online')
      .map(([userId, presence]) => userId)
    callback(onlineIds)
  })
}
