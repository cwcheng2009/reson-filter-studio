/**
 * Ilab Reson Filter Studio - Web Audio Core Engine
 * Inspired by INA-GRM Tools Reson: Multi-band Resonant Filter Bank Architecture
 * 
 * Interactive Music & Multimedia Lab (ILAB)
 * Lab Director: Prof. Cheng-Wen Cheng (鄭建文)
 */

class ResonEngine {
  constructor() {
    this.ctx = null;
    this.maxFilters = 128;
    this.activeFilterCount = 32;
    this.filterMode = 'bandpass'; // 'bandpass' | 'peaking' | 'lowpass'
    this.distributionMode = 'harmonic'; // 'harmonic' | 'subharmonic' | 'geometric' | 'linear' | 'pentatonic' | 'gamelan' | 'wholetone' | 'just' | 'microtonal' | 'formant' | 'random'
    
    // Core Reson Parameters
    this.centerFreq = 440; // Fundamental / Center Frequency in Hz
    this.spread = 1.0; // Octave spread or ratio multiplier
    this.qFactor = 25.0; // Resonance Q (0.5 to 150)
    this.dampingSlope = 0.0; // Decay / Q tilt: -1.0 (highs damp faster) to +1.0 (lows damp faster)
    this.stereoSpread = 0.8; // Stereo field width (0 = mono, 1 = full L/R alternation)
    this.agitation = 0.15; // Random frequency jitter & drift
    this.gainProfile = 'flat'; // 'flat' | 'pink' | 'bell' | 'flutter'
    this.randomSeed = 42;
    
    // Filter Bank Graph Elements
    this.inputNode = null;
    this.filterGraph = []; // array of { filterNode, pannerNode, gainNode, targetFreq, targetQ, targetGain, targetPan, currentEnergy }
    this.resonatorSumGain = null;
    this.dryGainNode = null;
    this.wetGainNode = null;
    this.softClipperNode = null;
    this.masterLimiterNode = null;
    this.masterGainNode = null;
    
    // Analyzers
    this.inputAnalyser = null;
    this.outputAnalyser = null;
    this.fftSize = 2048;
    this.inputFreqData = null;
    this.outputFreqData = null;
    
    // Sources & Exciters
    this.currentSource = 'impulse'; // 'impulse' | 'noise' | 'synth' | 'sampler' | 'mic'
    this.isPlaying = false;
    
    // Impulse Generator parameters
    this.impulseRate = 12; // Hz / clicks per second
    this.impulseRandom = 0.4; // Poisson stochastic randomness (0 = metronome, 1 = chaotic rain)
    this.impulseHardness = 0.8; // Click transient sharpness
    this.impulseTimer = null;
    this.impulseGain = null;
    
    // Noise Generator
    this.noiseNode = null;
    this.noiseGain = null;
    this.noiseType = 'pink'; // 'white' | 'pink'
    this.noisePulsed = false;
    this.noisePulseRate = 2.0; // Hz
    this.noisePulseTimer = null;
    
    // Synth Oscillator
    this.synthOsc = null;
    this.synthGain = null;
    this.synthType = 'sawtooth'; // 'sawtooth' | 'square' | 'triangle' | 'sine'
    this.synthFreq = 110;
    this.synthArp = true;
    this.synthArpTimer = null;
    this.synthArpStep = 0;
    
    // Audio Sampler
    this.sampleBuffer = null;
    this.sampleSourceNode = null;
    this.sampleGain = null;
    this.samplePlaybackRate = 1.0;
    this.sampleLoop = true;
    this.builtInSamples = {};
    
    // Microphone
    this.micStream = null;
    this.micSourceNode = null;
    this.micGain = null;
    this.micGateNode = null;
    
    // Recorder
    this.isRecording = false;
    this.recordedChunks = [];
    this.recordStartTime = 0;
    this.recordProcessorNode = null;
    
    // Random detune table for agitation
    this.detunePhases = new Float32Array(128);
    this.detuneSpeeds = new Float32Array(128);
    for (let i = 0; i < 128; i++) {
      this.detunePhases[i] = Math.random() * Math.PI * 2;
      this.detuneSpeeds[i] = 0.2 + Math.random() * 1.8;
    }
    
    // Filter energy meters for visualizer
    this.filterEnergies = new Float32Array(128);
  }

  // --- Initialize Audio Context and Audio Graph ---
  async init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass({ latencyHint: 'interactive' });

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Main Input Bus
    this.inputNode = this.ctx.createGain();
    this.inputNode.gain.value = 1.0;

    // Resonator Summing Bus
    this.resonatorSumGain = this.ctx.createGain();
    this.resonatorSumGain.gain.value = 1.0;

    // Dry / Wet Routing
    this.dryGainNode = this.ctx.createGain();
    this.dryGainNode.gain.value = 0.15; // Default dry

    this.wetGainNode = this.ctx.createGain();
    this.wetGainNode.gain.value = 0.85; // Default wet

    this.inputNode.connect(this.dryGainNode);

    // Master Output Gain Boost Node (User-controlled Gain: 0dB to +18dB before Limiter)
    this.outputGainBoostDb = 0;
    this.outputGainBoostNode = this.ctx.createGain();
    this.outputGainBoostNode.gain.value = 1.0;

    // Soft Clipper Saturation (tanh curve) to prevent digital harsh clipping when Q is huge
    this.softClipperNode = this.ctx.createWaveShaper();
    this.softClipperNode.curve = this.generateSoftClipCurve(2048, 1.8);
    this.softClipperNode.oversample = '2x';

