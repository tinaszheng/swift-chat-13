import React, { useEffect, useState } from 'react'
import './App.css'
import styled from '@emotion/styled'
import GreenDot from './shared/GreenDot'
import defaultMessages from './test/messages'
import { groupByAuthor } from './shared/util'
import MessageBlock from './shared/MessageBlock'
import { User, listenForLogin, firebaseLogout } from './network/users'
import Login from './shared/Login'

const defaultAuthor = {
  id: '1',
  avatarUrl:
    'https://i.pinimg.com/736x/56/41/94/56419465c8df9148f4851bc61232f314.jpg',
  name: 'tina',
}

const CACHED_USER_KEY = 'CACHED_USER_KEY'

function App() {
  const [numOnline, setNumOnline] = useState(15)
  const [messages, setMessages] = useState(defaultMessages)
  const [currMessage, setCurrMessage] = useState('')
  const [user, setUser] = useState<null | User>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cachedUser = localStorage.getItem(CACHED_USER_KEY)
    if (cachedUser) {
      setUser(JSON.parse(cachedUser))
    }

    listenForLogin(setUser)

    setIsLoading(false)
  }, [])

  const groupedMessages = groupByAuthor(messages)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit()
    }
  }

  const onChatInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrMessage(e.target.value)
  }

  const onSubmit = () => {
    setMessages((curr) => [
      ...curr,
      {
        id: Date.now().toString(),
        author: { ...defaultAuthor },
        text: currMessage,
        timestamp: Date.now(),
      },
    ])

    setCurrMessage('')
  }

  const onLogOut = () => {
    firebaseLogout()
    setUser(null)
  }

  return (
    <div className="App">
      {!isLoading && !user && <Login />}
      <div className="video">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube-nocookie.com/embed/videoseries?list=PLD9KBjmKSTfEM6LsQgu2aY7CQcSOSWARL&autoplay=1&start=903"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <Right>
        <Header>
          <Title>the taylor swift virtual clubhouse</Title>
          <Online>
            <GreenDot /> {numOnline} swifties online
          </Online>
          {user && <button onClick={onLogOut}>log out</button>}
        </Header>
        <Chat>
          {groupedMessages.map((messageBlock) => (
            <MessageBlock
              isSelf={messageBlock.author.id === defaultAuthor.id}
              key={messageBlock.messages[0].id}
              messageBlock={messageBlock}
            />
          ))}
        </Chat>
        <InputContainer>
          <input
            onKeyDown={handleKeyDown}
            value={currMessage}
            onChange={onChatInput}
          />
        </InputContainer>
      </Right>
    </div>
  )
}

const Right = styled.div`
  display: flex;
  flex-flow: column;
  flex: 1;
  height: 100vh;
`

const Header = styled.div`
  background-color: #fff0f0;
  padding: 18px;
  display: flex;
  flex-flow: row;
  justify-content: space-between;

  display: flex;
  flex-flow: column;
  align-items: flex-start;
`

const Title = styled.div`
  font-size: 24px;
  margin-bottom: 5px;
`

const Online = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  color: #7d7c7c;

  > div {
    margin-right: 8px;
  }
`

const Chat = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column;
`

const InputContainer = styled.div`
  background-color: #f5f5f5;
  padding: 10px;
  display: flex;

  > input {
    background-color: white;
    font-size: 14px;
    border-radius: 30px;
    outline: none;
    border: none;
    padding: 10px 12px;
    flex: 1;
  }
`

export default App
