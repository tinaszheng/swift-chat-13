import Modal from 'react-modal';
import styled from '@emotion/styled'
import CorkImage from '../images/bg-btn.jpg';

import { firebaseLogin } from '../network/users';

Modal.setAppElement('#root');

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
  };

const LogIn = () => {
    return <Modal style={customStyles} isOpen>
        <div style={{ fontSize: '32px'}}>welcome!</div>
        <div style={{ fontSize: '24px'}}>please log in to continue</div>
        <Button onClick={firebaseLogin}>log in with google</Button>
    </Modal>
};

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
`;

export default LogIn;