    // Master Dynamics Limiter (Professional Broadcast Brickwall Limiter)
    this.limiterEnabled = true;
    this.masterLimiterNode = this.ctx.createDynamicsCompressor();
    this.masterLimiterNode.threshold.value = -2.0; // dB
    this.masterLimiterNode.knee.value = 6.0;
    this.masterLimiterNode.ratio.value = 20.0;
    this.masterLimiterNode.attack.value = 0.003;
    this.masterLimiterNode.release.value = 0.28;

    // Master Volume
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.value = 1.0;

    // Analyzers
    this.inputAnalyser = this.ctx.createAnalyser();
    this.inputAnalyser.fftSize = this.fftSize;
    this.inputAnalyser.smoothingTimeConstant = 0.82;
    this.inputNode.connect(this.inputAnalyser);

    this.outputAnalyser = this.ctx.createAnalyser();
    this.outputAnalyser.fftSize = this.fftSize;
    this.outputAnalyser.smoothingTimeConstant = 0.82;

    this.inputFreqData = new Uint8Array(this.inputAnalyser.frequencyBinCount);
    this.outputFreqData = new Uint8Array(this.outputAnalyser.frequencyBinCount);

    // Connect Sum & Dry to Output Gain Boost -> Master Chain
    this.resonatorSumGain.connect(this.wetGainNode);
    this.wetGainNode.connect(this.outputGainBoostNode);
    this.dryGainNode.connect(this.outputGainBoostNode);

