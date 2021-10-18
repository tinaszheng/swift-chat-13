import { Message, MessageBlock, Room } from './types'

// assume messages is already in order of timestamp
export const groupByAuthor = (messages: Message[]) => {
  const output: MessageBlock[] = []

  let i
  let currOutputIndex = -1
  for (i = 0; i < messages.length; i++) {
    if (currOutputIndex !== -1) {
      const currAuthor = output[currOutputIndex].author
      if (messages[i]?.author?.id === currAuthor.id) {
        output[currOutputIndex].messages.push(messages[i])
      } else {
        currOutputIndex += 1
        output[currOutputIndex] = {
          // @ts-ignore yolo for now
          author: messages[i].author,
          messages: [messages[i]],
        }
      }
    } else {
      currOutputIndex += 1
      output[currOutputIndex] = {
        // @ts-ignore yolo for now
        author: messages[i].author,
        messages: [messages[i]],
      }
    }
  }

  return output
}

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

// Return a description of who's typed in the last 4 seconds
export function currentlyTyping(room: null | Room, selfId: undefined | string) {
  if (!room) return ''
  const lastMessages = getLastMessages(room)
  const typers = Object.entries(room.lastKeystrokes)
    .filter(([userId, lastKeystroke]) => Date.now() - lastKeystroke < 4000)
    // Exclude anyone who just posted a message
    .filter(([userId, lastKeystroke]) => lastKeystroke !== lastMessages[userId])
    // Exclude self
    .filter(([userId, lastKeystroke]) => userId !== selfId)
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

// Ghetto implementation of presence, by defining "online user" as
// logged in or posted a keystroke in the last 2 minutes
export function onlineUserIds(room: null | Room, selfId: undefined | string) {
  if (!room) return []
  const others = Object.values(room.users)
    .filter((user) => user.id !== selfId)
    .filter((user) => {
      const lastKeystroke = room.lastKeystrokes[user.id] || 0
      const lastLogin = user.lastLogin || 0
      const lastActive = Math.max(lastKeystroke, lastLogin)
      return Date.now() - lastActive < 2 * 60 * 1000
    })
    .map((user) => user.id)
  // Always include self as online, and as the first user
  return [selfId, ...others]
}
