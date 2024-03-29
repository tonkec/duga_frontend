import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../../store/actions/auth';

import './Links.scss';
const links = [
  {
    to: 'svi-profili',
    text: 'svi profili',
  },
  {
    to: 'poruke',
    text: 'moje poruke',
  },
  {
    to: 'profil',
    text: 'moj račun',
  },
];

const Links = () => {
  const socket = useSelector(state => state.chatReducer.socket);
  const currentUser = useSelector(state => state.authReducer.user);

  const dispatch = useDispatch();
  const onLogoutClick = () => {
    socket.emit('has-gone-offline', currentUser);
    dispatch(logout());
  };
  return (
    <nav>
      <ul>
        {links.map((link, i) => (
          <li key={i}>
            <Link to={`/${link.to}`}>{link.text}</Link>
          </li>
        ))}

        <li>
          <Link to={`/`} onClick={onLogoutClick}>
            Odjavi se
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Links;
