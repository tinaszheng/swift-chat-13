import { app } from './init'
import { getFirestore, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { Unsubscribe } from '@firebase/util'

type Message = {
  id: string
  text: string
  timestamp: number // ms since epoch
  author: string // Name of the user who sent the message
}

type Room = {
  id: string
  videoUrl: string // url of the video or playlist
  videoStartTime: number // 0:00 for the video
  messages: Map<string, Message> // Map of message id to message
}

const db = getFirestore(app)

let unsubscribe: Unsubscribe
export function listenRoom(roomId: string, onChange: (room: Room) => void) {
  if (unsubscribe) {
    unsubscribe()
  }
  const roomRef = doc(db, 'rooms', roomId)
  unsubscribe = onSnapshot(roomRef, (snapshot) => {
    onChange(snapshot.data() as Room)
  })
}

export async function createMessage(roomId: string, message: Message) {
  const roomRef = doc(db, 'rooms', roomId)
  await updateDoc(roomRef, {
    [`messages.${message.id}`]: message,
  })
}
