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

export const playSplash = (volume = 0.4) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Layer 1: Deep water body — long filtered noise with slow decay
  const bodyLen = ctx.sampleRate * 0.8;
  const bodyBuf = ctx.createBuffer(1, bodyLen, ctx.sampleRate);
  const bodyData = bodyBuf.getChannelData(0);
  for (let i = 0; i < bodyLen; i++) {
    const t = i / bodyLen;
    // Shaped noise: fast attack at ~5ms, slow exponential decay
    const env = t < 0.006 ? t / 0.006 : Math.exp(-t * 3.5);
    bodyData[i] = (Math.random() * 2 - 1) * env;
  }
  const bodySrc = ctx.createBufferSource();
  bodySrc.buffer = bodyBuf;

  // Two cascaded low-pass filters for warm water tone
  const lp1 = ctx.createBiquadFilter();
  lp1.type = 'lowpass';
  lp1.frequency.setValueAtTime(1800, now);
  lp1.frequency.exponentialRampToValueAtTime(250, now + 0.5);
  lp1.Q.value = 0.5;

  const lp2 = ctx.createBiquadFilter();
  lp2.type = 'lowpass';
  lp2.frequency.setValueAtTime(3000, now);
  lp2.frequency.exponentialRampToValueAtTime(400, now + 0.6);
  lp2.Q.value = 0.3;

  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0, now);
  bodyGain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.005);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

  bodySrc.connect(lp1);
  lp1.connect(lp2);
  lp2.connect(bodyGain);
  bodyGain.connect(ctx.destination);
  bodySrc.start(now);
  bodySrc.stop(now + 0.8);

  // Layer 2: Initial impact transient — short sharp crack
  const impactLen = ctx.sampleRate * 0.025;
  const impactBuf = ctx.createBuffer(1, impactLen, ctx.sampleRate);
  const impactData = impactBuf.getChannelData(0);
  for (let i = 0; i < impactLen; i++) {
    const t = i / impactLen;
    impactData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 60);
  }
  const impactSrc = ctx.createBufferSource();
  impactSrc.buffer = impactBuf;
  const impactGain = ctx.createGain();
  impactGain.gain.setValueAtTime(volume * 0.5, now);
  impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
  impactSrc.connect(impactGain);
  impactGain.connect(ctx.destination);
  impactSrc.start(now);
  impactSrc.stop(now + 0.03);

  // Layer 3: Scattered droplets — tiny delayed noise bursts
  const dropCount = 4 + Math.floor(Math.random() * 3);
  for (let d = 0; d < dropCount; d++) {
    const delay = 0.05 + Math.random() * 0.3;
    const dropDur = 0.01 + Math.random() * 0.02;
    const dropLen = Math.floor(ctx.sampleRate * dropDur);
    const dropBuf = ctx.createBuffer(1, dropLen, ctx.sampleRate);
    const dropData = dropBuf.getChannelData(0);
    for (let i = 0; i < dropLen; i++) {
      const t = i / dropLen;
      dropData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 30);
    }
    const dropSrc = ctx.createBufferSource();
    dropSrc.buffer = dropBuf;

    const dropBp = ctx.createBiquadFilter();
    dropBp.type = 'bandpass';
    dropBp.frequency.value = 2000 + Math.random() * 4000;
    dropBp.Q.value = 1.5;

    const dropGain = ctx.createGain();
    dropGain.gain.setValueAtTime(volume * (0.05 + Math.random() * 0.1), now + delay);
    dropGain.gain.exponentialRampToValueAtTime(0.001, now + delay + dropDur);

    dropSrc.connect(dropBp);
    dropBp.connect(dropGain);
    dropGain.connect(ctx.destination);
    dropSrc.start(now + delay);
    dropSrc.stop(now + delay + dropDur + 0.01);
  }

  // Layer 4: Sub-bass thud for weight
  const subOsc = ctx.createOscillator();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(80, now);
  subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(volume * 0.25, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 0.2);
};

