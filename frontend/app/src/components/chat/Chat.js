import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchChats } from "../../store/actions/chat";
import { logout } from "./../../store/actions/auth";
import Messenger from "../Messenger";
import FriendList from "../FriendList";

const Chat = () => {
  const user = useSelector((state) => state.authReducer.user);
  const dispatch = useDispatch();

  const onClick = () => {
    dispatch(logout());
  };

  useEffect(() => {
    dispatch(fetchChats())
      .then((res) => console.log(res))
      .catch((e) => console.log(e));
  }, [dispatch]);

  return (
    <>
      <h1>Chat</h1>
      {user.email} <img src={user.avatar} alt="kitten" />
      <button onClick={onClick}>Log out</button>
      <FriendList />
      <Messenger />
    </>
  );
};

export default Chat;
