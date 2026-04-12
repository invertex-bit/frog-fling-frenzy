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

  // White noise burst with filtered low-end for water body
  const bufferSize = ctx.sampleRate * 0.6;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    // Layered noise envelope: fast attack, slow decay
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 4) * (0.8 + Math.sin(t * 80) * 0.2);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Low-pass filter for water body
  const lpFilter = ctx.createBiquadFilter();
  lpFilter.type = 'lowpass';
  lpFilter.frequency.setValueAtTime(2000, now);
  lpFilter.frequency.exponentialRampToValueAtTime(300, now + 0.4);
  lpFilter.Q.value = 0.7;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.8, now);
  gain.gain.setValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  source.connect(lpFilter);
  lpFilter.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);
  source.stop(now + 0.6);

  // Bubble sounds - multiple random bubbles
  for (let b = 0; b < 3; b++) {
    const delay = 0.08 + Math.random() * 0.15;
    const bubbleFreq = 200 + Math.random() * 300;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(bubbleFreq, now + delay);
    osc.frequency.exponentialRampToValueAtTime(bubbleFreq * 0.4, now + delay + 0.12);

    const bubbleGain = ctx.createGain();
    bubbleGain.gain.setValueAtTime(0, now);
    bubbleGain.gain.setValueAtTime(volume * 0.08, now + delay);
    bubbleGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

    osc.connect(bubbleGain);
    bubbleGain.connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.15);
  }

  // Secondary splash layer - higher frequency spray
  const sprayBuf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
  const sprayData = sprayBuf.getChannelData(0);
  for (let i = 0; i < sprayBuf.length; i++) {
    const t = i / sprayBuf.length;
    sprayData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 15) * 0.5;
  }
  const spraySource = ctx.createBufferSource();
  spraySource.buffer = sprayBuf;
  const hpFilter = ctx.createBiquadFilter();
  hpFilter.type = 'highpass';
  hpFilter.frequency.value = 3000;
  const sprayGain = ctx.createGain();
  sprayGain.gain.setValueAtTime(volume * 0.3, now);
  sprayGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  spraySource.connect(hpFilter);
  hpFilter.connect(sprayGain);
  sprayGain.connect(ctx.destination);
  spraySource.start(now);
  spraySource.stop(now + 0.15);
};

export const playCroak = (volume = 0.25) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const baseFreq = 100 + Math.random() * 40;

  // Two-part croak: "rib-bit"
  for (let part = 0; part < 2; part++) {
    const offset = part * 0.12;
    const freq = part === 0 ? baseFreq * 1.2 : baseFreq * 0.8;
    const dur = part === 0 ? 0.1 : 0.18;

    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, now + offset);
    osc1.frequency.exponentialRampToValueAtTime(freq * 0.6, now + offset + dur);

    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(freq * 0.5, now + offset);
    osc2.frequency.exponentialRampToValueAtTime(freq * 0.3, now + offset + dur);

    // Amplitude modulation for vocal cord vibration
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 25 + Math.random() * 15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;
    lfo.connect(lfoGain);

    const ampMod = ctx.createGain();
    ampMod.gain.value = 0.5;
    lfoGain.connect(ampMod.gain);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + offset);
    gain.gain.linearRampToValueAtTime(volume * (part === 0 ? 0.7 : 1), now + offset + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);

    osc1.connect(ampMod);
    osc2.connect(ampMod);
    ampMod.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(now + offset);
    osc1.start(now + offset);
    osc2.start(now + offset);
    lfo.stop(now + offset + dur + 0.01);
    osc1.stop(now + offset + dur + 0.01);
    osc2.stop(now + offset + dur + 0.01);
  }
};

export const playShoot = (power = 1, volume = 0.3) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Rubber snap
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(250 + power * 150, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * Math.min(power, 1) * 0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);

  // Snap noise
  const snapBuf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
  const snapData = snapBuf.getChannelData(0);
  for (let i = 0; i < snapBuf.length; i++) {
    const t = i / snapBuf.length;
    snapData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 40);
  }
  const snapSource = ctx.createBufferSource();
  snapSource.buffer = snapBuf;
  const snapGain = ctx.createGain();
  snapGain.gain.setValueAtTime(volume * 0.4, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  snapSource.connect(snapGain);
  snapGain.connect(ctx.destination);
  snapSource.start(now);
  snapSource.stop(now + 0.04);

  // Whoosh
  const whooshBuf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const whooshData = whooshBuf.getChannelData(0);
  for (let i = 0; i < whooshBuf.length; i++) {
    const t = i / whooshBuf.length;
    whooshData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 10) * 0.2;
  }
  const whoosh = ctx.createBufferSource();
  whoosh.buffer = whooshBuf;
  const whooshFilter = ctx.createBiquadFilter();
  whooshFilter.type = 'bandpass';
  whooshFilter.frequency.setValueAtTime(1200, now + 0.02);
  whooshFilter.frequency.exponentialRampToValueAtTime(200, now + 0.2);
  const whooshGain = ctx.createGain();
  whooshGain.gain.setValueAtTime(volume * 0.15, now + 0.02);
  whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  whoosh.connect(whooshFilter);
  whooshFilter.connect(whooshGain);
  whooshGain.connect(ctx.destination);
  whoosh.start(now + 0.02);
  whoosh.stop(now + 0.22);
};

export const playFrogJump = (volume = 0.2) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(500, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.7, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
};
