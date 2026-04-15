// Audio cache for MP3 files
const audioBufferCache: Record<string, AudioBuffer> = {};
let audioCtx: AudioContext | null = null;

// Global volume multipliers (0-1)
let sfxVolume = 1;
let musicVolume = 0.5;
let bgMusicSource: AudioBufferSourceNode | null = null;
let bgMusicGain: GainNode | null = null;

export const setSfxVolume = (v: number) => { sfxVolume = v; };
export const getSfxVolume = () => sfxVolume;
export const setMusicVolume = (v: number) => {
  musicVolume = v;
  if (bgMusicGain) bgMusicGain.gain.value = v;
};
export const getMusicVolume = () => musicVolume;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const loadAudio = async (url: string): Promise<AudioBuffer> => {
  if (audioBufferCache[url]) return audioBufferCache[url];
  const ctx = getAudioContext();
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = await ctx.decodeAudioData(arrayBuffer);
  audioBufferCache[url] = buffer;
  return buffer;
};

const playAudio = (url: string, volume = 0.5) => {
  const ctx = getAudioContext();
  loadAudio(url).then((buffer) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 0.8 + Math.random() * 0.4;
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume * sfxVolume;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
  }).catch(() => {});
};

const AUDIO_BASE = 'https://raw.githubusercontent.com/invertex-bit/frog-fling-frenzy/main/public/audio';

export const playCroak = (volume = 0.4) => {
  playAudio(`${AUDIO_BASE}/frogkva.mp3`, volume);
};

export const playSplash = (volume = 0.2) => {
  playAudio(`${AUDIO_BASE}/stodown.mp3`, volume);
};

export const playFrogDown = (volume = 0.2) => {
  playAudio(`${AUDIO_BASE}/frogdown1.mp3`, volume);
};

export const playFrogUp = (volume = 0.2) => {
  playAudio(`${AUDIO_BASE}/frogup1.mp3`, volume);
};

export const playShoot = (_power = 1, volume = 0.5) => {
  playAudio(`${AUDIO_BASE}/slingshot_fire.mp3`, volume);
};

export const playFrogJump = (volume = 0.2) => {
  playFrogDown(volume);
};

// Background music
export const startBackgroundMusic = () => {
  const ctx = getAudioContext();
  const url = `${AUDIO_BASE}/ambi.mp3`;
  loadAudio(url).then((buffer) => {
    if (bgMusicSource) {
      try { bgMusicSource.stop(); } catch {}
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = musicVolume;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    bgMusicSource = source;
    bgMusicGain = gain;
  }).catch(() => {});
};

export const stopBackgroundMusic = () => {
  if (bgMusicSource) {
    try { bgMusicSource.stop(); } catch {}
    bgMusicSource = null;
    bgMusicGain = null;
  }
};
