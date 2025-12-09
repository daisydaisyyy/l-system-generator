// gestione del php
export async function register(username, password) {
    const res = await fetch('../php/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  }
  
  export async function login(username, password) {
    const res = await fetch('../php/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  }
  
  export async function logout() {
    await fetch('../php/logout.php');
  }
  
  export async function saveDrawing(payload) {
    const res = await fetch('../php/save_drawing.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');
    return data;
  }
  
  export async function getDrawingsList() {
    const res = await fetch('../php/list_drawings.php?page=1&per_page=100');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load list');
    return data;
  }
  
  export async function loadDrawing(name, owner) {
    const res = await fetch(`../php/load_drawing.php?name=${encodeURIComponent(name)}&owner=${encodeURIComponent(owner)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load drawing');
    return data;
  }
  
  export async function deleteDrawing(name) {
    const res = await fetch(`../php/delete_drawing.php?name=${encodeURIComponent(name)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete drawing');
    return data;
  }
  
  export async function checkSession() {
    const res = await fetch('../php/check_session.php');
    if (res.ok) {
      return await res.json();
    }
    return null;
  }