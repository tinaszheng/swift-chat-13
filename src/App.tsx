import React, { useEffect, useRef, useState, useCallback } from 'react'

// @ts-ignore
import ScrollToBottom from 'react-scroll-to-bottom'
import './App.css'
import styled from '@emotion/styled'
import { css } from '@emotion/css'
import GreenDot from './shared/GreenDot'
import { groupByAuthor, currentlyTyping } from './shared/util'
import MessageBlock from './shared/MessageBlock'
import { User, listenForLogin, firebaseLogout, getUser } from './network/users'
import Login from './shared/Login'
import UserProfile from './shared/UserProfile'
import EditProfile from './shared/EditUserProfile'
import {
  createMessage,
  registerKeystroke,
  listenRoom,
  registerUser,
} from './network/rooms'
import { Room } from './shared/types'
import { throttle, sum } from 'lodash'
import { listenForPresence, registerPresence } from './network/presence'
import defaultPlaylist, { getPlaylistOffset, getVideoAndOffset } from './playlists';

const CACHED_USER_KEY = 'CACHED_USER_KEY'
const ROOM_ID = 'wildest-dreams'
const PLAYLIST_START_TIME_EPOCH = 1634760712046;

let TYPING_TIMEOUT_ID: any

const throttledRegisterKeystroke = throttle(registerKeystroke, 3000, {
  leading: true,
  trailing: true,
})

