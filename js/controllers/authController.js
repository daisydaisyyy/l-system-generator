import { updateUserUI } from '../views/ui.js';
import * as API from '../api.js';
import { showMsg } from '../utils.js';

// auth handlers
export async function onRegisterSubmit(e, state, elems) {
  e.preventDefault();
  try {
    const data = await API.register(elems.registerUser.value, elems.registerPass.value);
    state.currentUser = data.username;
    updateUserUI(state, elems);
    elems.registerModal.classList.add('hidden');
    elems.registerForm.reset();
    showMsg("Registered!",true);
  } catch (err) {
    showMsg("Register error");
  }
}

export async function onLoginSubmit(e, state, elems) {
  e.preventDefault();
  
  try {
    const data = await API.login(elems.loginUser.value, elems.loginPass.value);
    state.currentUser = data.username;
    updateUserUI(state, elems);
    elems.loginModal.classList.add('hidden');
    elems.loginForm.reset();
    showMsg("Login successful!",true);
  } catch (err) {
    showMsg("Login error");
  }
}

export async function onLogout(state, elems) {
  try { 
    await API.logout(); 
    showMsg("Logout successful!",true);
  } catch (err) { 
    showMsg("Logout error"); 
  }
  state.currentUser = null;
  updateUserUI(state, elems);
}

// global listener setup for logout (event delegation)
export function setupLogoutListener(state, elems) {
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'logout-btn') {
      onLogout(state, elems);
    }
  });
}
