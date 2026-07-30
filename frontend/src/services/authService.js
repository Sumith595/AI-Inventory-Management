const STORAGE_USERS_KEY = 'invotrack_users';
const STORAGE_TOKEN_KEY = 'invotrack_token';

function _loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function _saveUsers(users) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

export async function signup({ name, email, password }) {
  const users = _loadUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error('User already exists');
  }
  const newUser = { id: Date.now(), name, email, password };
  users.push(newUser);
  _saveUsers(users);
  // auto-login
  const token = 'fake-jwt-' + newUser.id;
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  return { token, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
}

export async function login({ email, password }) {
  const users = _loadUsers();
  // If no users exist (fresh dev environment), create a demo user to allow signing in for testing.
  if (!users || users.length === 0) {
    const demo = { id: 1, name: 'Demo User', email: 'demo@local', password: 'demo' };
    users.push(demo);
    _saveUsers(users);
  }
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const token = 'fake-jwt-' + user.id;
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

export function logout() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
}

export function isAuthenticated() {
  return !!localStorage.getItem(STORAGE_TOKEN_KEY);
}

export function getCurrentUser() {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  if (!token) return null;
  const id = token.replace('fake-jwt-', '');
  const users = _loadUsers();
  const user = users.find((u) => String(u.id) === String(id));
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}

export default { signup, login, logout, isAuthenticated, getCurrentUser };
