import { Message, MessageBlock } from './types'

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
