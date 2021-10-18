export type Message = {
  id: string
  text: string
  timestamp: number // ms since epoch
  author: Author
}

export type Room = {
  id: string
  videoUrl: string // url of the video or playlist
  videoStartTime: number // 0:00 for the video
  messages: Record<string, Message> // Map of message id to message
  // For typing indicator: map of user id to timestamp of last keystroke
  lastKeystrokes: Record<string, number>
  // Map of user id to users
  users: Record<string, Author>
}

// Author is a stripped-down version of the User object,
// containing the necessary info to render a chat bubble
export type Author = {
  id: string
  name: string
  avatarUrl: string
  lastLogin?: number // ms since epoch
}

export type MessageBlock = {
  author: Author
  messages: Message[]
}
