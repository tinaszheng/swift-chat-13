import React, { useEffect, useRef, useState, useCallback } from 'react'

// @ts-ignore
import ScrollToBottom from 'react-scroll-to-bottom'
import Youtube from 'react-youtube';

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

import mute from './images/mute.svg';
import unmute from './images/unmute.svg';

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
  const [numOnline, setNumOnline] = useState(0)
  const [player, setPlayer] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [currMessage, setCurrMessage] = useState('')
  const [typingIndicator, setTypingIndicator] = useState('')
  const [user, setUser] = useState<null | User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [playlist, setPlaylist] = useState(defaultPlaylist);
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [room, setRoom] = useState<null | Room>(null)
  const [currTimeout, setCurrTimeout] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);

  // We need a ref to use room in closures (e.g. for setTimeout)
  const roomRef = useRef(room)
  roomRef.current = room

  const [currVideo, setCurrVideo] = useState({
    url: "",
    name: "",
    offset: 0,
    index: 0,
    id: "",
    startMuted: true,
  });

  const videoRef = useRef(currVideo);
  videoRef.current = currVideo;

  const mutedRef = useRef(isMuted);
  mutedRef.current = isMuted;

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
        id: first.id,
        startMuted: mutedRef.current,
      });

      videoLength = first.length;
    } else {
      const next = playlist[video.index + 1];
      setCurrVideo({
        url: next.url,
        offset: 0,
        index: video.index + 1,
        name: next.name,
        id: next.id,
        startMuted: mutedRef.current,
      });

      videoLength = next.length;
    };

    setCurrTimeout(setTimeout(nextVideo, videoLength * 1000));
  };

  useEffect(() => {
    const playlistTotal = sum(playlist.map(p => p.length));
    const playlistOffset = getPlaylistOffset(PLAYLIST_START_TIME_EPOCH, playlistTotal);
    const [video, index, offset] = getVideoAndOffset(playlist, playlistOffset);
    
    setCurrVideo({
      url: video.url,
      offset: offset,
      index,
      name: video.name,
      id: video.id,
      startMuted: mutedRef.current,
    });

    const timeRemaining = video.length - offset; // in seconds
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
        name: user?.name || 'blondie fan 13',
        avatarUrl:
          user?.avatarUrl ||
          'https://i.pinimg.com/736x/56/41/94/56419465c8df9148f4851bc61232f314.jpg',
      },
    })

    setCurrMessage('')
  }

  const showEditProfile = () => {
    setIsEditingProfile(true)
  }

  const onMuteClick =  async () => {
    if (!player) return;

    if (player.isMuted()) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  }

  const onPlayerReady = (event: any) => {
    setPlayer(event.target);
  }

  useEffect(() => {
    if (!player) return;

    setIsMuted(player.isMuted());
  }, [player])


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
        <VideoLayover>
          <div>now playing: {currVideo.name}</div>
          {player && <button onClick={onMuteClick}><img style={ isMuted ? {  backgroundColor: "#C4C4C4", borderRadius: "50%"} : undefined} src={mute} alt="unmute" /></button>}
        </VideoLayover>
        <Youtube 
          videoId={currVideo.id}
          opts={{ height: '100%', width: "100%", playerVars: { autoplay: 1, controls: 0, mute: currVideo.startMuted ? 1 : 0, start: currVideo.offset, modestbranding: 1}}}
          onReady={onPlayerReady}
          containerClassName="player-container"
        />
      </Video>
      <Right>
        <Header>
          <div>
            <Title>the taylor swift virtual clubhouse</Title>
            <Online>
              <GreenDot /> {numOnline} {numOnline === 1 ? "swiftie" : "swifties"} online
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
  position: relative;

  iframe {
    pointer-events: none;
    height: 100%;
    width: 100%;
  }

  > .player-container {
    height: 100%;
    width: 100%;
  }
`;

const VideoLayover = styled.div`
  width: 100%;
  position: absolute;
  bottom: 0px;
  left: 0px;
  box-sizing: border-box;

  padding: 20px;
  color: white;

  img {
    height: 35px;
    width: 35px;
    margin-right: -8px;
    padding: 8px;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;

    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;

    &:focus {
      outline: none;
    }
  }

  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
`;

export default App
