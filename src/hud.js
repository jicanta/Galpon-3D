class HUD {
  constructor () {
    this.el = document.createElement('div');
    Object.assign(this.el.style, {
      position:        'fixed',
      top:             '8px',
      left:            '8px',
      color:           '#fff',
      fontFamily:      'Inter, Arial, sans-serif',
      fontSize:        '14px',
      lineHeight:      '18px',
      background:      'rgba(0,0,0,0.35)',
      padding:         '8px 12px',
      borderRadius:    '8px',
      pointerEvents:   'none',
      zIndex:          20
    });
    document.body.appendChild(this.el);
  }

  set (data) {
    const { curve, mode, form, height, twist } = data;
    this.el.innerHTML =
      `<b>Curva:</b> ${curve} &nbsp;|&nbsp; ` +
      `<b>Tipo:</b> ${mode} &nbsp;|&nbsp; ` +
      `<b>Forma:</b> ${form}<br>` +
      `<b>Altura:</b> ${height.toFixed(1)} &nbsp; ` +
      `<b>Torsión:</b> ${twist.toFixed(0)}°<br>` +
      `WASD: mover · Q/E: levantar · G: tomar/dejar · 1-6: cámaras`;
  }
}

/* instancia única */
export const hud = new HUD();
