import store from "../store/index.js";

const SET_SESSION = (E, F) => {
  try {
    window.sessionStorage.setItem(E, F);
    return true;
  } catch (error) {
    return false;
  }
};
const GET_SESSION = G => {
  try {
    return window.sessionStorage.getItem(G);
  } catch (error) {
    return null;
  }
};
const DEL_SESSION = K => {
  try {
    window.sessionStorage.removeItem(K);
    return true;
  } catch (error) {
    return false;
  }
};

const SET_LOCAL = (H, I) => {
  try {
    window.localStorage.setItem(H, I);
    return true;
  } catch (error) {
    return false;
  }
};
const GET_LOCAL = J => {
  try {
    return window.localStorage.getItem(J);
  } catch (error) {
    return null;
  }
};
const DEL_LOCAL = J => {
  try {
    window.localStorage.removeItem(J);
    return true;
  } catch (error) {
    return false;
  }
};

const COMMIT = (STR, DATA) => {
  if (typeof STR === "string") return store.commit(STR, DATA);
  if (typeof STR === "object" && STR !== null && Object.keys(STR).length > 0) {
    for (const key in STR) {
      store.commit(key, STR[key]);
    }
  }
};
const DISPATCH = (STR, DATA) => store.dispatch(STR, DATA);

export {
  SET_SESSION,
  GET_SESSION,
  DEL_SESSION,
  SET_LOCAL,
  GET_LOCAL,
  DEL_LOCAL,
  COMMIT,
  DISPATCH,
};
