export const initialState = {
  instr: '',
  isAnimating: false,
  curStep: 0,
  animId: null,
  stepSize: null,
  varObjList: [],
  axiom: '',
  currentUser: null,
  currentScale: 1,
  STEP_SIZE: 10,
  LINE_WIDTH: 1
};


export function resetAnimationState(state) {
  state.isAnimating = false;
  state.curStep = 0;
  if (state.animId) clearInterval(state.animId);
  state.animId = null;
}