    this.outputGainBoostNode.connect(this.softClipperNode);
    this.softClipperNode.connect(this.masterLimiterNode);
    this.masterLimiterNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.outputAnalyser);
    this.outputAnalyser.connect(this.ctx.destination);

    // Recording Tap will be connected dynamically on-demand during startRecording()
    // this.setupRecordingTap();

    // Build the 128 Filter Bank Graph
    this.buildFilterBank();

    // Synthesize built-in high quality procedural audio samples on demand (not blocking init!)
    // await this.generateBuiltinSamples();

    // Start with default impulse exciter
    this.startImpulseSource();
    this.isPlaying = true;
  }

  // --- Soft-Clipping Saturation Curve ---
  generateSoftClipCurve(samples, drive = 1.5) {
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      // Hyperbolic tangent soft saturation curve
      curve[i] = Math.tanh(x * drive) / Math.tanh(drive);
    }
    return curve;
  }

  // --- Build Filter Bank Graph (Up to 128 parallel filters) ---
  buildFilterBank() {
    this.filterGraph = [];
    const now = this.ctx.currentTime;

    for (let i = 0; i < this.maxFilters; i++) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = this.filterMode;
      filter.frequency.setValueAtTime(440, now);
      filter.Q.setValueAtTime(this.qFactor, now);
      filter.gain.setValueAtTime(0, now);

      // Stereo Panner (or standard Gain if StereoPanner unsupported)
      let panner = null;
      if (this.ctx.createStereoPanner) {
        panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(0, now);
      }

      // Filter Gain Node (used to mute inactive filters & scale amplitude)
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);

      // Connect: Input -> Filter -> Panner -> Gain -> ResonatorSumGain
      this.inputNode.connect(filter);
      if (panner) {
        filter.connect(panner);
        panner.connect(gain);
      } else {
        filter.connect(gain);
      }
      gain.connect(this.resonatorSumGain);

      this.filterGraph.push({
        index: i,
        filterNode: filter,
        pannerNode: panner,
        gainNode: gain,
        targetFreq: 440,
        targetQ: this.qFactor,
        targetGain: 0,
        targetPan: 0,
        energy: 0
      });
    }

    // Update filter parameters immediately
    this.updateFilterBankParameters();
  }

  // --- Compute and Distribute Resonator Frequencies, Qs, and Gains ---
  updateFilterBankParameters(transitionTime = 0.04) {
    if (!this.ctx || this.filterGraph.length === 0) return;
    const now = this.ctx.currentTime;
    const N = this.activeFilterCount;
    const f0 = Math.max(20, Math.min(16000, this.centerFreq));
    const Q = Math.max(0.5, Math.min(200, this.qFactor));
    const spread = Math.max(0.05, Math.min(6.0, this.spread));
    const damping = this.dampingSlope; // -1 to +1
    const stereoWidth = this.stereoSpread; // 0 to 1

    // Global gain scaling based on active filter count to maintain constant perceived loudness
    const countComp = 1.8 / Math.sqrt(Math.max(1, N));

    // Pre-calculate and sort frequencies ascending so filter bands never cross or collide!
    const rawItems = [];
    for (let i = 0; i < this.maxFilters; i++) {
      let freq = this.calculateFilterFrequency(i, Math.max(N, 16), f0, spread);
      freq = Math.max(30, Math.min(18500, freq));
      rawItems.push({ freq, origIndex: i });
    }
    rawItems.sort((a, b) => a.freq - b.freq);

    for (let i = 0; i < this.maxFilters; i++) {
      const item = this.filterGraph[i];
      const raw = rawItems[i];

      if (raw.origIndex >= N) {
        // Mute inactive filters
        item.gainNode.gain.cancelScheduledValues(now);
        item.gainNode.gain.setTargetAtTime(0, now, 0.02);
        item.targetGain = 0;
        item.targetFreq = raw.freq;
        continue;
      }

      // 1. Center Frequency from sorted natural harmonic spectrum
      let freq = raw.freq;

      // Add Agitation / Detune LFO
      if (this.agitation > 0.001) {
        this.detunePhases[i] += this.detuneSpeeds[i] * 0.05;
        const jitter = Math.sin(this.detunePhases[i]) * this.agitation * 0.08;
        freq = freq * Math.pow(2, jitter);
      }

      // Clamp frequency to safe audio band (30Hz - 18,500Hz)
      freq = Math.max(30, Math.min(18500, freq));

      // 2. Calculate Q Factor with Damping Slope
      // High frequency damping or Low frequency damping
      const normFreq = Math.log2(freq / 20) / Math.log2(20000 / 20); // 0 to 1
      let qVal = Q;
      if (damping !== 0) {
        // Damping slope: negative = high frequencies have lower Q (decay faster, like wood/felt); positive = highs ring longer (like glass/metal)
        const tiltMultiplier = Math.pow(2, damping * (normFreq - 0.5) * 3);
        qVal = Math.max(0.5, Math.min(250, Q * tiltMultiplier));
      }

      // 3. Calculate Gain Profile
      let gainMult = 1.0;
      if (this.gainProfile === 'pink') {
        // 1/f spectral falloff (3dB/octave)
        gainMult = Math.pow(100 / freq, 0.35);
      } else if (this.gainProfile === 'bell') {
        // Centered around f0 with gaussian bell curve
        const octaveDist = Math.abs(Math.log2(freq / f0));
        gainMult = Math.exp(-0.5 * Math.pow(octaveDist / 1.2, 2));
      } else if (this.gainProfile === 'flutter') {
        // Organic pseudo-random gain modulation
        gainMult = 0.5 + 0.5 * Math.sin(i * 1.618 + this.randomSeed);
      }

      // Filter type specific adjustments
      if (this.filterMode === 'peaking') {
        // In peaking mode, boost gain is between +6dB and +32dB based on Q
        const boostDb = Math.min(36, 12 + Math.log10(qVal + 1) * 12);
        item.filterNode.gain.cancelScheduledValues(now);
        item.filterNode.gain.setTargetAtTime(boostDb, now, transitionTime);
      }

      // Final Gain with loudness & Q bandwidth normalization
      const modeComp = (this.filterMode === 'peaking')
        ? 0.18
        : Math.min(3.0, 0.85 * Math.sqrt(Math.max(1, qVal / 12)));
      const finalGain = countComp * gainMult * modeComp;

      // 4. Stereo Panning
      let pan = 0;
      if (item.pannerNode) {
        if (N === 1) {
          pan = 0;
        } else {
          // Alternating left/right or linear sweep
          const normIdx = (i / (N - 1)) * 2 - 1; // -1 to +1
          // Alternate sign for wide spatial immersion
          const altSign = (i % 2 === 0) ? 1 : -1;
          pan = altSign * Math.abs(normIdx) * stereoWidth;
          pan = Math.max(-1, Math.min(1, pan));
        }
        item.pannerNode.pan.cancelScheduledValues(now);
        item.pannerNode.pan.setTargetAtTime(pan, now, transitionTime);
      }

      // Apply values smoothly to Web Audio parameters
      item.filterNode.type = this.filterMode;

      item.filterNode.frequency.cancelScheduledValues(now);
      item.filterNode.frequency.setTargetAtTime(freq, now, transitionTime);

      item.filterNode.Q.cancelScheduledValues(now);
      item.filterNode.Q.setTargetAtTime(qVal, now, transitionTime);

      item.gainNode.gain.cancelScheduledValues(now);
      item.gainNode.gain.setTargetAtTime(finalGain, now, transitionTime);

      item.targetFreq = freq;
      item.targetQ = qVal;
      item.targetGain = finalGain;
      item.targetPan = pan;
    }
  }

  // --- Reseed Randomness and Agitation Shimmer ---
  reseed() {
    this.randomSeed = Math.floor(Math.random() * 100000);
    for (let i = 0; i < this.maxFilters; i++) {
      this.detunePhases[i] = Math.random() * Math.PI * 2;
      this.detuneSpeeds[i] = 0.4 + Math.random() * 2.8;
    }
    this.updateFilterBankParameters(0.06);
  }

  // --- Master Limiter State & Dynamics Metering ---
  setLimiterEnabled(enabled) {
    this.limiterEnabled = !!enabled;
    if (!this.ctx || !this.masterLimiterNode) return;
    const now = this.ctx.currentTime;
    if (this.limiterEnabled) {
      this.masterLimiterNode.threshold.setTargetAtTime(-2.0, now, 0.04);
      this.masterLimiterNode.ratio.setTargetAtTime(20.0, now, 0.04);
    } else {
      this.masterLimiterNode.threshold.setTargetAtTime(0.0, now, 0.04);
      this.masterLimiterNode.ratio.setTargetAtTime(1.0, now, 0.04);
    }
  }

  getLimiterReduction() {
    if (!this.masterLimiterNode || !this.limiterEnabled) return 0;
    // reduction is negative dB (0 down to -20dB)
    const red = this.masterLimiterNode.reduction;
    return typeof red === 'number' ? red : 0;
  }

  // --- Output Gain Boost (0dB to +24dB Makeup Gain) ---
  setOutputGainBoost(db) {
    this.outputGainBoostDb = Math.max(0, Math.min(24, db));
    const linear = Math.pow(10, this.outputGainBoostDb / 20);
    if (this.outputGainBoostNode && this.ctx) {
      this.outputGainBoostNode.gain.setTargetAtTime(linear, this.ctx.currentTime, 0.02);
    }
  }

  // --- Sampler Input Gain (Drive into Resonator) ---
  setSampleVolume(vol) {
    this.sampleVolume = Math.max(0, Math.min(4.0, vol));
    if (this.sampleGain && this.ctx) {
      this.sampleGain.gain.setTargetAtTime(this.sampleVolume, this.ctx.currentTime, 0.02);
    }
  }

  // --- Capture Live Real-time DSP Targets from Filter Graph ---
  getCurrentDSPTargets() {
    const freqs = new Float32Array(this.maxFilters);
    const Qs = new Float32Array(this.maxFilters);
    const gains = new Float32Array(this.maxFilters);
    const pans = new Float32Array(this.maxFilters);

    for (let i = 0; i < this.maxFilters; i++) {
      const item = this.filterGraph[i];
      if (item) {
        freqs[i] = item.targetFreq || 440;
        Qs[i] = item.targetQ || 25;
        gains[i] = item.targetGain !== undefined ? item.targetGain : 0;
        pans[i] = item.targetPan !== undefined ? item.targetPan : 0;
      } else {
        freqs[i] = 440;
        Qs[i] = 25;
        gains[i] = 0;
        pans[i] = 0;
      }
    }
    return { freqs, Qs, gains, pans };
  }

  // --- Compute the complete 128-filter targets for any preset or state snapshot ---
  computeSnapshotTargets(state) {
    const N = state.filterCount || 32;
    const f0 = Math.max(20, Math.min(16000, state.centerFreq || 440));
    const Q = Math.max(0.5, Math.min(200, state.qFactor || 25));
    const spread = Math.max(0.05, Math.min(6.0, state.spread || 1.0));
    const damping = state.dampingSlope !== undefined ? state.dampingSlope : 0.0;
    const stereoWidth = state.stereoSpread !== undefined ? state.stereoSpread : 0.8;
    const distMode = state.distMode || state.distributionMode || 'harmonic';
    const profile = state.gainProfile || 'flat';
    const countComp = 1.8 / Math.sqrt(Math.max(1, N));

    const freqs = new Float32Array(this.maxFilters);
    const Qs = new Float32Array(this.maxFilters);
    const gains = new Float32Array(this.maxFilters);
    const pans = new Float32Array(this.maxFilters);

    // Calculate natural frequency for all 128 filter indices
    const rawItems = [];
    for (let i = 0; i < this.maxFilters; i++) {
      let freq = this.calculateFilterFrequency(i, Math.max(N, 16), f0, spread, distMode);
      freq = Math.max(30, Math.min(18500, freq));
      rawItems.push({ freq, origIndex: i });
    }
    // Sort monotonically ascending so all 128 filters move in perfect parallel harmony (zero criss-crossing or interference)
    rawItems.sort((a, b) => a.freq - b.freq);

    for (let i = 0; i < this.maxFilters; i++) {
      const raw = rawItems[i];
      const freq = raw.freq;
      freqs[i] = freq;

      const normFreq = Math.log2(freq / 20) / Math.log2(20000 / 20);
      let qVal = Q;
      if (damping !== 0) {
        const tiltMultiplier = Math.pow(2, damping * (normFreq - 0.5) * 3);
        qVal = Math.max(0.5, Math.min(250, Q * tiltMultiplier));
      }
      Qs[i] = qVal;

      let gainMult = 1.0;
      if (profile === 'pink') {
        gainMult = Math.pow(100 / freq, 0.35);
      } else if (profile === 'bell') {
        const octaveDist = Math.abs(Math.log2(freq / f0));
        gainMult = Math.exp(-0.5 * Math.pow(octaveDist / 1.2, 2));
      } else if (profile === 'flutter') {
        gainMult = 0.5 + 0.5 * Math.sin(i * 1.618 + this.randomSeed);
      }

      if (state.filterMode === 'peaking') {
        const boostDb = Math.min(36, 12 + Math.log10(qVal + 1) * 12);
        gainMult *= Math.pow(10, boostDb / 20);
      }
      // Perceived loudness & Q bandwidth normalization
      const modeComp = (state.filterMode === 'peaking')
        ? 0.18
        : Math.min(3.0, 0.85 * Math.sqrt(Math.max(1, qVal / 12)));

      // Inactive filters beyond N are smoothly muted (gain = 0)
      gains[i] = (raw.origIndex < N) ? (countComp * gainMult * modeComp) : 0;

      let pan = 0;
      if (N > 1) {
        const normIdx = (i / (Math.max(1, N - 1))) * 2 - 1;
        const altSign = (i % 2 === 0) ? 1 : -1;
        pan = altSign * Math.abs(normIdx) * stereoWidth;
        pan = Math.max(-1, Math.min(1, pan));
      }
      pans[i] = pan;
    }

    return { freqs, Qs, gains, pans };
  }

  // --- Apply Smoothly Interpolated Targets to All Filter DSP Nodes ---
  applyInterpolatedTargets(targets, transitionTime = 0.015) {
    if (!this.ctx || this.filterGraph.length === 0) return;
    const now = this.ctx.currentTime;

    for (let i = 0; i < this.maxFilters; i++) {
      const item = this.filterGraph[i];
      if (!item) continue;

      let freq = targets.freqs[i];
      if (this.agitation > 0.001) {
        this.detunePhases[i] += this.detuneSpeeds[i] * 0.05;
        const jitter = Math.sin(this.detunePhases[i]) * this.agitation * 0.08;
        freq = freq * Math.pow(2, jitter);
      }
      freq = Math.max(20, Math.min(20000, freq));

      const qVal = Math.max(0.5, Math.min(250, targets.Qs[i]));
      const gainVal = Math.max(0, targets.gains[i]);
      const panVal = Math.max(-1, Math.min(1, targets.pans[i]));

      item.filterNode.frequency.setTargetAtTime(freq, now, transitionTime);
      item.filterNode.Q.setTargetAtTime(qVal, now, transitionTime);
      item.gainNode.gain.setTargetAtTime(gainVal, now, transitionTime);

      if (item.pannerNode) {
        item.pannerNode.pan.setTargetAtTime(panVal, now, transitionTime);
      }

      item.targetFreq = freq;
      item.targetQ = qVal;
      item.targetGain = gainVal;
      item.targetPan = panVal;
    }
  }

  // --- Compute Filter Frequency based on Mode ---
  calculateFilterFrequency(index, total, f0, spread, mode = this.distributionMode) {
    const k = index;
    switch (mode) {
      case 'harmonic':
        // Harmonic series: f_k = f0 * (k + 1)
        return f0 * (1 + k * spread);

      case 'subharmonic': {
        // Musical Subharmonic Undertone series: distributes downwards without collapsing to 20Hz
        const step = (k % 32) * spread * 0.18;
        const octBlock = Math.floor(k / 32);
        const freq = (f0 * 2.5) / ((1 + step) * Math.pow(1.35, octBlock));
        return Math.max(35, Math.min(16000, freq));
      }

      case 'geometric': {
        // Logarithmic / Equal Octave spacing centered around f0
        const minFreq = Math.max(20, f0 / Math.pow(2, spread * 1.5));
        const maxFreq = Math.min(18000, f0 * Math.pow(2, spread * 1.5));
        const ratio = total > 1 ? k / (total - 1) : 0.5;
        return minFreq * Math.pow(maxFreq / minFreq, ratio);
      }

      case 'linear': {
        // Uniform linear comb spacing
        const span = f0 * spread * 4;
        const minFreq = Math.max(30, f0 - span / 2);
        return minFreq + k * (span / Math.max(1, total - 1));
      }

      case 'pentatonic': {
        // Pentatonic Scale: 0, 2, 4, 7, 9 semitones
        const intervals = [0, 2, 4, 7, 9];
        const oct = Math.floor(k / 5);
        const semitone = oct * 12 + intervals[k % 5] * spread;
        return f0 * Math.pow(2, semitone / 12);
      }

      case 'wholetone': {
        // Whole Tone Scale: 0, 2, 4, 6, 8, 10 semitones
        const oct = Math.floor(k / 6);
        const semitone = oct * 12 + (k % 6) * 2 * spread;
        return f0 * Math.pow(2, semitone / 12);
      }

      case 'gamelan': {
        // Balinese Gamelan Slendro / Pelog metallic ratios
        const ratios = [1.0, 1.155, 1.332, 1.531, 1.765, 2.03, 2.345, 2.705, 3.124, 3.608];
        const oct = Math.floor(k / ratios.length);
        const octMult = Math.pow(2.05, oct); // Slightly stretched gamelan octaves
        const r = ratios[k % ratios.length];
        return f0 * octMult * Math.pow(r, spread);
      }

      case 'just': {
        // Just Intonation Pure Harmonic Ratios
        const justRatios = [1/1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2/1, 9/4, 5/2, 8/3, 3/1, 7/2, 4/1];
        const oct = Math.floor(k / justRatios.length);
        const octMult = Math.pow(2, oct);
        const r = justRatios[k % justRatios.length];
        return f0 * octMult * Math.pow(r, spread);
      }

      case 'microtonal': {
        // 24-TET Quarter-tone equal temperament
        const quarterTone = (k * 0.5) * spread; // semitone steps
        return f0 * Math.pow(2, quarterTone / 12);
      }

      case 'formant': {
        // Human Vocal Vowel Formant Clusters (A, E, I, O, U)
        const vowelFormants = [
          [800, 1200, 2500, 3500], // /a/
          [500, 1800, 2500, 3600], // /e/
          [300, 2300, 3000, 3700], // /i/
          [500, 1000, 2500, 3400], // /o/
          [350, 800, 2400, 3400]   // /u/
        ];
        const vowelIndex = Math.floor(k / 4) % 5;
        const formantIndex = k % 4;
        const baseFormant = vowelFormants[vowelIndex][formantIndex];
        const octaveShift = Math.floor(k / 20);
        return (f0 / 440) * baseFormant * Math.pow(2, octaveShift * 0.7 * spread);
      }

      case 'random': {
        // Pseudo-random deterministic distribution based on seed
        const pseudoRand = Math.abs(Math.sin((k + 1) * 98.233 + this.randomSeed * 12.3));
        const minF = Math.max(40, f0 / Math.pow(2, spread * 2));
        const maxF = Math.min(16000, f0 * Math.pow(2, spread * 2));
        return minF * Math.pow(maxF / minF, pseudoRand);
      }

      default:
        return f0 * (k + 1);
    }
  }

  // --- Excitation Sources ---

  // 1. Impulse Generator (Periodic or Poisson Stochastic Raindrops)
  startImpulseSource() {
    this.stopAllSources();
    if (!this.ctx) return;

    this.currentSource = 'impulse';
    this.impulseGain = this.ctx.createGain();
    this.impulseGain.gain.value = 0.9;
    this.impulseGain.connect(this.inputNode);

    const scheduleClick = () => {
      if (this.currentSource !== 'impulse') return;
      this.triggerSingleImpulse();

      // Calculate next trigger interval
      let intervalMs = 1000 / Math.max(0.5, this.impulseRate);
      if (this.impulseRandom > 0) {
        // Exponential / Poisson stochastic distribution
        const u = Math.random();
        const poissonFactor = -Math.log(Math.max(0.0001, u));
        intervalMs = intervalMs * (1 - this.impulseRandom + this.impulseRandom * poissonFactor);
      }
      this.impulseTimer = setTimeout(scheduleClick, Math.max(4, intervalMs));
    };

    scheduleClick();
  }

  triggerSingleImpulse() {
    if (!this.ctx || this.currentSource !== 'impulse') return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.004); // 4ms pulse
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Hardness shapes the click transient: higher hardness = sharper needle pulse
    const hardness = this.impulseHardness;
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const decay = Math.exp(-t * 20 * (1.5 - hardness));
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    const node = this.ctx.createBufferSource();
    node.buffer = buffer;
    node.connect(this.impulseGain);
    node.start(now);
  }

  // 2. Noise Generator (Pink / White Noise)
  startNoiseSource() {
    this.stopAllSources();
    if (!this.ctx) return;

    this.currentSource = 'noise';
    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0.7;
    this.noiseGain.connect(this.inputNode);

    // Generate 5-second seamless loopable noise buffer
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    if (this.noiseType === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        left[i] = Math.random() * 2 - 1;
        right[i] = Math.random() * 2 - 1;
      }
    } else {
      // Pink Noise (Paul Kellet's filtered white noise algorithm)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let rb0 = 0, rb1 = 0, rb2 = 0, rb3 = 0, rb4 = 0, rb5 = 0, rb6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + whiteL * 0.0555179;
        b1 = 0.99332 * b1 + whiteL * 0.0750759;
        b2 = 0.96900 * b2 + whiteL * 0.1538520;
        b3 = 0.86650 * b3 + whiteL * 0.3104856;
        b4 = 0.55000 * b4 + whiteL * 0.5329522;
        b5 = -0.7616 * b5 - whiteL * 0.0168980;
        left[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + whiteL * 0.5362) * 0.11;
        b6 = whiteL * 0.115926;

        const whiteR = Math.random() * 2 - 1;
        rb0 = 0.99886 * rb0 + whiteR * 0.0555179;
        rb1 = 0.99332 * rb1 + whiteR * 0.0750759;
        rb2 = 0.96900 * rb2 + whiteR * 0.1538520;
        rb3 = 0.86650 * rb3 + whiteR * 0.3104856;
        rb4 = 0.55000 * rb4 + whiteR * 0.5329522;
        rb5 = -0.7616 * rb5 - whiteR * 0.0168980;
        right[i] = (rb0 + rb1 + rb2 + rb3 + rb4 + rb5 + rb6 + whiteR * 0.5362) * 0.11;
        rb6 = whiteR * 0.115926;
      }
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    this.noiseNode.connect(this.noiseGain);
    this.noiseNode.start(0);

    // Pulsed noise mode
    if (this.noisePulsed) {
      this.setupNoisePulsing();
    }
  }

  setupNoisePulsing() {
    if (!this.noiseGain) return;
    const pulseLoop = () => {
      if (this.currentSource !== 'noise' || !this.noisePulsed) return;
      const now = this.ctx.currentTime;
      const period = 1 / Math.max(0.2, this.noisePulseRate);
      this.noiseGain.gain.cancelScheduledValues(now);
      this.noiseGain.gain.setValueAtTime(0.8, now);
      this.noiseGain.gain.exponentialRampToValueAtTime(0.001, now + period * 0.6);
      this.noisePulseTimer = setTimeout(pulseLoop, period * 1000);
    };
    pulseLoop();
  }

  // 3. Multi-Wave Synthesizer Oscillator
  startSynthSource() {
    this.stopAllSources();
    if (!this.ctx) return;

    this.currentSource = 'synth';
    this.synthGain = this.ctx.createGain();
    this.synthGain.gain.value = 0.35;
    this.synthGain.connect(this.inputNode);

    this.synthOsc = this.ctx.createOscillator();
    this.synthOsc.type = this.synthType;
    this.synthOsc.frequency.setValueAtTime(this.synthFreq, this.ctx.currentTime);
    this.synthOsc.connect(this.synthGain);
    this.synthOsc.start(0);

    if (this.synthArp) {
      this.setupSynthArp();
    }
  }

  setupSynthArp() {
    // 8-step musical chord arpeggiator
    const arpSteps = [0, 7, 12, 14, 19, 24, 19, 12];
    const stepArp = () => {
      if (this.currentSource !== 'synth' || !this.synthArp || !this.synthOsc) return;
      const now = this.ctx.currentTime;
      const semitone = arpSteps[this.synthArpStep % arpSteps.length];
      const targetFreq = this.synthFreq * Math.pow(2, semitone / 12);
      this.synthOsc.frequency.cancelScheduledValues(now);
      this.synthOsc.frequency.setTargetAtTime(targetFreq, now, 0.02);

      // Micro envelope trigger
      this.synthGain.gain.cancelScheduledValues(now);
      this.synthGain.gain.setValueAtTime(0.45, now);
      this.synthGain.gain.exponentialRampToValueAtTime(0.08, now + 0.16);

      this.synthArpStep++;
      this.synthArpTimer = setTimeout(stepArp, 180);
    };
    stepArp();
  }

  // 4. Audio Sampler (File or Procedural Built-in Samples)
  async playSample(bufferOrKey) {
    this.stopAllSources();
    if (!this.ctx) {
      await this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    this.currentSource = 'sampler';
    let buf = null;

    if (typeof bufferOrKey === 'string') {
      if (!this.builtInSamples[bufferOrKey]) {
        await this.generateBuiltinSamples();
      }
      buf = this.builtInSamples[bufferOrKey];
    } else {
      buf = bufferOrKey;
    }

    if (!buf) return false;
    this.sampleBuffer = buf;

    if (!this.sampleGain) {
      this.sampleGain = this.ctx.createGain();
      this.sampleGain.connect(this.inputNode);
    }
    const currentSampleVol = typeof this.sampleVolume === 'number' ? this.sampleVolume : 1.0;
    this.sampleGain.gain.setValueAtTime(currentSampleVol, this.ctx.currentTime);

    this.sampleSourceNode = this.ctx.createBufferSource();
    this.sampleSourceNode.buffer = this.sampleBuffer;
    this.sampleSourceNode.loop = this.sampleLoop;
    this.sampleSourceNode.playbackRate.value = this.samplePlaybackRate;
    this.sampleSourceNode.connect(this.sampleGain);

    this.sampleSourceNode.onended = () => {
      if (this.currentSource === 'sampler' && !this.sampleLoop) {
        this.isPlaying = false;
        if (typeof this.onSampleEnded === 'function') {
          this.onSampleEnded();
        }
      }
    };

    this.sampleSourceNode.start(0);
    this.isPlaying = true;
    return true;
  }

  // 5. Live Microphone Input
  async startMicSource() {
    this.stopAllSources();
    if (!this.ctx) return;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      this.currentSource = 'mic';
      this.micSourceNode = this.ctx.createMediaStreamSource(this.micStream);

      // Noise gate / Expander to prevent feedback loops in room audio
      this.micGateNode = this.ctx.createDynamicsCompressor();
      this.micGateNode.threshold.value = -35;
      this.micGateNode.ratio.value = 4;

      this.micGain = this.ctx.createGain();
      this.micGain.gain.value = 1.0;

      this.micSourceNode.connect(this.micGateNode);
      this.micGateNode.connect(this.micGain);
      this.micGain.connect(this.inputNode);
      return true;
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('無法取得麥克風權限：' + err.message);
      return false;
    }
  }

  // Stop current sound source safely
  stopAllSources() {
    if (this.impulseTimer) {
      clearTimeout(this.impulseTimer);
      this.impulseTimer = null;
    }
    if (this.noisePulseTimer) {
      clearTimeout(this.noisePulseTimer);
      this.noisePulseTimer = null;
    }
    if (this.synthArpTimer) {
      clearTimeout(this.synthArpTimer);
      this.synthArpTimer = null;
    }
    if (this.noiseNode) {
      try { this.noiseNode.stop(); } catch (e) {}
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }
    if (this.synthOsc) {
      try { this.synthOsc.stop(); } catch (e) {}
      this.synthOsc.disconnect();
      this.synthOsc = null;
    }
    if (this.sampleSourceNode) {
      this.sampleSourceNode.onended = null;
      try { this.sampleSourceNode.stop(); } catch (e) {}
      try { this.sampleSourceNode.disconnect(); } catch (e) {}
      this.sampleSourceNode = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.micSourceNode) {
      this.micSourceNode.disconnect();
      this.micSourceNode = null;
    }
  }

  // --- Procedural Generation of Built-in High Quality Audio Samples ---
  async generateBuiltinSamples() {
    const sr = this.ctx.sampleRate;

    // Sample 1: Percussion Drum Loop (4 bars beat)
    {
      const length = sr * 4;
      const buf = this.ctx.createBuffer(2, length, sr);
      const l = buf.getChannelData(0);
      const r = buf.getChannelData(1);
      const bpm = 110;
      const beatLen = Math.floor(sr * (60 / bpm));

      for (let beat = 0; beat < 8; beat++) {
        const beatStart = beat * beatLen;
        // Kick on beats 0, 4, and 6.5
        if (beat % 4 === 0 || beat === 6) {
          for (let i = 0; i < Math.min(sr * 0.35, length - beatStart); i++) {
            const t = i / sr;
            const freq = 120 * Math.exp(-t * 22) + 45;
            const env = Math.exp(-t * 12);
            const val = Math.sin(2 * Math.PI * freq * t) * env * 0.9;
            l[beatStart + i] += val;
            r[beatStart + i] += val;
          }
        }
        // Snare / Rim on beats 2, 6
        if (beat % 4 === 2) {
          for (let i = 0; i < Math.min(sr * 0.25, length - beatStart); i++) {
            const t = i / sr;
            const tone = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 30) * 0.4;
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 18) * 0.6;
            const val = tone + noise;
            l[beatStart + i] += val * 0.85;
            r[beatStart + i] += val * 0.85;
          }
        }
        // Hi-hat 16th notes
        for (let sub = 0; sub < 4; sub++) {
          const subStart = beatStart + Math.floor(sub * beatLen / 4);
          if (subStart < length) {
            for (let i = 0; i < Math.min(sr * 0.05, length - subStart); i++) {
              const t = i / sr;
              const val = (Math.random() * 2 - 1) * Math.exp(-t * 80) * (sub % 2 === 0 ? 0.3 : 0.15);
              l[subStart + i] += val;
              r[subStart + i] += val * 0.9;
            }
          }
        }
      }
      this.builtInSamples['drum_loop'] = buf;
    }

    // Sample 2: Vowel / Speech Vocal Simulation ("A-O-U-I" formant chant)
    {
      const length = sr * 4.8;
      const buf = this.ctx.createBuffer(2, length, sr);
      const l = buf.getChannelData(0);
      const r = buf.getChannelData(1);
      const f0 = 130.81; // C3 male vocal fundamental

      for (let i = 0; i < length; i++) {
        const t = i / sr;
        // Periodic glottal pulse train
        const phase = (t * f0) % 1.0;
        const glottal = (phase < 0.3 ? Math.sin(phase / 0.3 * Math.PI) : -0.2 * Math.exp(-(phase - 0.3) * 15));

        // Formant filter modulation over time
        const vowelCycle = (t * 0.8) % 4;
        let f1 = 700, f2 = 1200;
        if (vowelCycle < 1) {
          f1 = 800; f2 = 1250; // Ah
        } else if (vowelCycle < 2) {
          f1 = 500; f2 = 900;  // Oh
        } else if (vowelCycle < 3) {
          f1 = 350; f2 = 700;  // Oo
        } else {
          f1 = 400; f2 = 2200; // Ee
        }

        const formant1 = Math.sin(2 * Math.PI * f1 * t) * Math.exp(-((t * f0) % 1) * 8);
        const formant2 = Math.sin(2 * Math.PI * f2 * t) * Math.exp(-((t * f0) % 1) * 12) * 0.6;
        const val = (glottal * 0.3 + formant1 * 0.45 + formant2 * 0.25) * 0.65;
        l[i] = val;
        r[i] = val;
      }
      this.builtInSamples['vocal_speech'] = buf;
    }

    // Sample 3: Rain & Water Droplets (Organic impulse excitation)
    {
      const length = sr * 5.0;
      const buf = this.ctx.createBuffer(2, length, sr);
      const l = buf.getChannelData(0);
      const r = buf.getChannelData(1);

      // Rain background hiss
      let b0 = 0, b1 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.96 * b0 + white * 0.04;
        b1 = 0.92 * b1 + white * 0.08;
        l[i] = b0 * 0.12;
        r[i] = b1 * 0.12;
      }

      // 600 stochastic water droplet plinks
      for (let drop = 0; drop < 600; drop++) {
        const start = Math.floor(Math.random() * (length - sr * 0.1));
        const dropFreq = 900 + Math.random() * 2400;
        const dropPan = Math.random();
        const dropVol = 0.2 + Math.random() * 0.4;
        for (let i = 0; i < sr * 0.06; i++) {
          const t = i / sr;
          const tone = Math.sin(2 * Math.PI * (dropFreq + t * 4000) * t) * Math.exp(-t * 90);
          l[start + i] += tone * dropVol * (1 - dropPan);
          r[start + i] += tone * dropVol * dropPan;
        }
      }
      this.builtInSamples['rain_water'] = buf;
    }

    // Sample 4: Metallic Bowed / Inharmonic Texture
    {
      const length = sr * 4.0;
      const buf = this.ctx.createBuffer(2, length, sr);
      const l = buf.getChannelData(0);
      const r = buf.getChannelData(1);
      const freqs = [147.2, 298.1, 471.5, 782.3, 1145.7, 1680.2];

      for (let i = 0; i < length; i++) {
        const t = i / sr;
        let sumL = 0;
        let sumR = 0;
        for (let f = 0; f < freqs.length; f++) {
          const freq = freqs[f] * (1 + 0.003 * Math.sin(t * 3.5 + f));
          const vibrato = Math.sin(2 * Math.PI * freq * t);
          const env = (0.5 + 0.5 * Math.sin(t * 1.5 + f * 1.2)) * (1 / (f + 1));
          sumL += vibrato * env * (f % 2 === 0 ? 0.7 : 0.3);
          sumR += vibrato * env * (f % 2 === 1 ? 0.7 : 0.3);
        }
        l[i] = sumL * 0.22;
        r[i] = sumR * 0.22;
      }
      this.builtInSamples['metallic_texture'] = buf;
    }
  }

  // --- Real-time WAV Recorder (On-Demand Tap) ---
  startRecording() {
    this.recordedChunks = [];
    this.isRecording = true;
    this.recordStartTime = Date.now();

    if (!this.ctx) return;
    try {
      const bufferSize = 4096;
      this.recordProcessorNode = this.ctx.createScriptProcessor(bufferSize, 2, 2);
      this.recordProcessorNode.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        const inputL = e.inputBuffer.getChannelData(0);
        const inputR = e.inputBuffer.getChannelData(1);
        this.recordedChunks.push({
          left: new Float32Array(inputL),
          right: new Float32Array(inputR)
        });
      };
      this.masterGainNode.connect(this.recordProcessorNode);
      this.recordProcessorNode.connect(this.ctx.destination);
    } catch (e) {
      console.warn('ScriptProcessor setup failed:', e);
    }
  }

  stopRecording() {
    this.isRecording = false;
    if (this.recordProcessorNode) {
      try {
        this.recordProcessorNode.disconnect();
      } catch (e) {}
      this.recordProcessorNode.onaudioprocess = null;
      this.recordProcessorNode = null;
    }
    if (this.recordedChunks.length === 0) return null;

    let totalLength = 0;
    for (const chunk of this.recordedChunks) {
      totalLength += chunk.left.length;
    }

    const mergedLeft = new Float32Array(totalLength);
    const mergedRight = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.recordedChunks) {
      mergedLeft.set(chunk.left, offset);
      mergedRight.set(chunk.right, offset);
      offset += chunk.left.length;
    }

    return this.encodeWAV(mergedLeft, mergedRight, this.ctx.sampleRate);
  }

  encodeWAV(left, right, sampleRate) {
    const numChannels = 2;
    const bytesPerSample = 2; // 16-bit PCM
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = left.length * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF Chunk Descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // BitsPerSample

    // "data" sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Interleave left and right channels & clamp to 16-bit
    let offset = 44;
    for (let i = 0; i < left.length; i++) {
      let sL = Math.max(-1, Math.min(1, left[i]));
      let sR = Math.max(-1, Math.min(1, right[i]));
      view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7FFF, true);
      offset += 2;
      view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // --- External Audio File Loader ---
  async loadAudioFile(fileOrBlob) {
    await this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const arrayBuffer = await fileOrBlob.arrayBuffer();

    return new Promise((resolve, reject) => {
      const copy = arrayBuffer.slice(0);
      let settled = false;
      const onSuccess = (decodedBuffer) => {
        if (settled) return;
        settled = true;
        this.sampleBuffer = decodedBuffer;
        resolve(decodedBuffer);
      };
      const onError = (err) => {
        if (settled) return;
        settled = true;
        console.error('Audio decode error:', err);
        reject(err || new Error('音訊解碼失敗'));
      };

      try {
        const p = this.ctx.decodeAudioData(copy, onSuccess, onError);
        if (p && typeof p.then === 'function') {
          p.then(onSuccess).catch(onError);
        }
      } catch (e) {
        onError(e);
      }
    });
  }
}

window.ResonEngine = ResonEngine;
