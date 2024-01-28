window.AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx;
const startButton = document.querySelector("button");
const oscillators = {};

startButton.addEventListener("click", () => {
  ctx = new AudioContext();
  console.log(ctx);
});

function midiToFreq(number) {
  const a = 440;
  return (a / 32) * 2 ** ((number - 9) / 12);
}

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(success, fail);
}

function success(midiAccess) {
  midiAccess.addEventListener("statechange", updateDevices);

  const inputs = midiAccess.inputs;

  inputs.forEach((input) => {
    input.addEventListener("midimessage", handleInput);
  });
}

function handleInput(input) {
  const command = input.data[0];
  const note = input.data[1];
  const velocity = input.data[2];
  switch (command) {
    case 144:
      noteOn(note, velocity);
      break;
    case 154:
      noteOn(note, velocity);
      break;
    case 155:
      noteOn(note, velocity);
      break;
    case 156:
      noteOn(note, velocity);
      break;
    case 157:
      noteOn(note, velocity);
      break;
    case 128:
      noteOff(note);
      break;
    case 138:
      noteOff(note);
      break;
    case 139:
      noteOff(note);
      break;
    case 140:
      noteOff(note);
      break;
    case 141:
      noteOff(note);
      break;
  }
}

function noteOn(note, velocity) {
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  oscGain.gain.value = 0.33;

  const velocityGainAmount = (1 / 127) * velocity;
  const velocityGain = ctx.createGain();
  velocityGain.gain.value = velocityGainAmount;

  osc.type = "sawtooth";
  osc.frequency.value = midiToFreq(note);

  osc.connect(oscGain);
  oscGain.connect(velocityGain);
  velocityGain.connect(ctx.destination);

  osc.start();

  // Add the new oscillator to the oscillators object
  if (oscillators[note.toString()]) {
    console.log("Note already playing!");
    return;
  } else {
    oscillators[note.toString()] = { osc, gain: oscGain, velocityGain };
  }
}

function noteOff(note) {
  const { osc, gain, velocityGain } = oscillators[note.toString()];

  gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.0001);

  setTimeout(() => {
    // Disconnect the gain nodes when the fade-out is complete
    gain.disconnect();
    velocityGain.disconnect();
  }, 2000);

  // Don't stop the oscillator immediately
  delete oscillators[note.toString()];
  console.log(oscillators);
}

function fail() {
  console.log("Could not connect MIDI");
}

function updateDevices(event) {
  console.log(event);
  console.log(
    `Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`,
  );
}
