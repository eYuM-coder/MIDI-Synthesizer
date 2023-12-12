import { Keyboard } from './node_modules/piano-keyboard';
const pianoContainer = document.getElementById('piano');
const myPiano = new Keyboard(pianoContainer);

function main() {
  pianoContainer.innerHTML(myPiano);
}

main();