export const playCroak = (volume = 0.2) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Natural frog croak: dual-tone with throat resonance
  const baseFreq = 90 + Math.random() * 30;

  // Part 1: "Rrrrr" — short guttural intro
  const introLen = 0.08;
  const introOsc = ctx.createOscillator();
  introOsc.type = 'sawtooth';
  introOsc.frequency.setValueAtTime(baseFreq * 1.3, now);
  introOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.0, now + introLen);

  // Amplitude modulation for vocal tremor
  const tremoLfo = ctx.createOscillator();
  tremoLfo.frequency.value = 35 + Math.random() * 20;
  const tremoGain = ctx.createGain();
  tremoGain.gain.value = 0.6;
  tremoLfo.connect(tremoGain);

  const introAmp = ctx.createGain();
  introAmp.gain.value = 0.4;
  tremoGain.connect(introAmp.gain);

  // Throat resonance filter
  const introFilter = ctx.createBiquadFilter();
  introFilter.type = 'bandpass';
  introFilter.frequency.value = 350;
  introFilter.Q.value = 5;

  const introEnv = ctx.createGain();
  introEnv.gain.setValueAtTime(0, now);
  introEnv.gain.linearRampToValueAtTime(volume * 0.6, now + 0.01);
  introEnv.gain.setValueAtTime(volume * 0.6, now + introLen * 0.7);
  introEnv.gain.exponentialRampToValueAtTime(0.001, now + introLen);

  introOsc.connect(introAmp);
  introAmp.connect(introFilter);
  introFilter.connect(introEnv);
  introEnv.connect(ctx.destination);
  tremoLfo.start(now);
  introOsc.start(now);
  tremoLfo.stop(now + introLen + 0.01);
  introOsc.stop(now + introLen + 0.01);

  // Part 2: "Bit" — lower resonant pulse
  const bitStart = now + 0.1;
  const bitLen = 0.15;

  const bitOsc1 = ctx.createOscillator();
  bitOsc1.type = 'sawtooth';
  bitOsc1.frequency.setValueAtTime(baseFreq * 0.9, bitStart);
  bitOsc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, bitStart + bitLen);

  const bitOsc2 = ctx.createOscillator();
  bitOsc2.type = 'square';
  bitOsc2.frequency.setValueAtTime(baseFreq * 0.45, bitStart);
  bitOsc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.25, bitStart + bitLen);

  // Vocal tremor on second part too
  const tremo2 = ctx.createOscillator();
  tremo2.frequency.value = 30 + Math.random() * 15;
  const tremo2G = ctx.createGain();
  tremo2G.gain.value = 0.4;
  tremo2.connect(tremo2G);

  const bitAmp = ctx.createGain();
  bitAmp.gain.value = 0.5;
  tremo2G.connect(bitAmp.gain);

  // Wider resonance for body
  const bitFilter = ctx.createBiquadFilter();
  bitFilter.type = 'bandpass';
  bitFilter.frequency.value = 300;
  bitFilter.Q.value = 3;

  // Secondary formant
  const bitFilter2 = ctx.createBiquadFilter();
  bitFilter2.type = 'peaking';
  bitFilter2.frequency.value = 700;
  bitFilter2.gain.value = 6;
  bitFilter2.Q.value = 2;

  const bitEnv = ctx.createGain();
  bitEnv.gain.setValueAtTime(0, bitStart);
  bitEnv.gain.linearRampToValueAtTime(volume, bitStart + 0.01);
  bitEnv.gain.setValueAtTime(volume * 0.9, bitStart + bitLen * 0.5);
  bitEnv.gain.exponentialRampToValueAtTime(0.001, bitStart + bitLen);

  bitOsc1.connect(bitAmp);
  bitOsc2.connect(bitAmp);
  bitAmp.connect(bitFilter);
  bitFilter.connect(bitFilter2);
  bitFilter2.connect(bitEnv);
  bitEnv.connect(ctx.destination);
  tremo2.start(bitStart);
  bitOsc1.start(bitStart);
  bitOsc2.start(bitStart);
  tremo2.stop(bitStart + bitLen + 0.01);
  bitOsc1.stop(bitStart + bitLen + 0.01);
  bitOsc2.stop(bitStart + bitLen + 0.01);
};

