import React, { useEffect, useRef, useState } from "react";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { ACTIONS } from "../Actions";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { initSocket } from "../../socket";
import toast from "react-hot-toast";

function EditorPage() {
  const { roomId } = useParams();
  const socketRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();

  const codeRef = useRef(null);

  const [clients, setClients] = useState([
    {
      socketId: 1,
      username: "Prakarsh V",
    },
    {
      socketId: 2,
      username: "Aadi T",
    },
    {
      socketId: 3,
      username: "Sparshs",
    },
  ]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      //error handlers
      socketRef.current.on("connect-error", (err) => handleErrors(err));
      socketRef.current.on("connect-failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log(e);
        toast.error("Socket connection failed, try again later");
        reactNavigator("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      //Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          //same user shoud not be notified
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room`);
            console.log(`${username} joined`);
          }

          setClients(clients);

          //Auto sync when new user joins on first load
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId
          });
          //now listen in server
        }
      );

      //Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };

    init();

    //when we return in useeffect it return when component is unmounted. Usually it is good to clean up our socket listeners in return function.
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    }
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied");
    }
    catch (error) {
      toast.error("Failed to copy");
      console.error(error);
    }
  }

  function leaveRoom() {

    reactNavigator("/");
  }

  //if username not given
  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/codeSync.png" alt="img" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
      </div>

      <div className="editorWrap">
        <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {
          codeRef.current = code;
        }}/>
      </div>
    </div>
  );
}

export default EditorPage;
