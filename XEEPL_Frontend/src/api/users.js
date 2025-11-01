// src/api/users.js
import { API_BASE_URL, API_HEADERS } from './config';

const usersBase = `${API_BASE_URL}/users`;

async function handleRes(res) {
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await res.json() : await res.text();
    const msg = body && body.message ? body.message : (typeof body === 'string' ? body : JSON.stringify(body));
    throw new Error(msg || 'API Error');
  }
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

export async function fetchUsers(query = '') {
  const url = query ? `${usersBase}?q=${encodeURIComponent(query)}` : usersBase;
  const res = await fetch(url, { headers: { ...API_HEADERS } });
  return handleRes(res);
}

export async function fetchUserById(id) {
  const res = await fetch(`${usersBase}/${id}`, { headers: { ...API_HEADERS } });
  return handleRes(res);
}

export async function addUser(userData) {
  const res = await fetch(usersBase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...API_HEADERS },
    body: JSON.stringify(userData),
  });
  return handleRes(res);
}

export async function editUser(id, userData) {
  const res = await fetch(`${usersBase}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...API_HEADERS },
    body: JSON.stringify(userData),
  });
  return handleRes(res);
}

export async function deleteUser(id) {
  const res = await fetch(`${usersBase}/${id}`, {
    method: 'DELETE',
    headers: { ...API_HEADERS },
  });
  return handleRes(res);
}

export async function uploadUserPhoto(id, file) {
  const form = new FormData();
  form.append('photo', file);
  const res = await fetch(`${usersBase}/${id}/photo`, {
    method: 'POST',
    body: form,
    headers: { ...API_HEADERS }, // DO NOT set Content-Type here
  });
  return handleRes(res);
}
