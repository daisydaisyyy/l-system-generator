// prende i dati dal DOM
export function getDOMElements() {
    return {
      canvas: document.getElementById('drawingCanvas'),
      startBtn: document.getElementById('startBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      resetBtn: document.getElementById('resetBtn'),
      
      // inputs
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
  
      // containers
      varsContainer: document.getElementById('varsContainer'),
      userArea: document.getElementById('userArea'),
      drawingListContainer: document.getElementById('drawingListContainer'),
  
      // buttons
      addVarBtn: document.getElementById('addVarBtn'),
      discardVarBtn: document.getElementById('discardVarBtn'),
      confirmVarBtn: document.getElementById('confirmVarBtn'),
      showLoginBtn: document.getElementById('showLoginBtn'), // Nota: potrebbe non esistere se loggato
      showRegisterBtn: document.getElementById('showRegisterBtn'),
      showSaveModalBtn: document.getElementById('showSaveModalBtn'),
      showLoadModalBtn: document.getElementById('showLoadModalBtn'),
  
      // modals
      loginModal: document.getElementById('loginModal'),
      registerModal: document.getElementById('registerModal'),
      saveModal: document.getElementById('saveModal'),
      loadModal: document.getElementById('loadModal'),
      varModal: document.getElementById('varModal'),
  
      // forms
      loginForm: document.getElementById('loginForm'),
      registerForm: document.getElementById('registerForm'),
      saveForm: document.getElementById('saveForm'),
  
      // messages
      loginError: document.getElementById('loginError'),
      registerError: document.getElementById('registerError'),
      saveError: document.getElementById('saveError'),
      
      // form inputs
      registerUser: document.getElementById('registerUser'),
      registerPass: document.getElementById('registerPass'),
      loginUser: document.getElementById('loginUser'),
      loginPass: document.getElementById('loginPass')
    };
  }