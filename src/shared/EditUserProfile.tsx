import { useState } from 'react'
import Modal from 'react-modal'
import styled from '@emotion/styled'
import CorkImage from '../images/bg-btn.jpg'

import { User, setUser, firebaseLogout } from '../network/users'
import React from 'react'

Modal.setAppElement('#root')

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    fontFamily: 'IM Fell DW Pica, serif',
    backgroundColor: '#FFF0F0',
    padding: '50px 100px',
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'center',
    borderRadius: '25px',
  },
}

const EditProfile = ({
  isOpen,
  onSubmit,
  onClose,
  user,
}: {
  onSubmit: (user: User | null) => void
  isOpen: boolean
  onClose: () => void
  user: User | null
}) => {
  const [newUser, setNewUser] = useState({
    avatarUrl:
      user?.avatarUrl ||
      'https://i.pinimg.com/736x/56/41/94/56419465c8df9148f4851bc61232f314.jpg',
    name: user?.name || '',
    description: user?.description || '',
  })

  const onSave = () => {
    if (!user) return
    const updatedUser = {
      ...newUser,
      id: user.id,
      email: user.email,
      createTime: user.createTime,
      lastUpdateTime: user.lastUpdateTime,
    }

    setUser(user.id, updatedUser)
    onSubmit(updatedUser)
    onClose()
  }

  const onLogOut = () => {
    firebaseLogout()
    onSubmit(null)
    close()
  }

  const onFieldChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setNewUser((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    }

  if (!user) return null
  return (
    <Modal style={customStyles} isOpen={isOpen} onRequestClose={onClose}>
      <Content>
        <img src={newUser.avatarUrl} alt="user" />
        <input
          placeholder="Display name"
          value={newUser.name}
          onChange={onFieldChange('name')}
        />
        <textarea
          rows={8}
          placeholder="about you. feel free to plug your ig/tiktok/discord here"
          value={newUser.description}
          onChange={onFieldChange('description')}
        />
      </Content>
      <Button onClick={onSave}>save</Button>
      <LogOut onClick={onLogOut}>log out</LogOut>
    </Modal>
  )
}

const Content = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  > img {
    height: 100px;
    width: 100px;
    border-radius: 50%;
  }
  > input,
  textarea {
    min-width: 300px;
    width: 100%;
    margin-top: 30px;
    border: none;
    padding: 20px;
    font-family: IM Fell DW Pica, serif;
  }

  > textarea {
    resize: none;
  }
`

const Button = styled.button`
  margin-top: 20px;
  cursor: pointer;
  background-image: url(${CorkImage});
  border: none;
  font-size: 24px;
  color: white;
  font-style: italic;
  font-family: IM Fell DW Pica, serif;
  padding: 10px 25px;

  display: flex;
  align-items: center;
`

const LogOut = styled.button`
  background: none;
  border: none;
  margin-top: 20px;
  cursor: pointer;
  font-style: italic;
  font-family: IM Fell DW Pica, serif;
  color: #7d7c7c;
  font-size: 18px; ;
`

export default EditProfile
