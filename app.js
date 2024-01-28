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
    case 145:
    case 146:
    case 147:
    case 148:
    case 149:
    case 150:
    case 151:
    case 152:
    case 153:
    case 154:
    case 155:
    case 156:
    case 157:
    case 158:
    case 159:
      noteOn(note, velocity);
      break;
    case 128:
    case 129:
    case 130:
    case 131:
    case 132:
    case 133:
    case 134:
    case 135:
    case 136:
    case 137:
    case 138:
    case 139:
    case 140:
    case 141:
    case 142:
    case 143:
      noteOff(note);
      break;
  }
}

function noteOn(note, velocity) {
  if (oscillators[note.toString()]) {
    console.log("Note already playing!");
    return;
  }
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

  osc.gain = oscGain;

  oscGain.gain.setValueAtTime(oscGain.gain.value, ctx.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 10);

  osc.start();

  // Add the new oscillator to the oscillators object
  oscillators[note.toString()] = { osc, gain: oscGain, velocityGain };
  console.log(oscillators);
}

function noteOff(note) {
  const oscillator = oscillators[note.toString()];

  // Check if the oscillator exists
  if (!oscillator) {
    console.log(`No oscillator found for note ${note}`);
    return;
  }

  const { osc, gain, velocityGain } = oscillator;

  // Check if the gain nodes exist
  if (!osc || !gain || !velocityGain) {
    console.log(`Incomplete oscillator information for note ${note}`);
    return;
  }

  gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);

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
