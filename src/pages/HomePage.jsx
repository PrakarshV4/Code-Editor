import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import toast from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState('');

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success('Created a new room');
  };

  const joinRoom = () => {
    if(!roomId || !username) {
      toast.error('Room Id and Username are required');
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: {
        username,
      }
    })
  }

  const handleInputEnter = (e) => {
    if(e.code === 'Enter'){
      joinRoom();
    }
  }
  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img className="homePageLogo" src="/codeSync.png" alt="img" />
        <h4 className="mainLabel">Paste invitation ROOM ID</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="
          inputBox"
            placeholder="Room Id"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            className="
          inputBox "
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={handleInputEnter}
          />
          <button onClick={joinRoom} className="btn joinBtn">Join</button>
          <span className="createInfo">
            If you don't have an invite then create &nbsp;
            <a onClick={createNewRoom} href="" className="createNewBtn">
              new room
            </a>
          </span>
        </div>
      </div>

      <footer>
        <h4>
          Built by &nbsp;
          <a href="https://github.com/PrakarshV4">Prakarsh Verma</a>{" "}
        </h4>
      </footer>
    </div>
  );
}

export default HomePage;
