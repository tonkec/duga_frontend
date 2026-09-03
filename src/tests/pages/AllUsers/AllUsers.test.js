import { screen, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import FlashMessage from '../../../components/FlashMessage';
import FlashMessageProvider from '../../../context/FlashMessage/flashMessageProvider';
import appStore from '../../../store/index';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import AllProfilesPage from '../../../pages/AllProfilesPage';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
// https://github.com/jestjs/jest/issues/6434
global.setImmediate =
  global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));

const usersPageOne = [
  {
    avatar: 'http://placekitten.com/200/300',
    id: 45,
    firstName: 'antonija',
    lastName: 'v',
    email: 'antonija1023@gmail.com',
    password: 'jadajajad',
    gender: 'female',
    isVerified: true,
    createdAt: '2023-03-07T18:36:51.806Z',
    updatedAt: '2023-03-28T08:19:29.175Z',
  },
  {
    avatar: 'http://placekitten.com/200/300',
    id: 47,
    firstName: 'veronika',
    lastName: 'b',
    email: 'anto@mail.com',
    password: 'asdasfg',
    gender: 'female',
    isVerified: null,
    createdAt: '2023-03-09T07:23:17.183Z',
    updatedAt: '2023-03-09T07:23:17.183Z',
  },
  {
    avatar: 'http://placekitten.com/200/300',
    id: 48,
    firstName: 'petra',
    lastName: 'sim',
    email: 'marinka@mail.com',
    password: 'asfgdhg',
    gender: 'female',
    isVerified: true,
    createdAt: '2023-03-09T12:33:47.032Z',
    updatedAt: '2023-03-09T12:33:47.032Z',
  },
];

const usersPageTwo = [
  {
    avatar: 'http://placekitten.com/200/300',
    id: 52,
    firstName: 'ivana',
    lastName: 'k',
    email: 'ivana@mail.com',
    password: 'lozinka123',
    gender: 'female',
    isVerified: true,
    createdAt: '2023-03-10T10:00:00.000Z',
    updatedAt: '2023-03-10T10:00:00.000Z',
  },
];

beforeAll(() => {
  appStore.dispatch({
    type: 'LOGIN',
    payload: {
      ...usersPageOne[0],
      token: 'sometoken',
      isLoggedIn: true,
      isVerified: true,
    },
  });
});

const App = () => (
  <Provider store={appStore}>
    <FlashMessageProvider>
      <FlashMessage />
      <Router initialEntries={['/', '/svi-profili']}>
        <Routes>
          <Route path='/svi-profili' element={<AllProfilesPage />} />
        </Routes>
      </Router>
    </FlashMessageProvider>
  </Provider>
);

it('should render the page with heading Svi Profili', async () => {
  render(<App />);
  expect(await screen.findByText('Svi profili')).toBeInTheDocument();
});

it('should get all the users across every page', async () => {
  const pages = {
    1: usersPageOne,
    2: usersPageTwo,
  };
  const server = setupServer(
    rest.get(
      `${process.env.REACT_APP_BACKEND_PORT}/users/get-users`,
      (req, res, ctx) => {
        const page = req.url.searchParams.get('page');
        const limit = req.url.searchParams.get('limit');
        // The real backend rejects calls without page and limit.
        if (!page || !limit) {
          return res(
            ctx.status(400),
            ctx.json({
              errors: ['page and limit query parameters are required'],
            }),
          );
        }
        return res(
          ctx.set({
            Accept: 'application/json',
            Authorization: `Bearer sometoken`,
          }),
          ctx.status(200),
          ctx.json({
            data: pages[page] || [],
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: usersPageOne.length + usersPageTwo.length,
              totalPages: 2,
            },
          }),
        );
      },
    ),
  );
  server.listen();
  render(<App />);
  await waitFor(() => {
    expect(screen.getAllByTestId('user').map(user => user.textContent)).toEqual(
      ['antonija', 'veronika', 'petra', 'ivana'],
    );
  });
  server.close();
});
