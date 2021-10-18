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
    [`lastKeystrokes.${message.author.id}`]: message.timestamp,
  })
}

export function registerUser(roomId: string, user: Author) {
  const roomRef = doc(db, 'rooms', roomId)
  return updateDoc(roomRef, {
    [`users.${user.id}`]: user,
  })
}

export async function registerKeystroke(roomId: string, userId: string) {
  const roomRef = doc(db, 'rooms', roomId)
  await updateDoc(roomRef, {
    [`lastKeystrokes.${userId}`]: Date.now(),
  })
}
