let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playSplash = (volume = 0.3) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 6) * (1 + Math.sin(t * 200) * 0.3);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);
  filter.Q.value = 1.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);
  source.stop(now + 0.5);

  setTimeout(() => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);

    const bubbleGain = ctx.createGain();
    bubbleGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
    bubbleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(bubbleGain);
    bubbleGain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }, 100);
};

export const playCroak = (volume = 0.2) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const baseFreq = 120 + Math.random() * 60;

  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(baseFreq, now);
  osc1.frequency.setValueAtTime(baseFreq * 1.3, now + 0.05);
  osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.15);
  osc1.frequency.setValueAtTime(baseFreq * 1.2, now + 0.2);
  osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.35);

  const osc2 = ctx.createOscillator();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(baseFreq * 0.5, now);
  osc2.frequency.setValueAtTime(baseFreq * 0.65, now + 0.05);
  osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, now + 0.35);

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 30 + Math.random() * 20;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.4;
  lfo.connect(lfoGain);

  const ampMod = ctx.createGain();
  ampMod.gain.value = 0.5;
  lfoGain.connect(ampMod.gain);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;
  filter.Q.value = 3;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.02);
  gain.gain.setValueAtTime(volume, now + 0.12);
  gain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.16);
  gain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc1.connect(ampMod);
  osc2.connect(ampMod);
  ampMod.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  lfo.start(now);
  osc1.start(now);
  osc2.start(now);
  lfo.stop(now + 0.4);
  osc1.stop(now + 0.4);
  osc2.stop(now + 0.4);
};

export const playShoot = (power = 1, volume = 0.3) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300 + power * 200, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 30);
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const snapFilter = ctx.createBiquadFilter();
  snapFilter.type = 'highpass';
  snapFilter.frequency.value = 2000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * Math.min(power, 1), now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  const snapGain = ctx.createGain();
  snapGain.gain.setValueAtTime(volume * 0.5, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);
  noiseSource.connect(snapFilter);
  snapFilter.connect(snapGain);
  snapGain.connect(ctx.destination);

  osc.start(now);
  noiseSource.start(now);
  osc.stop(now + 0.2);
  noiseSource.stop(now + 0.08);

  const whooshBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
  const whooshData = whooshBuf.getChannelData(0);
  for (let i = 0; i < whooshBuf.length; i++) {
    const t = i / whooshBuf.length;
    whooshData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8) * 0.3;
  }
  const whoosh = ctx.createBufferSource();
  whoosh.buffer = whooshBuf;
  const whooshFilter = ctx.createBiquadFilter();
  whooshFilter.type = 'bandpass';
  whooshFilter.frequency.setValueAtTime(1500, now);
  whooshFilter.frequency.exponentialRampToValueAtTime(300, now + 0.25);
  const whooshGain = ctx.createGain();
  whooshGain.gain.setValueAtTime(volume * 0.2, now + 0.02);
  whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  whoosh.connect(whooshFilter);
  whooshFilter.connect(whooshGain);
  whooshGain.connect(ctx.destination);
  whoosh.start(now + 0.02);
  whoosh.stop(now + 0.3);
};

export const playFrogJump = (volume = 0.2) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
};
