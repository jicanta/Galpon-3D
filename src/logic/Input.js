export class Input {
  #map = new Map();

  onKey(code, pressed) { this.#map.set(code, pressed); }

  key(code) { return this.#map.get(code) ?? false; }
}
