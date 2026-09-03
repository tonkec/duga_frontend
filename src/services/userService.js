import api from './api';

// Backend hard-caps the page size at 50 (MAX_USERS_LIMIT), so asking for more
// silently returns 50 — we page through everything instead.
const USERS_PAGE_LIMIT = 50;

const wait = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

const parseRetryAfterSeconds = response => {
  const retryAfter = Number(response?.headers?.['retry-after']);
  return Number.isFinite(retryAfter) && retryAfter >= 0 ? retryAfter : 1;
};

const getUsersPage = async (page, hasRetried = false) => {
  try {
    return await api.get('/users/get-users', {
      params: { page, limit: USERS_PAGE_LIMIT },
    });
  } catch (err) {
    if (!hasRetried && err.response && err.response.status === 429) {
      await wait(parseRetryAfterSeconds(err.response) * 1000);
      return getUsersPage(page, true);
    }
    throw err;
  }
};

const UserService = {
  // Resolves with a flat array of all users across every page.
  getAllUsers: async () => {
    const firstPage = await getUsersPage(1);
    const users = [...firstPage.data.data];
    const totalPages = firstPage.data.pagination?.totalPages ?? 1;

    // Sequential on purpose: the endpoint is rate limited per user.
    for (let page = 2; page <= totalPages; page += 1) {
      const nextPage = await getUsersPage(page);
      users.push(...nextPage.data.data);
    }

    return users;
  },
  getUser: id => {
    return api
      .get(`/users/${id}`)
      .then(res => {
        return res;
      })
      .catch(err => {
        throw err;
      });
  },
  updateUser: data => {
    return api
      .post('/users/update-user', { data })
      .then(res => {
        return res;
      })
      .catch(err => {
        throw err;
      });
  },
};

export default UserService;
