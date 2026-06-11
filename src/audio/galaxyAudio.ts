import { journey } from "../journey/store";

type LayerId = "traffic" | "automation" | "revenue";

const LAYER_PITCH: Record<LayerId, number> = {
  traffic: 440,
  automation: 554.37,
  revenue: 659.25,
};

const BPM = 118;
const STEP = 60 / BPM / 4;
const ARP = [220, 261.63, 329.63, 392, 440, 392, 329.63, 261.63];
const BASS: { s: number; f: number; d: number }[] = [
  { s: 0, f: 55, d: 0.18 },
  { s: 4, f: 55, d: 0.14 },
  { s: 7, f: 82.41, d: 0.11 },
  { s: 8, f: 55, d: 0.18 },
  { s: 10, f: 65.41, d: 0.1 },
  { s: 12, f: 55, d: 0.14 },
  { s: 14, f: 73.42, d: 0.11 },
];

class GalaxyAudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private padFilter: BiquadFilterNode | null = null;
  private padGain: GainNode | null = null;

  private seqStep = 0;
  private nextBeat = 0;
  private seqRunning = false;

  private lastProgress = 0;
  private scrollPulse = 0;
  private lastWhoosh = 0;
  private milestones = { traffic: false, automation: false, revenue: false, activation: false };
  private lastHoverAt = 0;

  enabled = false;
  muted = false;

  async unlock() {
    if (typeof window === "undefined") return false;
    if (this.muted) return true;

    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.ambientBus = this.ctx.createGain();
      this.sfxBus = this.ctx.createGain();
      this.ambientBus.gain.value = 0.72;
      this.sfxBus.gain.value = 0.58;
      this.ambientBus.connect(this.master);
      this.sfxBus.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.master.gain.value = 0;
      this.startCyberpunkAmbient();
    }

    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.enabled = true;
    this.fadeMaster(1);
    return true;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (!this.muted && !this.enabled) {
      void this.unlock();
    } else if (this.enabled) {
      this.fadeMaster(this.muted ? 0 : 1);
    }
    return this.muted;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.enabled) this.fadeMaster(this.muted ? 0 : 1);
  }

  planetHover(layerId: LayerId) {
    if (!this.enabled || this.muted || !this.ctx || !this.sfxBus) return;
    const now = this.ctx.currentTime;
    if (now - this.lastHoverAt < 0.12) return;
    this.lastHoverAt = now;

    const base = LAYER_PITCH[layerId];
    this.tone({
      freq: base * 1.5,
      endFreq: base * 2.4,
      duration: 0.14,
      gain: 0.09,
      type: "square",
    });
  }

  syncJourney() {
    if (!this.enabled || !this.ctx || !this.padFilter || !this.padGain) return;

    const p = journey.smooth;
    const t = this.ctx.currentTime;
    const delta = Math.abs(p - this.lastProgress);
    this.lastProgress = p;

    this.padFilter.frequency.setTargetAtTime(420 + p * 680 + journey.activation * 220, t, 0.35);
    this.padGain.gain.setTargetAtTime(0.1 + journey.activation * 0.07, t, 0.4);

    if (delta > 0.0008) this.scrollPulse = Math.min(1, this.scrollPulse + delta * 14);
    else this.scrollPulse *= 0.92;

    if (this.scrollPulse > 0.08 && t - this.lastWhoosh > 0.09) {
      this.lastWhoosh = t;
      this.playScrollWhoosh(this.scrollPulse);
    }

    if (journey.traffic > 0.55 && !this.milestones.traffic) {
      this.milestones.traffic = true;
      this.playOrbitUnlock("traffic");
    }
    if (journey.automation > 0.55 && !this.milestones.automation) {
      this.milestones.automation = true;
      this.playOrbitUnlock("automation");
    }
    if (journey.revenue > 0.55 && !this.milestones.revenue) {
      this.milestones.revenue = true;
      this.playOrbitUnlock("revenue");
    }
    if (journey.activation > 0.72 && !this.milestones.activation) {
      this.milestones.activation = true;
      this.playActivation();
    }
  }

  private fadeMaster(to: number) {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(to * 0.68, this.ctx.currentTime, 0.45);
  }

  private startCyberpunkAmbient() {
    if (!this.ctx || !this.ambientBus) return;

    this.padGain = this.ctx.createGain();
    this.padGain.gain.value = 0.1;
    this.padFilter = this.ctx.createBiquadFilter();
    this.padFilter.type = "lowpass";
    this.padFilter.frequency.value = 520;
    this.padFilter.Q.value = 0.8;

    const padMix = this.ctx.createGain();
    padMix.gain.value = 1;
    padMix.connect(this.padFilter);
    this.padFilter.connect(this.padGain);
    this.padGain.connect(this.ambientBus);

    [110, 110.6, 164.81].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      const g = this.ctx!.createGain();
      g.gain.value = 0.028 - i * 0.004;
      osc.connect(g);
      g.connect(padMix);
      osc.start();
    });

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.04;
    const lfoG = this.ctx.createGain();
    lfoG.gain.value = 90;
    lfo.connect(lfoG);
    lfoG.connect(this.padFilter.frequency);
    lfo.start();

    this.nextBeat = this.ctx.currentTime + 0.05;
    this.startSequencer();
  }

  private startSequencer() {
    if (!this.ctx || this.seqRunning) return;
    this.seqRunning = true;

    const tick = () => {
      if (!this.ctx) return;
      const horizon = 0.12;
      while (this.nextBeat < this.ctx.currentTime + horizon) {
        this.playSeqStep(this.seqStep, this.nextBeat);
        this.seqStep = (this.seqStep + 1) % 16;
        this.nextBeat += STEP;
      }
      window.setTimeout(tick, 25);
    };
    tick();
  }

  private playSeqStep(step: number, time: number) {
    if (!this.ctx || !this.ambientBus) return;

    const bass = BASS.find((b) => b.s === step);
    if (bass) this.playBass(bass.f, bass.d, time);

    this.playArp(ARP[step % ARP.length], time);

    if (step % 2 === 1) this.playHat(time, step % 4 === 3 ? 0.045 : 0.028);
    if (step === 0 || step === 8) this.playKick(time);
  }

  private playBass(freq: number, duration: number, time: number) {
    if (!this.ctx || !this.ambientBus) return;

    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, time);
    filter.frequency.exponentialRampToValueAtTime(90, time + duration);
    filter.Q.value = 4;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.14, time + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(g);
    g.connect(this.ambientBus);
    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  private playArp(freq: number, time: number) {
    if (!this.ctx || !this.ambientBus) return;

    const osc = this.ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 1.4;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.055, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);

    osc.connect(filter);
    filter.connect(g);
    g.connect(this.ambientBus);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  private playHat(time: number, gain: number) {
    if (!this.ctx || !this.ambientBus) return;

    const src = this.ctx.createBufferSource();
    src.buffer = this.makeNoiseBuffer();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.ambientBus);
    src.start(time);
    src.stop(time + 0.05);
  }

  private playKick(time: number) {
    if (!this.ctx || !this.ambientBus) return;

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.16, time + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
    osc.connect(g);
    g.connect(this.ambientBus);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  private makeNoiseBuffer() {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private tone(opts: {
    freq: number;
    endFreq?: number;
    duration: number;
    gain: number;
    type?: OscillatorType;
    delay?: number;
  }) {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime + (opts.delay ?? 0);
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = opts.type ?? "square";
    osc.frequency.setValueAtTime(opts.freq, t);
    if (opts.endFreq) osc.frequency.exponentialRampToValueAtTime(opts.endFreq, t + opts.duration);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opts.gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.duration);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + opts.duration + 0.05);
  }

  private playScrollWhoosh(intensity: number) {
    if (!this.ctx || !this.sfxBus || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.makeNoiseBuffer();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(220 + intensity * 520, t);
    filter.frequency.exponentialRampToValueAtTime(110, t + 0.2);
    filter.Q.value = 1.4;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05 * intensity, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfxBus);
    src.start(t);
    src.stop(t + 0.24);
  }

  private playOrbitUnlock(layer: LayerId) {
    if (!this.ctx || !this.sfxBus || this.muted) return;
    const base = LAYER_PITCH[layer];
    [1, 1.25, 1.5].forEach((ratio, i) => {
      this.tone({
        freq: base * ratio,
        duration: 0.28,
        gain: 0.07 - i * 0.01,
        type: "square",
        delay: i * 0.06,
      });
    });
  }

  private playActivation() {
    if (!this.ctx || !this.sfxBus || this.muted) return;
    [220, 277.18, 329.63, 440].forEach((freq, i) => {
      this.tone({
        freq,
        duration: 1.1,
        gain: 0.06 - i * 0.008,
        type: "sawtooth",
        delay: i * 0.09,
      });
    });
  }
}

export const galaxyAudio = new GalaxyAudioEngine();

/** Call once on first user gesture — browsers block audio until then. */
export function bindAudioUnlock() {
  if (typeof window === "undefined") return () => {};

  const unlock = () => {
    if (!galaxyAudio.muted) void galaxyAudio.unlock();
  };

  window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  window.addEventListener("wheel", unlock, { once: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true });
  window.addEventListener("touchstart", unlock, { once: true, passive: true });

  return () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("wheel", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };
}
