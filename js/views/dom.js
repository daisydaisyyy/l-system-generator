export function getDOMElements() {
    return {
      canvas: document.getElementById('drawingCanvas'),
      startBtn: document.getElementById('startBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      resetBtn: document.getElementById('resetBtn'),
      
      // Inputs
      axiomInput: document.getElementById('axiomInput'),
      depthInput: document.getElementById('depthInput'),
      rotInput: document.getElementById('rotInput'),
      lineWInput: document.getElementById('lineWInput'),
      scaleLineWInput: document.getElementById('scaleLineWInput'),
      showAnimInput: document.getElementById('showAnimInput'),
      backgroundColorInput: document.getElementById('backgroundColorInput'),
      angleInput: document.getElementById('angleInput'),
      newVarInput: document.getElementById('newVarInput'),
      drawingNameInput: document.getElementById('drawingNameInput'),
      drawingPublicInput: document.getElementById('drawingPublicInput'),
  
      // Containers & Areas
      varsContainer: document.getElementById('varsContainer'),
      userArea: document.getElementById('userArea'),
      drawingListContainer: document.getElementById('drawingListContainer'),
  
      // Buttons (Modal triggers & Actions)
      addVarBtn: document.getElementById('addVarBtn'),
      discardVarBtn: document.getElementById('discardVarBtn'),
      confirmVarBtn: document.getElementById('confirmVarBtn'),
      showLoginBtn: document.getElementById('showLoginBtn'), // Nota: potrebbe non esistere se loggato
      showRegisterBtn: document.getElementById('showRegisterBtn'),
      showSaveModalBtn: document.getElementById('showSaveModalBtn'),
      showLoadModalBtn: document.getElementById('showLoadModalBtn'),
  
      // Modals
      loginModal: document.getElementById('loginModal'),
      registerModal: document.getElementById('registerModal'),
      saveModal: document.getElementById('saveModal'),
      loadModal: document.getElementById('loadModal'),
      varModal: document.getElementById('varModal'),
  
      // Forms
      loginForm: document.getElementById('loginForm'),
      registerForm: document.getElementById('registerForm'),
      saveForm: document.getElementById('saveForm'),
  
      // Errors / Messages
      loginError: document.getElementById('loginError'),
      registerError: document.getElementById('registerError'),
      saveError: document.getElementById('saveError'),
      
      // Inputs Form Login/Reg (per facilità di accesso)
      registerUser: document.getElementById('registerUser'),
      registerPass: document.getElementById('registerPass'),
      loginUser: document.getElementById('loginUser'),
      loginPass: document.getElementById('loginPass')
    };
  }