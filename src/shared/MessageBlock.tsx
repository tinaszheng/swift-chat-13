import { useState } from 'react';
import styled from '@emotion/styled'
import moment from 'moment';
import { MessageBlock, Message } from './types'

// a MessageBlock is a group of chat messages from the same user that should be displayed as a continuous block
const Messages = ({
  messageBlock,
  isSelf = false,
  onAvatarClick,
}: {
  messageBlock: MessageBlock
  isSelf?: boolean
  onAvatarClick: () => void,
}) => {
  const user = messageBlock.author
  return (
    <Container style={{ alignSelf: isSelf ? 'flex-end' : undefined }}>
      {!isSelf && <Avatar onClick={onAvatarClick}><img src={user.avatarUrl} alt="User profile" /></Avatar>}
      <Bubbles style={{ alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
        {!isSelf && <Name>{user.name}</Name>}
        {messageBlock.messages.map((msg: Message) => (
          <BubbleContainer isSelf={isSelf} text={msg.text} ts={msg.timestamp} key={msg.id} />
        ))}
      </Bubbles>
    </Container>
  )
}

const Avatar = styled.button`
    cursor: pointer;
    background: none;
    border: none;
`;

const BubbleContainer = ({ isSelf, text, ts }: {isSelf: boolean, text: string, ts: number}) => {
    const [showTimestamp, setShowTimestamp] = useState(false);
    const parsedTimestamp = moment(ts).calendar();
    return <TextAndTimestamp>
        {showTimestamp && isSelf && <Timestamp>{parsedTimestamp}</Timestamp>}
        <Bubble onMouseOver={() => setShowTimestamp(true)}  onMouseLeave={() => setShowTimestamp(false)}>{text}</Bubble>
        {showTimestamp && !isSelf &&  <Timestamp>{parsedTimestamp}</Timestamp>}
        
        </TextAndTimestamp>
}

const TextAndTimestamp = styled.div`
    display: flex;
    flex-flow: row;
    align-items: center;

    & + & {
        margin-top: 2px;
      }
`;

const Timestamp = styled.div`
    font-size: 12px;
    color: #7D7C7C;
    text-transform: lowercase;
    margin: 0 5px;
`;

const Container = styled.div`
  display: flex;
  flex-flow: row;
  align-items: flex-end;

  img {
    height: 25px;
    width: 25px;
    border-radius: 50%;
    margin: 0 8px;
  }

  margin-top: 15px;
  padding-left: 10px;
  padding-right: 10px;
`;

const Bubble = styled.div`
  background-color: #f5f5f5;
  border-radius: 30px;
  padding: 10px 12px;
  text-align: left;
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