export const playShoot = (power = 1, volume = 0.3) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const p = Math.min(power, 1);

  // Layer 1: Rubber band snap — pitched down triangle with fast decay
  const snapOsc = ctx.createOscillator();
  snapOsc.type = 'triangle';
  snapOsc.frequency.setValueAtTime(300 + p * 200, now);
  snapOsc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

  const snapGain = ctx.createGain();
  snapGain.gain.setValueAtTime(volume * p * 0.5, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  snapOsc.connect(snapGain);
  snapGain.connect(ctx.destination);
  snapOsc.start(now);
  snapOsc.stop(now + 0.1);

  // Layer 2: Thwack transient — very short noise burst
  const thwackLen = Math.floor(ctx.sampleRate * 0.015);
  const thwackBuf = ctx.createBuffer(1, thwackLen, ctx.sampleRate);
  const thwackData = thwackBuf.getChannelData(0);
  for (let i = 0; i < thwackLen; i++) {
    const t = i / thwackLen;
    thwackData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 80);
  }
  const thwackSrc = ctx.createBufferSource();
  thwackSrc.buffer = thwackBuf;
  const thwackGain = ctx.createGain();
  thwackGain.gain.setValueAtTime(volume * 0.6, now);
  thwackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
  thwackSrc.connect(thwackGain);
  thwackGain.connect(ctx.destination);
  thwackSrc.start(now);
  thwackSrc.stop(now + 0.02);

  // Layer 3: Air whoosh — filtered noise following the projectile
  const whooshLen = Math.floor(ctx.sampleRate * 0.15);
  const whooshBuf = ctx.createBuffer(1, whooshLen, ctx.sampleRate);
  const whooshData = whooshBuf.getChannelData(0);
  for (let i = 0; i < whooshLen; i++) {
    const t = i / whooshLen;
    // Bell-shaped envelope peaking at ~30%
    const env = Math.sin(t * Math.PI) * Math.exp(-t * 3);
    whooshData[i] = (Math.random() * 2 - 1) * env;
  }
  const whooshSrc = ctx.createBufferSource();
  whooshSrc.buffer = whooshBuf;

  const whooshBp = ctx.createBiquadFilter();
  whooshBp.type = 'bandpass';
  whooshBp.frequency.setValueAtTime(1500, now + 0.01);
  whooshBp.frequency.exponentialRampToValueAtTime(300, now + 0.15);
  whooshBp.Q.value = 0.8;

  const whooshGain = ctx.createGain();
  whooshGain.gain.setValueAtTime(volume * 0.12, now + 0.01);
  whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  whooshSrc.connect(whooshBp);
  whooshBp.connect(whooshGain);
  whooshGain.connect(ctx.destination);
  whooshSrc.start(now + 0.01);
  whooshSrc.stop(now + 0.16);
};

export const playFrogJump = (volume = 0.15) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Small body leaving water — short upward chirp + tiny splash
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.18);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);

  // Tiny splash accompanying the jump
  const splashLen = Math.floor(ctx.sampleRate * 0.08);
  const splashBuf = ctx.createBuffer(1, splashLen, ctx.sampleRate);
  const splashData = splashBuf.getChannelData(0);
  for (let i = 0; i < splashLen; i++) {
    const t = i / splashLen;
    splashData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 25);
  }
  const splashSrc = ctx.createBufferSource();
  splashSrc.buffer = splashBuf;
  const splashLp = ctx.createBiquadFilter();
  splashLp.type = 'lowpass';
  splashLp.frequency.value = 2500;
  const splashGain = ctx.createGain();
  splashGain.gain.setValueAtTime(volume * 0.3, now);
  splashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  splashSrc.connect(splashLp);
  splashLp.connect(splashGain);
  splashGain.connect(ctx.destination);
  splashSrc.start(now);
  splashSrc.stop(now + 0.08);
};