function App() {
  const [numOnline, setNumOnline] = useState(15)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [currMessage, setCurrMessage] = useState('')
  const [typingIndicator, setTypingIndicator] = useState('')
  const [user, setUser] = useState<null | User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [playlist, setPlaylist] = useState(defaultPlaylist);
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [room, setRoom] = useState<null | Room>(null)
  const [currTimeout, setCurrTimeout] = useState<any>(null);
  // We need a ref to use room in closures (e.g. for setTimeout)
  const roomRef = useRef(room)
  roomRef.current = room

  const [currVideo, setCurrVideo] = useState({
    url: "",
    name: "",
    offset: 0,
    index: 0,
  });

  const videoRef = useRef(currVideo);
  videoRef.current = currVideo;

  const nextVideo = () => {
    let videoLength;
    
    // at the end of the playlist, go back to beginning
    const video = videoRef.current;
    if (video.index === playlist.length - 1) {
      const first = playlist[0];
      setCurrVideo({
        url: first.url,
        offset: 0,
        index: 0,
        name: first.name,
      });

      videoLength = first.length;
      console.log("0 now playing: ", first.name);
    } else {
      const next = playlist[video.index + 1];
      setCurrVideo({
        url: next.url,
        offset: 0,
        index: video.index + 1,
        name: next.name,
      });

      videoLength = next.length;
      console.log("1 now playing: ", next.name);
    };

    console.log("next in ", videoLength, " seconds");
    setCurrTimeout(setTimeout(nextVideo, videoLength * 1000));
  };

  useEffect(() => {
    console.log('CurrVideo Updated', currVideo);
  }, [currVideo]);

  useEffect(() => {
    console.log("calling useEffect");
    const playlistTotal = sum(playlist.map(p => p.length));
    const playlistOffset = getPlaylistOffset(PLAYLIST_START_TIME_EPOCH, playlistTotal);
    const [video, index, offset] = getVideoAndOffset(playlist, playlistOffset);
    
    setCurrVideo({
      url: video.url,
      offset: offset,
      index,
      name: video.name
    });

    const timeRemaining = video.length - offset; // in seconds

    console.log("currently playing: ", video.name);
    console.log("next in ", timeRemaining, " seconds");
    setCurrTimeout(setTimeout(nextVideo, timeRemaining * 1000));
    return () => {
      clearTimeout(currTimeout);
    };
  }, [playlist]);

  useEffect(() => {
    const cachedUser = localStorage.getItem(CACHED_USER_KEY)
    if (cachedUser) {
      setUser(JSON.parse(cachedUser))
    }

    listenForLogin((user) => {
      setUser(user)
      // Hide email and other sensitive info
      registerUser(ROOM_ID, {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      })
      registerPresence(user.id)
    })

    setIsLoading(false)
  }, [])

  useEffect(() => {
    listenForPresence((userIds) => setNumOnline(userIds.length))
  }, [])

  useEffect(() => listenRoom(ROOM_ID, setRoom), [])

  // Once called, rerun every 1s until there are no more people typing
  function rerenderTypingIndicator() {
    clearTimeout(TYPING_TIMEOUT_ID)
    const typingIndicator = currentlyTyping(roomRef.current, user?.id)
    setTypingIndicator(typingIndicator)
    if (typingIndicator) {
      TYPING_TIMEOUT_ID = setTimeout(rerenderTypingIndicator, 1000)
    }
  }

  // Whenever lastKeystrokes change, start rerendering typing indicator
  useEffect(rerenderTypingIndicator, [room?.lastKeystrokes])

  const sortedMessages = Object.values(room?.messages || {}).sort(
    (a, b) => a.timestamp - b.timestamp
  )
  const groupedMessages = groupByAuthor(sortedMessages)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      onSubmit()
    }
  }

  const onChatInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrMessage(e.target.value)
    throttledRegisterKeystroke(ROOM_ID, user?.id || '')
  }

  const onSetUserProfile = async (userID: string) => {
    const user = await getUser(userID)
    setUserProfile(user)
  }

  const onSubmit = () => {
    if (!currMessage) return; 

    createMessage(ROOM_ID, {
      id: Date.now().toString(),
      text: currMessage,
      timestamp: Date.now(),
      author: {
        id: user?.id || '0',
        name: user?.name || 'blonde fan 13',
        avatarUrl:
          user?.avatarUrl ||
          'https://i.pinimg.com/736x/56/41/94/56419465c8df9148f4851bc61232f314.jpg',
      },
    })

    setCurrMessage('')
  }

  const onLogOut = () => {
    firebaseLogout()
    setUser(null)
  }

  const showEditProfile = () => {
    setIsEditingProfile(true)
  }

  return (
    <div className="App">
      {!isLoading && !user && <Login />}
      {isEditingProfile && (
        <EditProfile
          isOpen
          onSubmit={setUser}
          onClose={() => setIsEditingProfile(false)}
          user={user}
        />
      )}
      <UserProfile
        isOpen={Boolean(userProfile)}
        onClose={() => {
          setUserProfile(null)
        }}
        user={userProfile}
      />
      <Video>
        <iframe
          width="100%"
          height="100%"
          src={`${currVideo.url}?&autoplay=1&start=${currVideo.offset}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </Video>
      <Right>
        <Header>
          <div>
            <Title>the taylor swift virtual clubhouse</Title>
            <Online>
              <GreenDot /> {numOnline} swifties online
            </Online>
          </div>
          {user && <EditProfileButton onClick={showEditProfile}>
            <img src={user?.avatarUrl} alt="edit your profile" />
          </EditProfileButton>}
        </Header>
        <ScrollToBottom className={chat}>
          {groupedMessages.map((messageBlock) => (
            <MessageBlock
              onAvatarClick={() => onSetUserProfile(messageBlock.author.id)}
              isSelf={messageBlock.author.id === user?.id}
              key={messageBlock.messages[0].id}
              messageBlock={messageBlock}
            />
          ))}
          <TypingIndicator>{typingIndicator}</TypingIndicator>
        </ScrollToBottom>
        <InputContainer>
          <textarea
            rows={1}
            placeholder="Send a message"
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
  align-items: center;
`

const Title = styled.div`
  font-size: 24px;
  margin-bottom: 5px;
`

const TypingIndicator = styled.div`
  position: absolute;
  bottom: 5px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  text-align: center;
  color: #7d7c7c;
`;

const Online = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  color: #7d7c7c;

  > div {
    margin-right: 8px;
  }
`

const chat = css`
  flex: 1;
  overflow-y: overlay;
  > div {
    display: flex;
    flex-flow: column;
  }

  padding-bottom: 25px;
`

const EditProfileButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  > img {
    border-radius: 50%;
    height: 40px;
    width: 40px;
    object-fit: cover;
  }
`

const InputContainer = styled.div`
  background-color: #f5f5f5;
  padding: 10px;
  display: flex;

  > textarea {
    background-color: white;
    font-size: 14px;
    border-radius: 30px;
    outline: none;
    border: none;
    padding: 10px 12px;
    flex: 1;
  }
`

const Video = styled.div`
  // pointer-events: none;
`;

export default App
