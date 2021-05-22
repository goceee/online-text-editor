import { Dispatch, SetStateAction } from 'react';
import AuthenticationPage from './AuthenticationPage';
import UserPage from './UserPage';

interface Props {
  loggedIn: boolean | null;
  setLoggedIn: Dispatch<SetStateAction<boolean | null>>;
}

const HomePage = ({ loggedIn, setLoggedIn }: Props) => {
  if (loggedIn === null) return null;
  if (loggedIn) return <UserPage />;
  else return <AuthenticationPage setLoggedIn={setLoggedIn} />;
};

export default HomePage;
