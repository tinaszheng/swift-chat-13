import Modal from 'react-modal'
import styled from '@emotion/styled'
import CorkImage from '../images/bg-btn.jpg'

import { User } from '../network/users'

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

const Profile = ({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean
  onClose: () => void
  user: User | null
}) => {
  if (!user) return null

  return (
    <Modal style={customStyles} isOpen={isOpen} onRequestClose={onClose}>
      <Content>
        <img
          src={
            user.avatarUrl ||
            'https://i.pinimg.com/736x/56/41/94/56419465c8df9148f4851bc61232f314.jpg'
          }
          alt="user"
        />
        <div style={{ fontSize: '24px', marginTop: '20px' }}>{user.name}</div>
        <div style={{ marginTop: '20px' }}>
          {user.description || 'no info yet. so mysterious!'}
        </div>
      </Content>

      <Button onClick={onClose}>ok</Button>
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
`

export default Profile
