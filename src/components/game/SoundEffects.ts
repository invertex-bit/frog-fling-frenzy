// Audio cache for MP3 files
const audioBufferCache: Record<string, AudioBuffer> = {};
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
    // Random pitch between 0.8 and 1.2
    source.playbackRate.value = 0.8 + Math.random() * 0.4;
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
  }).catch(() => {});
};

const AUDIO_BASE = 'https://raw.githubusercontent.com/invertex-bit/frog-fling-frenzy/main/public/audio';

export const playCroak = (volume = 0.4) => {
  playAudio(`${AUDIO_BASE}/frogkva.mp3`, volume);
};

export const playSplash = (volume = 0.5) => {
  playAudio(`${AUDIO_BASE}/stodown.mp3`, volume);
};

export const playFrogDown = (volume = 0.5) => {
  playAudio(`${AUDIO_BASE}/frogdown.mp3`, volume);
};

export const playFrogUp = (volume = 0.5) => {
  playAudio(`${AUDIO_BASE}/frogup.mp3`, volume);
};

export const playShoot = (_power = 1, volume = 0.5) => {
  playAudio(`${AUDIO_BASE}/slingshot_fire.mp3`, volume);
};

// Keep playFrogJump as alias for frogdown
export const playFrogJump = (volume = 0.4) => {
  playFrogDown(volume);
};
