export type Message = {
  id: string
  text: string
  timestamp: number // ms since epoch
  author: Author // Name of the user who sent the message
}

export type Room = {
  id: string
  videoUrl: string // url of the video or playlist
  videoStartTime: number // 0:00 for the video
  messages: Map<string, Message> // Map of message id to message
}

export type Author = {
  id: string
  name: string
  avatarUrl: string
}

export type MessageBlock = {
  author: Author
  messages: Message[]
}
