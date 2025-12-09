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
  
      // modals
      varModal: document.getElementById('varModal'),
    };
  }