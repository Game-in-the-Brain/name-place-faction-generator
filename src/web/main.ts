import './style.css';
import { preloadAllData } from './data-loader.js';
import { App } from './App.js';

// Preload all LC JSON data into memory (bundled at build time)
preloadAllData();

const app = new App(document.getElementById('app')!);
app.mount();
