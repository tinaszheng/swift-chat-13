// type Message = {
//   id: string
//   text: string
//   timestamp: number // ms since epoch
//   author: string // Name of the user who sent the message
// }

const message1 = {
  id: '1',
  text: 'tinas message',
  timestamp: 1634161506950,
  author: {
    id: '1',
    avatarUrl:
      'https://i.pinimg.com/736x/56/41/94/56419465c8df9148f4851bc61232f314.jpg',
    name: 'tina',
  },
}

const message2 = {
  id: '2',
  text: 'austins message',
  timestamp: 1634161506952,
  author: {
    id: '2',
    avatarUrl:
      'https://i.pinimg.com/736x/56/41/94/56419465c8df9148f4851bc61232f314.jpg',
    name: 'austin',
  },
}

const message3 = {
  id: '3',
  text: 'austins second message',
  timestamp: 1634161506953,
  author: {
    id: '2',
    avatarUrl:
      'https://i.pinimg.com/736x/56/41/94/56419465c8df9148f4851bc61232f314.jpg',
    name: 'austin',
  },
}

const message4 = {
  id: '4',
  text: 'taylors message',
  timestamp: 1634161506954,
  author: {
    id: '3',
    avatarUrl:
      'https://i.pinimg.com/736x/56/41/94/56419465c8df9148f4851bc61232f314.jpg',
    name: 'taylor',
  },
}

const message5 = {
  id: '5',
  text: 'tinas second message',
  timestamp: 1634161506954,
  author: {
    id: '1',
    avatarUrl:
      'https://i.pinimg.com/736x/56/41/94/56419465c8df9148f4851bc61232f314.jpg',
    name: 'tina',
  },
}

const messages = [message1, message2, message3, message4, message5]

export default messages
