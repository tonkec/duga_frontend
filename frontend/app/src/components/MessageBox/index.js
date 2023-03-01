import { useEffect, useRef, useState } from "react";
import "./MessageBox.scss";
import Message from "../Message";
import { useSelector, useDispatch } from "react-redux";
import { paginateMessages } from "../../store/actions/chat";
const MessageBox = ({ chat }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [scrollUp, setScrollUp] = useState(0);
  const user = useSelector((state) => state.authReducer.user);
  const scrollBottom = useSelector((state) => state.chatReducer.scrollBottom);
  const senderTyping = useSelector((state) => state.chatReducer.senderTyping);

  const msgBox = useRef();

  useEffect(() => {
    setTimeout(() => {
      scrollManual(msgBox.current.scrollHeight);
    }, 100);
  }, [scrollBottom]);

  const scrollManual = (value) => {
    msgBox.current.scrollTop = value;
  };

  const handeInfiniteScroll = (e) => {
    if (e.target.scrollTop === 0) {
      setLoading(true);
      const pagination = chat.Pagination;
      const page = typeof pagination === "undefined" ? 1 : pagination.page;
      dispatch(paginateMessages(chat.id, parseInt(page) + 1))
        .then((res) => {
          if (res) {
            setScrollUp(scrollUp + 1);
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollManual(Math.ceil(msgBox.current.scrollHeight * 0.1));
    }, 100);
  }, [scrollUp]);

  useEffect(() => {
    if (
      senderTyping.typing &&
      msgBox.current.scrollTop > msgBox.current.scrollHeight * 0.3
    ) {
      setTimeout(() => {
        scrollManual(msgBox.current.scrollHeight);
      }, 100);
    }
  }, [senderTyping]);

  useEffect(() => {
    if (!senderTyping.typing) {
      setTimeout(() => {
        scrollManual(msgBox.current.scrollHeight);
      }, 100);
    }
  }, [scrollBottom, senderTyping.typing]);

  return (
    <div id="msg-box" ref={msgBox} onScroll={handeInfiniteScroll}>
      {loading ? <p>Loading</p> : null}
      {chat.Messages.map((message, index) => (
        <Message
          user={user}
          chat={chat}
          message={message}
          index={index}
          key={message.id}
        />
      ))}
      {senderTyping.typing && senderTyping.chatId === chat.id ? (
        <div className="message">
          <div className="other-person">
            <p>
              {senderTyping.fromUser.firstName}
              {senderTyping.fromUser.lasttName}...
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MessageBox;
