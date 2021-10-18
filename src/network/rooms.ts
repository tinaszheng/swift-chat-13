import { app } from './init'
import { getFirestore, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { Unsubscribe } from '@firebase/util'
import { Room, Message } from '../shared/types'
import { throttle } from 'lodash'

const db = getFirestore(app)

let unsubscribe: Unsubscribe
export function listenRoom(roomId: string, onChange: (room: Room) => void) {
  if (unsubscribe) {
    unsubscribe()
  }
  const roomRef = doc(db, 'rooms', roomId)
  unsubscribe = onSnapshot(roomRef, (snapshot) => {
    const room = snapshot.data() as Room
    if (room) {
      onChange(room)
    }
  })
}

export async function createMessage(roomId: string, message: Message) {
  const roomRef = doc(db, 'rooms', roomId)
  await updateDoc(roomRef, {
    [`messages.${message.id}`]: message,
    [`lastKeystrokes.${message.author.id}`]: message.timestamp,
  })
}

export function registerUser(roomId: string, user: Author) {
  const roomRef = doc(db, 'rooms', roomId)
  return updateDoc(roomRef, {
    [`users.${user.id}`]: user,
  })
}

async function registerKeystroke(roomId: string, userId: string) {
  const roomRef = doc(db, 'rooms', roomId)
  await updateDoc(roomRef, {
    [`lastKeystrokes.${userId}`]: Date.now(),
  })
}

export const debouncedRegisterKeystroke = throttle(registerKeystroke, 3000, {
  leading: true,
  trailing: true,
})

// Return a map of userIds to the last time they posted a message
function getLastMessages(room: Room) {
  return Object.values(room.messages || {}).reduce((acc, message) => {
    if (message.author) {
      const { id } = message.author
      acc[id] = Math.max(message.timestamp, acc[id] || 0)
    }
    return acc
  }, {} as { [userId: string]: number })
}

// Return a list of people who have typed in the last 4 seconds
export function currentlyTyping(room: null | Room) {
  if (!room) return []
  const lastMessages = getLastMessages(room)
  const typers = Object.entries(room.lastKeystrokes)
    .filter(([userId, lastKeystroke]) => Date.now() - lastKeystroke < 4000)
    // Exclude anyone who just posted a message
    .filter(([userId, lastKeystroke]) => lastKeystroke !== lastMessages[userId])
    // TODO: Exclude self
    .map(([userId, lastKeystroke]) => room.users[userId].name)
    .map((fullName) => fullName.split(' ')[0])

  // Construct a sentence like "John, Jane, & Bob are typing..."
  switch (typers.length) {
    case 0:
      return ''
    case 1:
      return `${typers[0]} is typing...`
    case 2:
      return `${typers[0]} & ${typers[1]} are typing...`
    default:
      return `${typers.slice(0, -1).join(', ')}, & ${typers.slice(
        -1
      )} are typing...`
  }
}
