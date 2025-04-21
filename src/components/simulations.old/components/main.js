import { MyApp } from './MyApp.js';

// Cria um objeto fictício com os métodos esperados
const dummyContents = {
  update: () => {},
  postRenderUpdate: () => {},
  onResize: () => {},
  updateOnControlsChange: () => {}
};

// Instancia e configura a app
const app = new MyApp();
app.init();
app.setContents(dummyContents);
app.render();
