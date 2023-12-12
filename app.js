const pianoContainer = document.getElementById('piano');
const myPiano = new Keyboard(pianoContainer);

function main() {
  pianoContainer.innerHTML(myPiano);
}

main();