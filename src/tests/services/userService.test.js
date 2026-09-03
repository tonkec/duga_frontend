import UserService from '../../services/userService';
import api from '../../services/api';

jest.mock('../../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const pageResponse = (page, data, totalPages) => ({
  data: {
    data,
    pagination: { page, limit: 50, total: 87, totalPages },
  },
});

const rateLimitedError = retryAfter => {
  const err = new Error('Request failed with status code 429');
  err.response = {
    status: 429,
    headers: { 'retry-after': retryAfter },
    data: { errors: ['rate_limited'] },
  };
  return err;
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('always sends page and limit query parameters', async () => {
  api.get.mockResolvedValueOnce(pageResponse(1, [{ id: 1 }], 1));

  await UserService.getAllUsers();

  expect(api.get).toHaveBeenCalledTimes(1);
  expect(api.get).toHaveBeenCalledWith('/users/get-users', {
    params: { page: 1, limit: 50 },
  });
});

it('fetches every page sequentially and merges the users into one flat array', async () => {
  const pageOneUsers = [{ id: 1 }, { id: 2 }];
  const pageTwoUsers = [{ id: 3 }];
  const pageThreeUsers = [{ id: 4 }];
  api.get
    .mockResolvedValueOnce(pageResponse(1, pageOneUsers, 3))
    .mockResolvedValueOnce(pageResponse(2, pageTwoUsers, 3))
    .mockResolvedValueOnce(pageResponse(3, pageThreeUsers, 3));

  const users = await UserService.getAllUsers();

  expect(users).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
  expect(api.get).toHaveBeenCalledTimes(3);
  expect(api.get).toHaveBeenNthCalledWith(1, '/users/get-users', {
    params: { page: 1, limit: 50 },
  });
  expect(api.get).toHaveBeenNthCalledWith(2, '/users/get-users', {
    params: { page: 2, limit: 50 },
  });
  expect(api.get).toHaveBeenNthCalledWith(3, '/users/get-users', {
    params: { page: 3, limit: 50 },
  });
});

it('retries a page once after a 429, waiting for Retry-After', async () => {
  api.get
    .mockResolvedValueOnce(pageResponse(1, [{ id: 1 }], 2))
    .mockRejectedValueOnce(rateLimitedError('0'))
    .mockResolvedValueOnce(pageResponse(2, [{ id: 2 }], 2));

  const users = await UserService.getAllUsers();

  expect(users).toEqual([{ id: 1 }, { id: 2 }]);
  expect(api.get).toHaveBeenCalledTimes(3);
  // The rate-limited page 2 is retried with the same parameters.
  expect(api.get).toHaveBeenNthCalledWith(2, '/users/get-users', {
    params: { page: 2, limit: 50 },
  });
  expect(api.get).toHaveBeenNthCalledWith(3, '/users/get-users', {
    params: { page: 2, limit: 50 },
  });
});

it('gives up when the retried page is rate limited again', async () => {
  api.get
    .mockResolvedValueOnce(pageResponse(1, [{ id: 1 }], 2))
    .mockRejectedValueOnce(rateLimitedError('0'))
    .mockRejectedValueOnce(rateLimitedError('0'));

  await expect(UserService.getAllUsers()).rejects.toMatchObject({
    response: { status: 429 },
  });
  expect(api.get).toHaveBeenCalledTimes(3);
});

it('propagates non-429 errors without retrying', async () => {
  const serverError = new Error('Request failed with status code 500');
  serverError.response = { status: 500, headers: {} };
  api.get.mockRejectedValueOnce(serverError);

  await expect(UserService.getAllUsers()).rejects.toBe(serverError);
  expect(api.get).toHaveBeenCalledTimes(1);
});
