const fs = require('fs');

const sampleRate = 44100;

function createWav(bufferData) {
  const numSamples = bufferData.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write("WAVE", 8);
  
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); 
  buffer.writeUInt16LE(1, 20); 
  buffer.writeUInt16LE(1, 22); 
  buffer.writeUInt32LE(sampleRate, 24); 
  buffer.writeUInt32LE(sampleRate * 2, 28); 
  buffer.writeUInt16LE(2, 32); 
  buffer.writeUInt16LE(16, 34); 
  
  buffer.write("data", 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  
  for (let i = 0; i < numSamples; i++) {
    let sample = bufferData[i];
    const val = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(val, 44 + i * 2);
  }
  return buffer;
}

function applyEnvelope(t, attack, decay, sustain, release, duration) {
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1.0 - (1.0 - sustain) * ((t - attack) / decay);
  if (t < duration - release) return sustain;
  if (t < duration) return sustain * (1.0 - (t - (duration - release)) / release);
  return 0;
}

function sine(f, t) { return Math.sin(2 * Math.PI * f * t); }
function square(f, t) { return Math.sign(Math.sin(2 * Math.PI * f * t)); }
function triangle(f, t) { return 2 * Math.abs(2 * (t * f - Math.floor(t * f + 0.5))) - 1; }

function generate(name, duration, synthFunc) {
  const numSamples = Math.floor(sampleRate * duration);
  const data = new Float32Array(numSamples);
  let maxAmp = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    data[i] = synthFunc(t, duration);
    if (Math.abs(data[i]) > maxAmp) maxAmp = Math.abs(data[i]);
  }
  if (maxAmp > 0) {
    const factor = 0.8 / maxAmp;
    for (let i = 0; i < numSamples; i++) {
      data[i] *= factor;
    }
  }
  fs.writeFileSync(`public/sounds/${name}.wav`, createWav(data));
}

// 12 Premium Sounds

generate("shopify", 0.4, (t, d) => {
    const env1 = applyEnvelope(t, 0.01, 0.1, 0, 0.1, d);
    const env2 = applyEnvelope(Math.max(0, t - 0.1), 0.01, 0.2, 0, 0.1, d - 0.1);
    const tone1 = sine(880, t) * 0.7 + sine(1760, t) * 0.3;
    const tone2 = sine(1108.73, t) * 0.7 + sine(2217.46, t) * 0.3; 
    return tone1 * env1 + tone2 * env2;
});

generate("apple", 0.5, (t, d) => {
    const env = applyEnvelope(t, 0.02, 0.3, 0, 0.1, d);
    return (sine(740, t) + sine(1108, t) * 0.5 + sine(1480, t) * 0.25) * env;
});

generate("minimal_click", 0.1, (t, d) => {
    const env = applyEnvelope(t, 0.005, 0.02, 0, 0.01, d);
    return (sine(1200, t) + triangle(2400, t)) * env;
});

generate("soft_bell", 0.6, (t, d) => {
    const env = applyEnvelope(t, 0.01, 0.4, 0, 0.1, d);
    return (sine(659.25, t) + sine(1318.51, t)*0.4 + sine(1977.76, t)*0.2) * env; 
});

generate("premium_ding", 0.5, (t, d) => {
    const env = applyEnvelope(t, 0.01, 0.3, 0, 0.1, d);
    return (sine(1046.50, t) + sine(2093.00, t)*0.5) * env; 
});

generate("luxury_chime", 0.7, (t, d) => {
    const env1 = applyEnvelope(t, 0.01, 0.5, 0, 0.1, d);
    const env2 = applyEnvelope(Math.max(0, t - 0.15), 0.01, 0.4, 0, 0.1, d - 0.15);
    return sine(783.99, t) * env1 + sine(1174.66, t) * env2;
});

generate("digital_pulse", 0.2, (t, d) => {
    const env = applyEnvelope(t, 0.01, 0.1, 0, 0.05, d);
    return (square(800, t) * 0.3 + sine(800, t) * 0.7) * env;
});

generate("elegant_glass", 0.4, (t, d) => {
    const env = applyEnvelope(t, 0.005, 0.2, 0, 0.1, d);
    return (sine(1500, t) + sine(2150, t)*0.5 + sine(3300, t)*0.2) * env;
});

generate("success_tone", 0.5, (t, d) => {
    const env1 = applyEnvelope(t, 0.01, 0.15, 0, 0.05, d);
    const env2 = applyEnvelope(Math.max(0, t - 0.12), 0.01, 0.3, 0, 0.1, d - 0.12);
    return sine(523.25, t) * env1 + sine(783.99, t) * env2;
});

generate("modern_notification", 0.3, (t, d) => {
    const env = applyEnvelope(t, 0.02, 0.15, 0, 0.05, d);
    return (sine(900, t) + triangle(1800, t)*0.2) * env;
});

generate("linear", 0.2, (t, d) => {
    const env = applyEnvelope(t, 0.005, 0.05, 0, 0.05, d);
    return (sine(1000, t) * 0.8 + square(2000, t) * 0.2) * env;
});

generate("stripe", 0.4, (t, d) => {
    const env1 = applyEnvelope(t, 0.01, 0.1, 0, 0.05, d);
    const env2 = applyEnvelope(Math.max(0, t - 0.08), 0.01, 0.2, 0, 0.1, d - 0.08);
    return sine(880, t) * env1 + sine(1318.51, t) * env2;
});

console.log("Sounds generated successfully.");
