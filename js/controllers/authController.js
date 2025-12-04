import { updateUserUI } from '../views/ui.js';
import * as API from '../api.js';


// Auth handlers
export async function onRegisterSubmit(e, state, elems) {
  e.preventDefault();
  elems.registerError.textContent = '';
  try {
    const data = await API.register(elems.registerUser.value, elems.registerPass.value);
    state.currentUser = data.username;
    updateUserUI(state, elems);
    elems.registerModal.classList.add('hidden');
    elems.registerForm.reset();
  } catch (err) {
    elems.registerError.textContent = err.message;
  }
}

export async function onLoginSubmit(e, state, elems) {
  e.preventDefault();
  elems.loginError.textContent = '';
  try {
    const data = await API.login(elems.loginUser.value, elems.loginPass.value);
    state.currentUser = data.username;
    updateUserUI(state, elems);
    elems.loginModal.classList.add('hidden');
    elems.loginForm.reset();
  } catch (err) {
    elems.loginError.textContent = err.message;
  }
}

export async function onLogout(state, elems) {
  try { await API.logout(); } catch (err) { console.error(err); }
  state.currentUser = null;
  updateUserUI(state, elems);
}

// Global listener setup for Logout (Event Delegation)
export function setupLogoutListener(state, elems) {
  document.addEventListener('click', (e) => {
    // Assicurati che il bottone creato in ui.js abbia id="logout-btn"
    if (e.target && e.target.id === 'logout-btn') {
      onLogout(state, elems);
    }
  });
}
