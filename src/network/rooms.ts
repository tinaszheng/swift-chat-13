import { app } from './init'
import { getFirestore, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { Unsubscribe } from '@firebase/util'
import { Room, Message } from '../shared/types'

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
  })
}

export function registerUser(roomId: string, user: Author) {
  const roomRef = doc(db, 'rooms', roomId)
  return updateDoc(roomRef, {
    [`users.${user.id}`]: user,
  })
}

function debounce(func: Function, windowMs = 300) {
  let timeout: number
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => func(...args), windowMs)
  }
}

async function registerKeystroke(roomId: string, userId: string) {
  const roomRef = doc(db, 'rooms', roomId)
  await updateDoc(roomRef, {
    [`lastKeystrokes.${userId}`]: Date.now(),
  })
}

// TODO: Should use lodash leading & maxWait = 3 seconds
// Aka should use throttle
export const debouncedRegisterKeystroke = debounce(registerKeystroke)

// Return a list of people who have typed in the last 4 seconds
export function currentlyTyping(room: null | Room) {
  if (!room) return []
  const typers = Object.entries(room.lastKeystrokes)
    .filter(([userId, timestamp]) => Date.now() - timestamp < 4000)
    // TODO: Filter out people who have posted a message in the last 4 seconds
    // TODO: Exclude self
    .map(([userId, timestamp]) => room.users[userId].name)
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
