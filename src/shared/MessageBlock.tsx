import styled from '@emotion/styled'
import { MessageBlock, Message } from './types'

// a MessageBlock is a group of chat messages from the same user that should be displayed as a continuous block
const Messages = ({
  messageBlock,
  isSelf = false,
}: {
  messageBlock: MessageBlock
  isSelf?: boolean
}) => {
  const user = messageBlock.author
  return (
    <Container style={{ alignSelf: isSelf ? 'flex-end' : undefined }}>
      {!isSelf && <img src={user.avatarUrl} alt="User profile" />}
      <Bubbles style={{ alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
        {!isSelf && <Name>{user.name}</Name>}
        {messageBlock.messages.map((msg: Message) => (
          <Bubble key={msg.id}>{msg.text}</Bubble>
        ))}
      </Bubbles>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-flow: row;
  align-items: flex-end;

  > img {
    height: 25px;
    width: 25px;
    border-radius: 50%;
    margin: 0 8px;
  }

  margin-top: 15px;
  padding-left: 10px;
  padding-right: 10px;
`

const Bubble = styled.div`
  background-color: #f5f5f5;
  border-radius: 30px;
  padding: 10px 12px;
  text-align: left;

  & + & {
    margin-top: 2px;
  }
`

const Bubbles = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
`

const Name = styled.div`
  font-size: 12px;
  color: #7d7c7c;
  margin-left: 5px;
`

export default Messages
