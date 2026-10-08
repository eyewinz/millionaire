let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

// ---------------------------------------------------------------------------
// Game background music (game.wav) — loops while question is displayed
// ---------------------------------------------------------------------------
let gameAudio: HTMLAudioElement | null = null;

export function startGameMusic(): void {
  stopGameMusic();
  gameAudio = new Audio(process.env.PUBLIC_URL + "/game.wav");
  gameAudio.loop = true;
  gameAudio.volume = 0.1;
  gameAudio.play().catch(() => {
    // Browser may block autoplay; ignore silently
  });
}

export function stopGameMusic(): void {
  if (gameAudio) {
    gameAudio.pause();
    gameAudio.currentTime = 0;
    gameAudio = null;
  }
}

// ---------------------------------------------------------------------------
// Success sound (success.wav) — played on correct answer
// ---------------------------------------------------------------------------
export function playSuccessSound(): void {
  const audio = new Audio(process.env.PUBLIC_URL + "/success.wav");
  audio.volume = 0.7;
  audio.play().catch(() => {
    // Browser may block autoplay; ignore silently
  });
}

// ---------------------------------------------------------------------------
// Legacy synthesised tick (kept for reference but no longer primary)
// ---------------------------------------------------------------------------
export function playTick(): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 800;
  osc.type = "square";
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

let tickInterval: ReturnType<typeof setInterval> | null = null;

export function startTicking(): void {
  stopTicking();
  playTick();
  tickInterval = setInterval(playTick, 1000);
}

export function stopTicking(): void {
  if (tickInterval !== null) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

export function playConfirmPopup(): void {
  const ctx = getAudioContext();
  [523, 659].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    const startTime = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  });
}

export function playSuccess(): void {
  const ctx = getAudioContext();
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    const startTime = ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
    osc.start(startTime);
    osc.stop(startTime + 0.3);
  });
}

export function playFailure(): void {
  const ctx = getAudioContext();
  const notes = [392, 349.23];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sawtooth";
    const startTime = ctx.currentTime + i * 0.3;
    gain.gain.setValueAtTime(0.08, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
    osc.start(startTime);
    osc.stop(startTime + 0.4);
  });
}
