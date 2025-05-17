const keys = new Set();
export function initInput(){
  window.addEventListener('keydown', e=>keys.add(e.key));
  window.addEventListener('keyup',   e=>keys.delete(e.key));
}
Object.defineProperty(window,'keys',{ get:()=>keys });
