/**
 * Ilab Reson Filter Studio - Application Coordinator & Visualization
 * Includes 8-Preset Parameter Morphing & Interpolation Engine
 * 
 * Interactive Music & Multimedia Lab (ILAB)
 * Lab Director: Prof. Cheng-Wen Cheng (鄭建文)
 */

document.addEventListener('DOMContentLoaded', () => {
  const engine = new ResonEngine();

  // --- DOM Elements ---
  const btnAudioPower = document.getElementById('btnAudioPower');
  const audioPowerIcon = document.getElementById('audioPowerIcon');
  const audioPowerText = document.getElementById('audioPowerText');
  const engineBadge = document.getElementById('engineBadge');

  const masterGainBoost = document.getElementById('masterGainBoost');
  const valMasterGainBoost = document.getElementById('valMasterGainBoost');
  const masterVol = document.getElementById('masterVol');
  const valMasterVol = document.getElementById('valMasterVol');
  const dryWetMix = document.getElementById('dryWetMix');
  const valDryWetHeader = document.getElementById('valDryWetHeader');
  const sliderDryWetDeck = document.getElementById('sliderDryWetDeck');
  const valDryWetDeck = document.getElementById('valDryWetDeck');
  const sliderSampleGain = document.getElementById('sliderSampleGain');
  const valSampleGain = document.getElementById('valSampleGain');
  const btnPanic = document.getElementById('btnPanic');

  // Master Limiter Elements
  const btnLimiterToggle = document.getElementById('btnLimiterToggle');
  const grMeterBar = document.getElementById('grMeterBar');
  const grMeterVal = document.getElementById('grMeterVal');
  const limiterStatusText = document.getElementById('limiterStatusText');

  // Recorder Elements
  const btnRecord = document.getElementById('btnRecord');
  const recText = document.getElementById('recText');
  const recTimer = document.getElementById('recTimer');
  const btnDownloadWav = document.getElementById('btnDownloadWav');

  // 8-Preset Morphing Elements
  const presetSlotsGrid = document.getElementById('presetSlotsGrid');
  const activePresetBadge = document.getElementById('activePresetBadge');
  const sliderMorphTime = document.getElementById('sliderMorphTime');
  const valMorphTime = document.getElementById('valMorphTime');
  const timeChips = document.querySelectorAll('.chip-btn');
  const btnToggleLockSource = document.getElementById('btnToggleLockSource');
  const lockSourceIcon = document.getElementById('lockSourceIcon');
  const lockSourceText = document.getElementById('lockSourceText');
  const btnToggleStore = document.getElementById('btnToggleStore');
  const storeToggleText = document.getElementById('storeToggleText');
  const btnAutoCycle = document.getElementById('btnAutoCycle');
  const autoCycleText = document.getElementById('autoCycleText');
  const btnMorphMode = document.getElementById('btnMorphMode');
  const morphModeIcon = document.getElementById('morphModeIcon');
  const morphModeText = document.getElementById('morphModeText');
  const btnRandomMorphNext = document.getElementById('btnRandomMorphNext');
  const morphProgressBar = document.getElementById('morphProgressBar');
  const morphProgressText = document.getElementById('morphProgressText');
  const morphRemainingText = document.getElementById('morphRemainingText');

  let sourceSwitchMode = 'lock'; // 'lock' (保持目前音檔) | 'preset' (隨預設更換音源) | 'random' (隨機更換音源)
  let morphSequenceMode = 'sequential'; // 'sequential' | 'random'
  const btnRandomSource = document.getElementById('btnRandomSource');

  // Core Reson Controls
  const selFilterCount = document.getElementById('selFilterCount');
  const selFilterMode = document.getElementById('selFilterMode');
  const selDistMode = document.getElementById('selDistMode');
  const selGainProfile = document.getElementById('selGainProfile');

  const sliderCenterFreq = document.getElementById('sliderCenterFreq');
  const valCenterFreq = document.getElementById('valCenterFreq');
  const noteCenterFreq = document.getElementById('noteCenterFreq');

  const sliderQ = document.getElementById('sliderQ');
  const valQ = document.getElementById('valQ');

  const sliderSpread = document.getElementById('sliderSpread');
  const valSpread = document.getElementById('valSpread');

  const sliderDamping = document.getElementById('sliderDamping');
  const valDamping = document.getElementById('valDamping');

  const sliderStereo = document.getElementById('sliderStereo');
  const valStereo = document.getElementById('valStereo');

  const sliderAgitation = document.getElementById('sliderAgitation');
  const valAgitation = document.getElementById('valAgitation');

  const btnReseed = document.getElementById('btnReseed');

  // Source Selector Buttons
  const sourceButtons = document.querySelectorAll('.source-tab-btn');
  const sourceSections = document.querySelectorAll('.source-panel');

  // Impulse Controls
  const sliderImpulseRate = document.getElementById('sliderImpulseRate');
  const valImpulseRate = document.getElementById('valImpulseRate');
  const sliderImpulseRandom = document.getElementById('sliderImpulseRandom');
  const valImpulseRandom = document.getElementById('valImpulseRandom');
  const sliderImpulseHardness = document.getElementById('sliderImpulseHardness');
  const valImpulseHardness = document.getElementById('valImpulseHardness');
  const btnManualTrigger = document.getElementById('btnManualTrigger');

  // Noise Controls
  const selNoiseType = document.getElementById('selNoiseType');
  const chkNoisePulsed = document.getElementById('chkNoisePulsed');
  const sliderNoiseRate = document.getElementById('sliderNoiseRate');
  const valNoiseRate = document.getElementById('valNoiseRate');

  // Synth Controls
  const selSynthWave = document.getElementById('selSynthWave');
  const sliderSynthFreq = document.getElementById('sliderSynthFreq');
  const valSynthFreq = document.getElementById('valSynthFreq');
  const chkSynthArp = document.getElementById('chkSynthArp');

  // Sampler Controls
  const btnQuickLoadAudio = document.getElementById('btnQuickLoadAudio');
  const selBuiltinSample = document.getElementById('selBuiltinSample');
  const btnSamplePlay = document.getElementById('btnSamplePlay');
  const samplePlayIcon = document.getElementById('samplePlayIcon');
  const samplePlayText = document.getElementById('samplePlayText');
  const btnSampleLoop = document.getElementById('btnSampleLoop');
  const fileDropZone = document.getElementById('fileDropZone');
  const audioFileInput = document.getElementById('audioFileInput');
  const sampleFileName = document.getElementById('sampleFileName');
  const windowDropOverlay = document.getElementById('windowDropOverlay');

  // Preset Selector in Deck 4
  const selPreset = document.getElementById('selPreset');

  // Canvases
  const spectrumCanvas = document.getElementById('spectrumCanvas');
  const spectrumCtx = spectrumCanvas.getContext('2d');
  const padCanvas = document.getElementById('padCanvas');
  const padCtx = padCanvas.getContext('2d');
  const filterBarsCanvas = document.getElementById('filterBarsCanvas');
  const filterBarsCtx = filterBarsCanvas ? filterBarsCanvas.getContext('2d') : null;

  // 2D Pad Buttons & State
  const btnPadMode = document.getElementById('btnPadMode');
  const btnPadOrbit = document.getElementById('btnPadOrbit');
  const btnStoreA = document.getElementById('btnStoreA');
  const btnStoreB = document.getElementById('btnStoreB');
  const btnStoreC = document.getElementById('btnStoreC');
  const btnStoreD = document.getElementById('btnStoreD');

  // --- 2D Pad & Morphing State ---
  let padMode = 'morph'; // 'morph' (4-corner snapshot) or 'direct' (X=Freq, Y=Q)
  let padPuck = { x: 0.5, y: 0.5, vx: 0.003, vy: 0.002 };
  let isDraggingPuck = false;
  let isOrbiting = false;
  let puckTrail = [];

  // 4 Corner Snapshots for 2D Pad Morphing
  let snapshots = {
    A: { centerFreq: 220, qFactor: 45, spread: 1.0, dampingSlope: 0.3, agitation: 0.08, stereoSpread: 0.8, distMode: 'harmonic' },
    B: { centerFreq: 880, qFactor: 90, spread: 2.2, dampingSlope: 0.6, agitation: 0.25, stereoSpread: 1.0, distMode: 'gamelan' },
    C: { centerFreq: 110, qFactor: 15, spread: 0.6, dampingSlope: -0.4, agitation: 0.02, stereoSpread: 0.4, distMode: 'subharmonic' },
    D: { centerFreq: 520, qFactor: 60, spread: 1.8, dampingSlope: 0.0, agitation: 0.40, stereoSpread: 0.9, distMode: 'formant' }
  };

  // --- 8-Preset Slots Definition ---
  const PRESET_SLOTS = [
    {
      id: 1,
      name: '西藏頌缽',
      enName: 'Tibetan Bowl',
      desc: '174Hz • 自然純律',
      filterCount: 32,
      filterMode: 'bandpass',
      distMode: 'just',
      centerFreq: 174,
      spread: 1.2,
      qFactor: 85,
      dampingSlope: -0.3,
      stereoSpread: 0.85,
      agitation: 0.08,
      gainProfile: 'pink',
      source: 'impulse',
      impulseRate: 4,
      impulseRandom: 0.65,
      impulseHardness: 0.4
    },
    {
      id: 2,
      name: '水晶教堂鐘',
      enName: 'Crystal Bells',
      desc: '528Hz • 諧波列',
      filterCount: 48,
      filterMode: 'bandpass',
      distMode: 'harmonic',
      centerFreq: 528,
      spread: 1.5,
      qFactor: 95,
      dampingSlope: 0.4,
      stereoSpread: 0.95,
      agitation: 0.12,
      gainProfile: 'flat',
      source: 'impulse',
      impulseRate: 8,
      impulseRandom: 0.45,
      impulseHardness: 0.9
    },
    {
      id: 3,
      name: '外星母音合唱',
      enName: 'Alien Choir',
      desc: '330Hz • 聲道母音',
      filterCount: 64,
      filterMode: 'bandpass',
      distMode: 'formant',
      centerFreq: 330,
      spread: 1.0,
      qFactor: 42,
      dampingSlope: 0.0,
      stereoSpread: 0.75,
      agitation: 0.25,
      gainProfile: 'bell',
      source: 'noise',
      noiseType: 'pink',
      noisePulsed: false
    },
    {
      id: 4,
      name: '甘美朗金屬琴',
      enName: 'Gamelan',
      desc: '392Hz • 爪哇音階',
      filterCount: 32,
      filterMode: 'bandpass',
      distMode: 'gamelan',
      centerFreq: 392,
      spread: 1.4,
      qFactor: 75,
      dampingSlope: 0.2,
      stereoSpread: 0.9,
      agitation: 0.18,
      gainProfile: 'flutter',
      source: 'impulse',
      impulseRate: 14,
      impulseRandom: 0.2,
      impulseHardness: 0.85
    },
    {
      id: 5,
      name: '雨滴卡林巴琴',
      enName: 'Kalimba',
      desc: '440Hz • 五聲音階',
      filterCount: 32,
      filterMode: 'bandpass',
      distMode: 'pentatonic',
      centerFreq: 440,
      spread: 1.8,
      qFactor: 60,
      dampingSlope: -0.2,
      stereoSpread: 0.8,
      agitation: 0.05,
      gainProfile: 'flat',
      source: 'impulse',
      impulseRate: 18,
      impulseRandom: 0.7,
      impulseHardness: 0.95
    },
    {
      id: 6,
      name: '深海金屬潛艇',
      enName: 'Submarine',
      desc: '120Hz • 次諧波低頻',
      filterCount: 32,
      filterMode: 'bandpass',
      distMode: 'subharmonic',
      centerFreq: 120,
      spread: 0.9,
      qFactor: 45,
      dampingSlope: -0.4,
      stereoSpread: 0.65,
      agitation: 0.05,
      gainProfile: 'pink',
      source: 'noise',
      noiseType: 'pink',
      noisePulsed: true,
      noisePulseRate: 0.8
    },
    {
      id: 7,
      name: '玻璃風管共振',
      enName: 'Glass Windpipe',
      desc: '660Hz • 對數八度',
      filterCount: 64,
      filterMode: 'bandpass',
      distMode: 'geometric',
      centerFreq: 660,
      spread: 2.5,
      qFactor: 110,
      dampingSlope: 0.5,
      stereoSpread: 1.0,
      agitation: 0.35,
      gainProfile: 'bell',
      source: 'noise',
      noiseType: 'white',
      noisePulsed: false
    },
    {
      id: 8,
      name: '太空全音階',
      enName: 'Whole-Tone',
      desc: '261Hz • 印象全音',
      filterCount: 36,
      filterMode: 'bandpass',
      distMode: 'wholetone',
      centerFreq: 261.6,
      spread: 1.6,
      qFactor: 70,
      dampingSlope: 0.1,
      stereoSpread: 0.85,
      agitation: 0.20,
      gainProfile: 'flat',
      source: 'synth',
      synthType: 'sawtooth',
      synthFreq: 65.4,
      synthArp: true
    }
  ];

  // --- Morphing Engine State ---
  let morphDuration = 3.0; // Seconds
  let isMorphing = false;
  let morphStartTime = 0;
  let morphFromState = null;
  let morphToPreset = null;
  let morphFromTargets = null;
  let morphToTargets = null;
  let activeSlotIndex = 0;
  let targetSlotIndex = 0;
  let isStoreMode = false;
  let isAutoCycle = false;
  let autoCycleTimer = null;

  // Note Name Helper
  function freqToNoteName(freq) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const midi = Math.round(12 * (Math.log2(freq / 440)) + 69);
    if (midi < 0 || midi > 127) return '';
    const note = notes[midi % 12];
    const oct = Math.floor(midi / 12) - 1;
    return `${note}${oct}`;
  }

  // Helper to capture full current engine state for interpolation
  function captureCurrentEngineState() {
    return {
      centerFreq: engine.centerFreq,
      qFactor: engine.qFactor,
      spread: engine.spread,
      dampingSlope: engine.dampingSlope,
      stereoSpread: engine.stereoSpread,
      agitation: engine.agitation,
      filterCount: engine.activeFilterCount,
      filterMode: engine.filterMode,
      distMode: engine.distributionMode,
      gainProfile: engine.gainProfile,
      source: engine.currentSource,
      impulseRate: engine.impulseRate,
      impulseRandom: engine.impulseRandom,
      impulseHardness: engine.impulseHardness,
      noiseType: engine.noiseType,
      noisePulsed: engine.noisePulsed,
      noisePulseRate: engine.noisePulseRate,
      synthType: engine.synthType,
      synthFreq: engine.synthFreq,
      synthArp: engine.synthArp
    };
  }

  // --- Render 8 Preset Buttons in Grid ---
  function renderPresetButtons() {
    presetSlotsGrid.innerHTML = '';
    PRESET_SLOTS.forEach((slot, idx) => {
      const btn = document.createElement('button');
      btn.className = `preset-slot-btn ${idx === activeSlotIndex ? 'active' : ''}`;
      btn.dataset.slotIndex = idx;
      btn.innerHTML = `
        <div class="slot-tag-row">
          <span class="slot-num">0${slot.id}</span>
          <span class="slot-source-pill">${slot.source.toUpperCase()}</span>
        </div>
        <div class="slot-name">${slot.name}</div>
        <div class="slot-desc">${slot.desc}</div>
      `;

      btn.addEventListener('click', async () => {
        await ensureAudioStarted();

        if (isStoreMode) {
          // Store current settings into this slot
          saveCurrentToSlot(idx);
          toggleStoreMode(false);
        } else {
          // Trigger parameter morphing transition to this preset
          startMorphToSlot(idx);
        }
      });

      presetSlotsGrid.appendChild(btn);
    });
  }

  // --- Save / Store Current Parameters to Slot ---
  function saveCurrentToSlot(index) {
    const cur = captureCurrentEngineState();
    const target = PRESET_SLOTS[index];

    target.centerFreq = cur.centerFreq;
    target.qFactor = cur.qFactor;
    target.spread = cur.spread;
    target.dampingSlope = cur.dampingSlope;
    target.stereoSpread = cur.stereoSpread;
    target.agitation = cur.agitation;
    target.filterCount = cur.filterCount;
    target.filterMode = cur.filterMode;
    target.distMode = cur.distMode;
    target.gainProfile = cur.gainProfile;
    target.source = cur.source;
    target.impulseRate = cur.impulseRate;
    target.impulseRandom = cur.impulseRandom;
    target.impulseHardness = cur.impulseHardness;
    target.noiseType = cur.noiseType;
    target.noisePulsed = cur.noisePulsed;
    target.noisePulseRate = cur.noisePulseRate;
    target.synthType = cur.synthType;
    target.synthFreq = cur.synthFreq;
    target.synthArp = cur.synthArp;
    target.desc = `${Math.round(cur.centerFreq)}Hz • 自訂`;

    renderPresetButtons();
    updateActivePresetBadge(index);

    // Visual Flash Feedback
    const btn = presetSlotsGrid.children[index];
    if (btn) {
      btn.style.borderColor = 'var(--accent-green)';
      btn.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.8)';
      setTimeout(() => {
        btn.style.borderColor = '';
        btn.style.boxShadow = '';
      }, 500);
    }
  }

  function toggleStoreMode(forceState = null) {
    isStoreMode = (forceState !== null) ? forceState : !isStoreMode;
    btnToggleStore.classList.toggle('active', isStoreMode);
    presetSlotsGrid.classList.toggle('store-mode-active', isStoreMode);
    storeToggleText.textContent = isStoreMode ? '點擊槽位寫入' : '儲存模式';
  }

  btnToggleStore.addEventListener('click', () => {
    toggleStoreMode();
  });

  // Source Mode Toggle (3-State: Lock, Follow Preset, Random Source)
  function updateLockSourceButtonUI() {
    if (!btnToggleLockSource) return;
    btnToggleLockSource.classList.remove('mode-lock', 'mode-preset', 'mode-random', 'active');

    if (sourceSwitchMode === 'lock') {
      btnToggleLockSource.classList.add('mode-lock');
      if (lockSourceIcon) lockSourceIcon.textContent = '🔒';
      if (lockSourceText) lockSourceText.textContent = '鎖定目前音源';
      btnToggleLockSource.title = '【🔒 鎖定目前音源】切換預設值時持續播放您的音檔，只平滑漸變濾波器。(點擊切換為「隨預設更換音源」)';
    } else if (sourceSwitchMode === 'preset') {
      btnToggleLockSource.classList.add('mode-preset');
      if (lockSourceIcon) lockSourceIcon.textContent = '🎵';
      if (lockSourceText) lockSourceText.textContent = '隨預設更換音源';
      btnToggleLockSource.title = '【🎵 隨預設更換音源】切換預設值時連動換音源（脈衝/雜訊/合成器/示範取樣）。(點擊切換為「隨機更換音源」)';
    } else if (sourceSwitchMode === 'random') {
      btnToggleLockSource.classList.add('mode-random');
      if (lockSourceIcon) lockSourceIcon.textContent = '🎲';
      if (lockSourceText) lockSourceText.textContent = '隨機更換音源';
      btnToggleLockSource.title = '【🎲 隨機更換音源】每次切換預設時，自動隨機抽選不同的激勵音源（取樣/脈衝/雜訊/合成器）！(點擊切換為「鎖定目前音源」)';
    }
  }

  if (btnToggleLockSource) {
    btnToggleLockSource.addEventListener('click', () => {
      if (sourceSwitchMode === 'lock') {
        sourceSwitchMode = 'preset';
      } else if (sourceSwitchMode === 'preset') {
        sourceSwitchMode = 'random';
      } else {
        sourceSwitchMode = 'lock';
      }
      updateLockSourceButtonUI();
    });
  }

  // Deck 01 Random Excitation Source Button
  if (btnRandomSource) {
    btnRandomSource.addEventListener('click', async () => {
      await ensureAudioStarted();
      const candidates = ['sampler', 'impulse', 'noise', 'synth'].filter(s => s !== engine.currentSource);
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      await switchSource(chosen);
      btnRandomSource.style.transform = 'scale(0.94)';
      setTimeout(() => { btnRandomSource.style.transform = ''; }, 160);
    });
  }

  // --- Morph Time Controls ---
  sliderMorphTime.addEventListener('input', (e) => {
    setMorphDuration(parseFloat(e.target.value));
  });

  timeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = parseFloat(chip.dataset.time);
      sliderMorphTime.value = val;
      setMorphDuration(val);
    });
  });

  function setMorphDuration(val) {
    morphDuration = Math.max(0, val);
    valMorphTime.textContent = `${morphDuration.toFixed(1)} 秒`;
    timeChips.forEach(c => {
      c.classList.toggle('active', Math.abs(parseFloat(c.dataset.time) - morphDuration) < 0.1);
    });
  }

  // --- Auto-Cycle Sequencer & Morph Mode (Sequential vs Random Shuffle) ---
  function getRandomSlotExcept(currentIdx) {
    const pool = [];
    for (let i = 0; i < PRESET_SLOTS.length; i++) {
      if (i !== currentIdx) pool.push(i);
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  btnAutoCycle.addEventListener('click', () => {
    ensureAudioStarted();
    isAutoCycle = !isAutoCycle;
    btnAutoCycle.classList.toggle('active', isAutoCycle);
    autoCycleText.textContent = isAutoCycle ? '巡航中' : '自動巡航';

    if (isAutoCycle && !isMorphing) {
      const nextIdx = (morphSequenceMode === 'random')
        ? getRandomSlotExcept(activeSlotIndex)
        : (activeSlotIndex + 1) % PRESET_SLOTS.length;
      startMorphToSlot(nextIdx);
    } else if (!isAutoCycle && autoCycleTimer) {
      clearTimeout(autoCycleTimer);
      autoCycleTimer = null;
    }
  });

  if (btnMorphMode) {
    btnMorphMode.addEventListener('click', () => {
      morphSequenceMode = (morphSequenceMode === 'sequential') ? 'random' : 'sequential';
      const isRand = morphSequenceMode === 'random';
      btnMorphMode.classList.toggle('shuffle-active', isRand);
      if (morphModeIcon) morphModeIcon.textContent = isRand ? '🔀' : '🔁';
      if (morphModeText) morphModeText.textContent = isRand ? '隨機漫遊' : '順序巡航';
    });
  }

  if (btnRandomMorphNext) {
    btnRandomMorphNext.addEventListener('click', async () => {
      await ensureAudioStarted();
      const nextSlot = getRandomSlotExcept(activeSlotIndex);
      startMorphToSlot(nextSlot);
    });
  }

  // --- Start Morphing Transition to Slot ---
  function startMorphToSlot(targetIndex) {
    if (targetIndex < 0 || targetIndex >= PRESET_SLOTS.length) return;

    morphFromState = captureCurrentEngineState();
    morphToPreset = PRESET_SLOTS[targetIndex];
    targetSlotIndex = targetIndex;
    morphStartTime = performance.now();

    // Use current live DSP targets as the morph starting point so interruptions are 100% glitchless!
    morphFromTargets = engine.getCurrentDSPTargets();
    morphToTargets = engine.computeSnapshotTargets(morphToPreset);

    // Dynamic Excitation Sound Source Transition
    if (sourceSwitchMode === 'preset') {
      if (morphToPreset && morphToPreset.source && morphToPreset.source !== engine.currentSource) {
        switchSource(morphToPreset.source);
      }
    } else if (sourceSwitchMode === 'random') {
      const candidates = ['sampler', 'impulse', 'noise', 'synth'].filter(s => s !== engine.currentSource);
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      switchSource(chosen);
    }
    // If sourceSwitchMode === 'lock', current audio (e.g. user audio file) keeps playing without interruption!

    // Update buttons UI
    Array.from(presetSlotsGrid.children).forEach((btn, idx) => {
      btn.classList.toggle('morph-target', idx === targetIndex);
    });

    if (morphDuration === 0) {
      // Instant Jump
      finishMorphSmoothly(morphToPreset);
    } else {
      isMorphing = true;
      morphProgressText.textContent = `漸變中：${PRESET_SLOTS[activeSlotIndex].name} ➔ ${morphToPreset.name}`;
    }
  }

  // Finish Morphing Smoothly without clicks, pops, or audio source interruptions
  function finishMorphSmoothly(p) {
    isMorphing = false;
    activeSlotIndex = targetSlotIndex;

    // Settle 128-band targets smoothly without cancelling scheduled values
    if (morphToTargets) {
      engine.applyInterpolatedTargets(morphToTargets, 0.05);
    }

    engine.activeFilterCount = p.filterCount;
    selFilterCount.value = p.filterCount;

    engine.filterMode = p.filterMode;
    selFilterMode.value = p.filterMode;

    engine.distributionMode = p.distMode;
    selDistMode.value = p.distMode;

    engine.centerFreq = p.centerFreq;
    sliderCenterFreq.value = p.centerFreq;

    engine.spread = p.spread;
    sliderSpread.value = p.spread;

    engine.qFactor = p.qFactor;
    sliderQ.value = p.qFactor;

    engine.dampingSlope = p.dampingSlope;
    sliderDamping.value = p.dampingSlope;

    engine.stereoSpread = p.stereoSpread;
    sliderStereo.value = p.stereoSpread;

    engine.agitation = p.agitation;
    sliderAgitation.value = p.agitation;

    engine.gainProfile = p.gainProfile;
    selGainProfile.value = p.gainProfile;

    // Exciter specific settings
    if (p.impulseRate) {
      engine.impulseRate = p.impulseRate;
      sliderImpulseRate.value = p.impulseRate;
      valImpulseRate.textContent = `${p.impulseRate.toFixed(1)} Hz`;
    }
    if (p.impulseRandom !== undefined) {
      engine.impulseRandom = p.impulseRandom;
      sliderImpulseRandom.value = p.impulseRandom;
      valImpulseRandom.textContent = `${Math.round(p.impulseRandom * 100)}%`;
    }
    if (p.impulseHardness !== undefined) {
      engine.impulseHardness = p.impulseHardness;
      sliderImpulseHardness.value = p.impulseHardness;
      valImpulseHardness.textContent = `${Math.round(p.impulseHardness * 100)}%`;
    }
    if (p.noiseType) {
      engine.noiseType = p.noiseType;
      selNoiseType.value = p.noiseType;
    }
    if (p.synthType) {
      engine.synthType = p.synthType;
      selSynthWave.value = p.synthType;
    }

    syncUIFromEngine();

    Array.from(presetSlotsGrid.children).forEach((btn, idx) => {
      btn.classList.toggle('active', idx === activeSlotIndex);
      btn.classList.remove('morph-target');
    });

    updateActivePresetBadge(activeSlotIndex);
    morphProgressBar.style.width = '0%';
    morphProgressText.textContent = `已就緒：當前為【槽位 ${PRESET_SLOTS[activeSlotIndex].id}：${PRESET_SLOTS[activeSlotIndex].name}】`;
    morphRemainingText.textContent = '--';

    // Auto-Cycle scheduling
    if (isAutoCycle) {
      autoCycleTimer = setTimeout(() => {
        if (!isAutoCycle) return;
        const nextIdx = (morphSequenceMode === 'random')
          ? getRandomSlotExcept(activeSlotIndex)
          : (activeSlotIndex + 1) % PRESET_SLOTS.length;
        startMorphToSlot(nextIdx);
      }, 1500);
    }
  }

  // Apply complete preset directly without interpolation
  function applyFullPresetDirectly(p) {
    finishMorphSmoothly(p);
  }

  // Finish Morphing Transition
  function finishMorph() {
    if (morphToPreset) {
      finishMorphSmoothly(morphToPreset);
    }
  }

  function updateActivePresetBadge(idx) {
    const p = PRESET_SLOTS[idx];
    activePresetBadge.textContent = `槽位 ${p.id}：${p.name}`;
  }

  // --- Real-time Parameter Interpolation Tick ---
  function updateMorphInterpolation() {
    if (!isMorphing || !morphFromState || !morphToPreset) return;

    const elapsedMs = performance.now() - morphStartTime;
    const totalMs = morphDuration * 1000;
    const rawProgress = Math.min(1.0, elapsedMs / totalMs);

    // Cosine S-curve Easing for smooth organic transition
    const ease = 0.5 - 0.5 * Math.cos(Math.PI * rawProgress);

    // 1. Center Frequency (Interpolated in Log2 Pitch Space)
    const logF0 = (1 - ease) * Math.log2(morphFromState.centerFreq) + ease * Math.log2(morphToPreset.centerFreq);
    engine.centerFreq = Math.pow(2, logF0);
    sliderCenterFreq.value = engine.centerFreq;

    // 2. Resonance Q (Interpolated in Log2 Space)
    const logQ = (1 - ease) * Math.log2(morphFromState.qFactor) + ease * Math.log2(morphToPreset.qFactor);
    engine.qFactor = Math.pow(2, logQ);
    sliderQ.value = engine.qFactor;

    // 3. Linear Parameters
    engine.spread = (1 - ease) * morphFromState.spread + ease * morphToPreset.spread;
    sliderSpread.value = engine.spread;

    engine.dampingSlope = (1 - ease) * morphFromState.dampingSlope + ease * morphToPreset.dampingSlope;
    sliderDamping.value = engine.dampingSlope;

    engine.stereoSpread = (1 - ease) * morphFromState.stereoSpread + ease * morphToPreset.stereoSpread;
    sliderStereo.value = engine.stereoSpread;

    engine.agitation = (1 - ease) * morphFromState.agitation + ease * morphToPreset.agitation;
    sliderAgitation.value = engine.agitation;

    // 4. Exciter Parameters (Impulse, Noise, Synth)
    if (morphFromState.impulseRate && morphToPreset.impulseRate) {
      engine.impulseRate = (1 - ease) * morphFromState.impulseRate + ease * morphToPreset.impulseRate;
      sliderImpulseRate.value = engine.impulseRate;
    }
    if (morphFromState.impulseRandom !== undefined && morphToPreset.impulseRandom !== undefined) {
      engine.impulseRandom = (1 - ease) * morphFromState.impulseRandom + ease * morphToPreset.impulseRandom;
      sliderImpulseRandom.value = engine.impulseRandom;
    }
    if (morphFromState.impulseHardness !== undefined && morphToPreset.impulseHardness !== undefined) {
      engine.impulseHardness = (1 - ease) * morphFromState.impulseHardness + ease * morphToPreset.impulseHardness;
      sliderImpulseHardness.value = engine.impulseHardness;
    }

    // 5. TRUE CLICKLESS CONTINUOUS MORPHING:
    // Interpolate every single one of the 128 filter targets in pitch & Q space
    if (morphFromTargets && morphToTargets) {
      const currentTargets = {
        freqs: new Float32Array(engine.maxFilters),
        Qs: new Float32Array(engine.maxFilters),
        gains: new Float32Array(engine.maxFilters),
        pans: new Float32Array(engine.maxFilters)
      };

      for (let i = 0; i < engine.maxFilters; i++) {
        // Continuous Pitch Glissando (Log2 frequency space)
        const fA = morphFromTargets.freqs[i] || 440;
        const fB = morphToTargets.freqs[i] || 440;
        const logF = (1 - ease) * Math.log2(fA) + ease * Math.log2(fB);
        currentTargets.freqs[i] = Math.pow(2, logF);

        // Continuous Resonance Q (Log2 space)
        const qA = morphFromTargets.Qs[i] || 25;
        const qB = morphToTargets.Qs[i] || 25;
        const logQ = (1 - ease) * Math.log2(qA) + ease * Math.log2(qB);
        currentTargets.Qs[i] = Math.pow(2, logQ);

        // Continuous Gain & Crossfade
        currentTargets.gains[i] = (1 - ease) * morphFromTargets.gains[i] + ease * morphToTargets.gains[i];

        // Continuous Stereo Panning
        currentTargets.pans[i] = (1 - ease) * morphFromTargets.pans[i] + ease * morphToTargets.pans[i];
      }

      // Smoothly push interpolated 128-band targets directly to DSP nodes without discrete jumps!
      engine.applyInterpolatedTargets(currentTargets, 0.015);
    }

    // 6. Mode & profile metadata update at midpoint for dropdown UI only
    if (rawProgress >= 0.5) {
      if (engine.distributionMode !== morphToPreset.distMode) {
        engine.distributionMode = morphToPreset.distMode;
        selDistMode.value = morphToPreset.distMode;
      }
      if (engine.filterMode !== morphToPreset.filterMode) {
        engine.filterMode = morphToPreset.filterMode;
        selFilterMode.value = morphToPreset.filterMode;
      }
      if (engine.activeFilterCount !== morphToPreset.filterCount) {
        engine.activeFilterCount = morphToPreset.filterCount;
        selFilterCount.value = morphToPreset.filterCount;
      }
      if (engine.gainProfile !== morphToPreset.gainProfile) {
        engine.gainProfile = morphToPreset.gainProfile;
        selGainProfile.value = morphToPreset.gainProfile;
      }
    } else {
      if (engine.distributionMode !== morphFromState.distMode) {
        engine.distributionMode = morphFromState.distMode;
        selDistMode.value = morphFromState.distMode;
      }
      if (engine.filterMode !== morphFromState.filterMode) {
        engine.filterMode = morphFromState.filterMode;
        selFilterMode.value = morphFromState.filterMode;
      }
      if (engine.activeFilterCount !== morphFromState.filterCount) {
        engine.activeFilterCount = morphFromState.filterCount;
        selFilterCount.value = morphFromState.filterCount;
      }
      if (engine.gainProfile !== morphFromState.gainProfile) {
        engine.gainProfile = morphFromState.gainProfile;
        selGainProfile.value = morphFromState.gainProfile;
      }
    }

    syncUIFromEngine();

    // Update Progress Bar & Time Text
    morphProgressBar.style.width = `${(rawProgress * 100).toFixed(1)}%`;
    const remainingSec = Math.max(0, (totalMs - elapsedMs) / 1000);
    morphRemainingText.textContent = `剩餘 ${remainingSec.toFixed(1)}s`;

    if (rawProgress >= 1.0) {
      finishMorphSmoothly(morphToPreset);
    }
  }

  // --- Audio Engine Initialization ---
  async function ensureAudioStarted() {
    if (!engine.ctx || engine.ctx.state === 'suspended') {
      await engine.init();
      if (btnAudioPower) btnAudioPower.classList.add('active');
      if (audioPowerIcon) audioPowerIcon.textContent = '■';
      if (audioPowerText) audioPowerText.textContent = '停止';
      if (engineBadge) {
        engineBadge.textContent = `運作中 (${engine.ctx.sampleRate} Hz)`;
        engineBadge.classList.add('active');
      }
      syncUIFromEngine();
    }
  }

  if (btnAudioPower) {
    btnAudioPower.addEventListener('click', async () => {
      if (!engine.ctx || engine.ctx.state === 'suspended') {
        await ensureAudioStarted();
      } else {
        await engine.ctx.suspend();
        btnAudioPower.classList.remove('active');
        if (audioPowerIcon) audioPowerIcon.textContent = '▶';
        if (audioPowerText) audioPowerText.textContent = '啟動';
        if (engineBadge) {
          engineBadge.textContent = '待命中';
          engineBadge.classList.remove('active');
        }
      }
    });
  }

  // --- Master Controls ---
  // 1. Master Output Gain Boost (0dB to +18dB Drive into Limiter)
  if (masterGainBoost) {
    masterGainBoost.addEventListener('input', (e) => {
      const db = parseFloat(e.target.value);
      engine.setOutputGainBoost(db);
      if (valMasterGainBoost) {
        valMasterGainBoost.textContent = `${db > 0 ? '+' : ''}${db.toFixed(1)}dB`;
      }
    });
  }

  // 2. Master Monitor Volume
  if (masterVol) {
    masterVol.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      if (engine.masterGainNode) {
        engine.masterGainNode.gain.setTargetAtTime(v, engine.ctx.currentTime, 0.02);
      }
      if (valMasterVol) {
        valMasterVol.textContent = `${Math.round(v * 100)}%`;
      }
    });
  }

  // 3. Deck 01 Sample Input Gain (Drive into Resonator)
  if (sliderSampleGain) {
    sliderSampleGain.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      engine.setSampleVolume(val);
      if (valSampleGain) {
        const db = 20 * Math.log10(val);
        valSampleGain.textContent = `${Math.round(val * 100)}% (${db > 0 ? '+' : ''}${db.toFixed(1)}dB)`;
      }
    });
  }

  // --- Unified Dual-Position Dry / Wet Mix Control ---
  function setDryWetMix(wetRatio) {
    const wet = Math.max(0, Math.min(1, wetRatio));
    const dry = 1.0 - wet;
    if (engine.wetGainNode && engine.dryGainNode && engine.ctx) {
      const now = engine.ctx.currentTime;
      engine.wetGainNode.gain.setTargetAtTime(wet, now, 0.02);
      engine.dryGainNode.gain.setTargetAtTime(dry, now, 0.02);
    }
    const pct = Math.round(wet * 100);
    if (dryWetMix) dryWetMix.value = wet;
    if (sliderDryWetDeck) sliderDryWetDeck.value = wet;
    if (valDryWetHeader) valDryWetHeader.textContent = `${pct}%`;
    if (valDryWetDeck) {
      let desc = '均衡';
      if (pct >= 65) desc = '共振濕音';
      else if (pct <= 35) desc = '原音乾音';
      valDryWetDeck.textContent = `${pct}% (${desc})`;
    }
  }

  if (dryWetMix) {
    dryWetMix.addEventListener('input', (e) => {
      setDryWetMix(parseFloat(e.target.value));
    });
  }

  if (sliderDryWetDeck) {
    sliderDryWetDeck.addEventListener('input', (e) => {
      setDryWetMix(parseFloat(e.target.value));
    });
  }

  // Master Limiter Toggle
  if (btnLimiterToggle) {
    btnLimiterToggle.addEventListener('click', () => {
      engine.setLimiterEnabled(!engine.limiterEnabled);
      const isEnabled = engine.limiterEnabled;
      btnLimiterToggle.classList.toggle('active', isEnabled);
      if (limiterStatusText) {
        limiterStatusText.textContent = isEnabled ? 'LIMITER' : 'BYPASS';
      }
    });
  }

  btnPanic.addEventListener('click', () => {
    if (!engine.ctx) return;
    engine.stopAllSources();
    if (engine.resonatorSumGain) {
      engine.resonatorSumGain.gain.setValueAtTime(0, engine.ctx.currentTime);
      engine.resonatorSumGain.gain.setTargetAtTime(1.0, engine.ctx.currentTime + 0.1, 0.1);
    }
    setTimeout(() => {
      switchSource(engine.currentSource);
    }, 150);
  });

  // --- Master WAV Recorder ---
  let recInterval = null;
  btnRecord.addEventListener('click', async () => {
    await ensureAudioStarted();

    if (!engine.isRecording) {
      engine.startRecording();
      btnRecord.classList.add('recording');
      recText.textContent = '停止錄製';
      recTimer.style.display = 'inline-block';
      btnDownloadWav.style.display = 'none';

      recInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - engine.recordStartTime) / 1000);
        const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const s = String(elapsed % 60).padStart(2, '0');
        recTimer.textContent = `${m}:${s}`;
      }, 500);
    } else {
      clearInterval(recInterval);
      const wavBlob = engine.stopRecording();
      btnRecord.classList.remove('recording');
      recText.textContent = '錄製輸出';

      if (wavBlob) {
        const url = URL.createObjectURL(wavBlob);
        const nowStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        btnDownloadWav.href = url;
        btnDownloadWav.download = `ILab_Resonance_Filter_Studio_${nowStr}.wav`;
        btnDownloadWav.style.display = 'inline-flex';
      }
    }
  });

  // --- Core Reson Controls Listeners ---
  selFilterCount.addEventListener('change', async (e) => {
    await ensureAudioStarted();
    engine.activeFilterCount = parseInt(e.target.value, 10);
    engine.updateFilterBankParameters();
  });

  selFilterMode.addEventListener('change', async (e) => {
    await ensureAudioStarted();
    engine.filterMode = e.target.value;
    engine.updateFilterBankParameters();
  });

  selDistMode.addEventListener('change', async (e) => {
    await ensureAudioStarted();
    engine.distributionMode = e.target.value;
    engine.updateFilterBankParameters();
  });

  selGainProfile.addEventListener('change', async (e) => {
    await ensureAudioStarted();
    engine.gainProfile = e.target.value;
    engine.updateFilterBankParameters();
  });

  sliderCenterFreq.addEventListener('input', async (e) => {
    await ensureAudioStarted();
    const val = parseFloat(e.target.value);
    engine.centerFreq = val;
    valCenterFreq.textContent = `${Math.round(val)} Hz`;
    noteCenterFreq.textContent = freqToNoteName(val);
    engine.updateFilterBankParameters();
  });

  sliderQ.addEventListener('input', async (e) => {
    await ensureAudioStarted();
    const val = parseFloat(e.target.value);
    engine.qFactor = val;
    valQ.textContent = val >= 10 ? val.toFixed(1) : val.toFixed(2);
    engine.updateFilterBankParameters();
  });

  sliderSpread.addEventListener('input', async (e) => {
    await ensureAudioStarted();
    const val = parseFloat(e.target.value);
    engine.spread = val;
    valSpread.textContent = `${val.toFixed(2)}x`;
    engine.updateFilterBankParameters();
  });

  sliderDamping.addEventListener('input', async (e) => {
    await ensureAudioStarted();
    const val = parseFloat(e.target.value);
    engine.dampingSlope = val;
    valDamping.textContent = (val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
    engine.updateFilterBankParameters();
  });

  sliderStereo.addEventListener('input', async (e) => {
    await ensureAudioStarted();
    const val = parseFloat(e.target.value);
    engine.stereoSpread = val;
    valStereo.textContent = `${Math.round(val * 100)}%`;
    engine.updateFilterBankParameters();
  });

  sliderAgitation.addEventListener('input', async (e) => {
    await ensureAudioStarted();
    const val = parseFloat(e.target.value);
    engine.agitation = val;
    valAgitation.textContent = `${Math.round(val * 100)}%`;
    engine.updateFilterBankParameters();
  });

  btnReseed.addEventListener('click', () => {
    ensureAudioStarted();
    engine.reseed();
    btnReseed.classList.add('active');
    const origHtml = btnReseed.innerHTML;
    btnReseed.innerHTML = '🎲 擾動重置完畢！(Shimmering)';
    setTimeout(() => {
      btnReseed.classList.remove('active');
      btnReseed.innerHTML = origHtml;
    }, 700);
  });

  // --- Source Selection & Switching ---
  async function switchSource(sourceType) {
    await ensureAudioStarted();
    engine.currentSource = sourceType;

    // Update UI tabs
    sourceButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.source === sourceType);
    });
    sourceSections.forEach(sec => {
      sec.classList.toggle('active', sec.id === `source-${sourceType}`);
    });

    switch (sourceType) {
      case 'impulse':
        engine.startImpulseSource();
        updateSamplePlayButtonState(false);
        break;
      case 'noise':
        engine.startNoiseSource();
        updateSamplePlayButtonState(false);
        break;
      case 'synth':
        engine.startSynthSource();
        updateSamplePlayButtonState(false);
        break;
      case 'sampler':
        if (engine.userAudioBuffer) {
          await engine.playSample(engine.userAudioBuffer);
        } else {
          const sampleKey = selBuiltinSample.value;
          await engine.playSample(sampleKey);
        }
        updateSamplePlayButtonState(true);
        break;
      case 'mic':
        await engine.startMicSource();
        updateSamplePlayButtonState(false);
        break;
    }
  }

  sourceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchSource(btn.dataset.source);
    });
  });

  // Impulse Controls Listeners
  sliderImpulseRate.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    engine.impulseRate = v;
    valImpulseRate.textContent = `${v.toFixed(1)} Hz`;
  });

  sliderImpulseRandom.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    engine.impulseRandom = v;
    valImpulseRandom.textContent = `${Math.round(v * 100)}%`;
  });

  sliderImpulseHardness.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    engine.impulseHardness = v;
    valImpulseHardness.textContent = `${Math.round(v * 100)}%`;
  });

  btnManualTrigger.addEventListener('click', async () => {
    await ensureAudioStarted();
    engine.triggerSingleImpulse();
  });

  // Noise Controls Listeners
  selNoiseType.addEventListener('change', async (e) => {
    engine.noiseType = e.target.value;
    if (engine.currentSource === 'noise') {
      engine.startNoiseSource();
    }
  });

  chkNoisePulsed.addEventListener('change', (e) => {
    engine.noisePulsed = e.target.checked;
    if (engine.currentSource === 'noise') {
      engine.startNoiseSource();
    }
  });

  sliderNoiseRate.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    engine.noisePulseRate = v;
    valNoiseRate.textContent = `${v.toFixed(1)} Hz`;
  });

  // Synth Controls Listeners
  selSynthWave.addEventListener('change', (e) => {
    engine.synthType = e.target.value;
    if (engine.synthOsc) {
      engine.synthOsc.type = e.target.value;
    }
  });

  sliderSynthFreq.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    engine.synthFreq = v;
    valSynthFreq.textContent = `${Math.round(v)} Hz`;
    if (engine.synthOsc && !engine.synthArp) {
      engine.synthOsc.frequency.setValueAtTime(v, engine.ctx.currentTime);
    }
  });

  chkSynthArp.addEventListener('change', (e) => {
    engine.synthArp = e.target.checked;
    if (engine.currentSource === 'synth') {
      engine.startSynthSource();
    }
  });

  // Sampler State Helpers
  function updateSamplePlayButtonState(isPlaying) {
    if (!btnSamplePlay) return;
    if (isPlaying) {
      btnSamplePlay.classList.add('playing');
      if (samplePlayIcon) samplePlayIcon.textContent = '■';
      if (samplePlayText) samplePlayText.textContent = '停止播放';
    } else {
      btnSamplePlay.classList.remove('playing');
      if (samplePlayIcon) samplePlayIcon.textContent = '▶';
      if (samplePlayText) samplePlayText.textContent = engine.userAudioBuffer ? '播放音檔' : '載入/播放音檔';
    }
  }

  engine.onSampleEnded = () => {
    updateSamplePlayButtonState(false);
    if (sampleFileName && engine.userAudioBuffer) {
      sampleFileName.innerHTML = `已播畢: <strong>${engine.userAudioBuffer.fileName || '自訂取樣'}</strong>`;
    }
  };

  // Sampler Controls Listeners
  if (btnQuickLoadAudio) {
    btnQuickLoadAudio.addEventListener('click', async () => {
      await ensureAudioStarted();
      audioFileInput.click();
    });
  }

  selBuiltinSample.addEventListener('change', async (e) => {
    if (engine.currentSource === 'sampler') {
      await engine.playSample(e.target.value);
      if (sampleFileName) sampleFileName.style.display = 'none';
      updateSamplePlayButtonState(true);
    }
  });

  btnSamplePlay.addEventListener('click', async () => {
    await ensureAudioStarted();
    if (engine.currentSource === 'sampler' && engine.sampleSourceNode) {
      engine.stopAllSources();
      updateSamplePlayButtonState(false);
      return;
    }

    if (!engine.userAudioBuffer) {
      audioFileInput.click();
      return;
    }

    await switchSource('sampler');
  });

  function updateSampleLoopUI() {
    if (!btnSampleLoop) return;
    const isLoop = engine.sampleLoop;
    btnSampleLoop.classList.toggle('active', isLoop);
    const loopText = document.getElementById('sampleLoopText');
    const loopIcon = document.getElementById('sampleLoopIcon');
    if (loopText) {
      loopText.textContent = isLoop ? '循環開' : '單次播';
    }
    if (loopIcon) {
      loopIcon.textContent = isLoop ? '🔁' : '➡️';
    }
  }

  if (btnSampleLoop) {
    btnSampleLoop.addEventListener('click', () => {
      engine.sampleLoop = !engine.sampleLoop;
      if (engine.sampleSourceNode) {
        engine.sampleSourceNode.loop = engine.sampleLoop;
      }
      updateSampleLoopUI();
    });
  }

  // Live Mic Toggle Button
  const btnMicToggle = document.getElementById('btnMicToggle');
  if (btnMicToggle) {
    btnMicToggle.addEventListener('click', async () => {
      await ensureAudioStarted();
      if (engine.currentSource === 'mic') {
        engine.stopAllSources();
        btnMicToggle.classList.remove('active');
        btnMicToggle.innerHTML = '<span>🎤 開啟麥克風</span>';
      } else {
        const ok = await engine.startMicSource();
        if (ok) {
          btnMicToggle.classList.add('active');
          btnMicToggle.innerHTML = '<span>🛑 關閉麥克風</span>';
        }
      }
    });
  }

  // File Upload & Drag-and-Drop (Label natively opens file input on click)
  fileDropZone.addEventListener('click', () => {
    ensureAudioStarted();
  });

  window.appEngine = engine;
  window.loadUserAudioFile = loadUserAudioFile;

  audioFileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      await loadUserAudioFile(selectedFile);
      e.target.value = ''; // Reset so the same file can be reloaded if needed
    }
  });

  fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropZone.classList.add('dragover');
  });

  fileDropZone.addEventListener('dragleave', () => {
    fileDropZone.classList.remove('dragover');
  });

  fileDropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    fileDropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await loadUserAudioFile(e.dataTransfer.files[0]);
    }
  });

  // Full-Window Drag & Drop Support
  let dragCounter = 0;
  window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    if (windowDropOverlay) windowDropOverlay.style.display = 'flex';
  });

  window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      if (windowDropOverlay) windowDropOverlay.style.display = 'none';
    }
  });

  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    dragCounter = 0;
    if (windowDropOverlay) windowDropOverlay.style.display = 'none';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await loadUserAudioFile(e.dataTransfer.files[0]);
    }
  });

  async function loadUserAudioFile(file) {
    if (!file) return;
    try {
      sampleFileName.style.display = 'block';
      sampleFileName.innerHTML = `<span style="color: var(--accent-cyan);">⏳ 正在解析音訊: <strong>${file.name}</strong>...</span>`;

      await ensureAudioStarted();
      const buf = await engine.loadAudioFile(file);
      buf.fileName = file.name;
      engine.userAudioBuffer = buf;
      engine.isCustomUserAudio = true;
      sourceSwitchMode = 'lock';
      updateLockSourceButtonUI();

      sampleFileName.innerHTML = `<span style="color: var(--accent-green);">▶ 播放中: <strong>${file.name}</strong> (${buf.duration.toFixed(1)}s, ${buf.numberOfChannels}聲道)</span>`;
      await switchSource('sampler');
      updateSamplePlayButtonState(true);
    } catch (err) {
      console.error('Audio load error:', err);
      sampleFileName.innerHTML = `<span style="color: var(--accent-red);">❌ 載入失敗: ${err.message || '格式不支援'}</span>`;
      updateSamplePlayButtonState(false);
    }
  }

  // --- Deck 4 Preset Selector Listener ---
  if (selPreset) {
    selPreset.addEventListener('change', async (e) => {
      await ensureAudioStarted();
      const val = e.target.value;
      const idxMap = {
        'tibetan_bowl': 0,
        'crystal_cathedral': 1,
        'alien_vowel': 2,
        'balinese_gamelan': 3,
        'raindrop_kalimba': 4,
        'deep_submarine': 5,
        'glass_windpipe': 6,
        'scifi_wholetone': 7
      };
      if (idxMap[val] !== undefined) {
        startMorphToSlot(idxMap[val]);
      }
    });
  }

  // Sync UI from Engine state
  function syncUIFromEngine() {
    valCenterFreq.textContent = `${Math.round(engine.centerFreq)} Hz`;
    noteCenterFreq.textContent = freqToNoteName(engine.centerFreq);
    valQ.textContent = engine.qFactor.toFixed(1);
    valSpread.textContent = `${engine.spread.toFixed(2)}x`;
    valDamping.textContent = (engine.dampingSlope > 0 ? `+${engine.dampingSlope.toFixed(2)}` : engine.dampingSlope.toFixed(2));
    valStereo.textContent = `${Math.round(engine.stereoSpread * 100)}%`;
    valAgitation.textContent = `${Math.round(engine.agitation * 100)}%`;
  }

  // --- 2D XY Pad & Morphing Engine ---
  btnPadMode.addEventListener('click', () => {
    padMode = (padMode === 'morph') ? 'direct' : 'morph';
    btnPadMode.textContent = (padMode === 'morph') ? '切換: 直接控制 (X:Freq, Y:Q)' : '切換: 4角漸變 (A-B-C-D)';
  });

  btnPadOrbit.addEventListener('click', () => {
    isOrbiting = !isOrbiting;
    btnPadOrbit.classList.toggle('active', isOrbiting);
    btnPadOrbit.textContent = isOrbiting ? '● 停止運動 (Orbiting)' : '▶ 漫遊運動 (Orbit / Wander)';
  });

  // Store Snapshot Buttons for 2D Pad
  btnStoreA.addEventListener('click', () => {
    snapshots.A = captureCurrentEngineState();
    flashButton(btnStoreA);
  });
  btnStoreB.addEventListener('click', () => {
    snapshots.B = captureCurrentEngineState();
    flashButton(btnStoreB);
  });
  btnStoreC.addEventListener('click', () => {
    snapshots.C = captureCurrentEngineState();
    flashButton(btnStoreC);
  });
  btnStoreD.addEventListener('click', () => {
    snapshots.D = captureCurrentEngineState();
    flashButton(btnStoreD);
  });

  function flashButton(btn) {
    btn.style.backgroundColor = 'var(--accent-cyan)';
    btn.style.color = '#000';
    setTimeout(() => {
      btn.style.backgroundColor = '';
      btn.style.color = '';
    }, 250);
  }

  // Bilinear Interpolation for 2D Pad
  function applyPadMorphInterpolation(u, v) {
    const wA = (1 - u) * (1 - v);
    const wB = u * (1 - v);
    const wC = (1 - u) * v;
    const wD = u * v;

    const A = snapshots.A;
    const B = snapshots.B;
    const C = snapshots.C;
    const D = snapshots.D;

    const logFreq = wA * Math.log2(A.centerFreq) + wB * Math.log2(B.centerFreq) + wC * Math.log2(C.centerFreq) + wD * Math.log2(D.centerFreq);
    engine.centerFreq = Math.pow(2, logFreq);

    const logQ = wA * Math.log2(A.qFactor) + wB * Math.log2(B.qFactor) + wC * Math.log2(C.qFactor) + wD * Math.log2(D.qFactor);
    engine.qFactor = Math.pow(2, logQ);

    engine.spread = wA * A.spread + wB * B.spread + wC * C.spread + wD * D.spread;
    engine.dampingSlope = wA * A.dampingSlope + wB * B.dampingSlope + wC * C.dampingSlope + wD * D.dampingSlope;
    engine.agitation = wA * A.agitation + wB * B.agitation + wC * C.agitation + wD * D.agitation;
    engine.stereoSpread = wA * A.stereoSpread + wB * B.stereoSpread + wC * C.stereoSpread + wD * D.stereoSpread;

    sliderCenterFreq.value = engine.centerFreq;
    sliderQ.value = engine.qFactor;
    sliderSpread.value = engine.spread;
    sliderDamping.value = engine.dampingSlope;
    sliderStereo.value = engine.stereoSpread;
    sliderAgitation.value = engine.agitation;

    syncUIFromEngine();
    engine.updateFilterBankParameters(0.02);
  }

  function applyDirectPad(u, v) {
    const minF = 40;
    const maxF = 6000;
    engine.centerFreq = minF * Math.pow(maxF / minF, u);

    const minQ = 1;
    const maxQ = 120;
    engine.qFactor = maxQ * Math.pow(minQ / maxQ, v);

    sliderCenterFreq.value = engine.centerFreq;
    sliderQ.value = engine.qFactor;

    syncUIFromEngine();
    engine.updateFilterBankParameters(0.02);
  }

  // 2D Pad Mouse / Touch
  function handlePadInput(e) {
    const rect = padCanvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const u = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    padPuck.x = u;
    padPuck.y = v;

    if (padMode === 'morph') {
      applyPadMorphInterpolation(u, v);
    } else {
      applyDirectPad(u, v);
    }
  }

  padCanvas.addEventListener('mousedown', async (e) => {
    await ensureAudioStarted();
    isDraggingPuck = true;
    handlePadInput(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDraggingPuck) {
      handlePadInput(e);
    }
  });

  window.addEventListener('mouseup', () => {
    isDraggingPuck = false;
  });

  padCanvas.addEventListener('touchstart', async (e) => {
    await ensureAudioStarted();
    isDraggingPuck = true;
    handlePadInput(e);
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (isDraggingPuck) {
      handlePadInput(e);
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    isDraggingPuck = false;
  });

  // --- Interactive Spectrum Canvas Drag & Wheel ---
  let isDraggingSpectrum = false;

  spectrumCanvas.addEventListener('mousedown', async (e) => {
    await ensureAudioStarted();
    isDraggingSpectrum = true;
    handleSpectrumDrag(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDraggingSpectrum) {
      handleSpectrumDrag(e);
    }
  });

  window.addEventListener('mouseup', () => {
    isDraggingSpectrum = false;
  });

  function handleSpectrumDrag(e) {
    const rect = spectrumCanvas.getBoundingClientRect();
    const u = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const freq = 20 * Math.pow(20000 / 20, u);
    engine.centerFreq = freq;
    sliderCenterFreq.value = freq;

    const q = 0.5 * Math.pow(120 / 0.5, 1 - v);
    engine.qFactor = q;
    sliderQ.value = q;

    syncUIFromEngine();
    engine.updateFilterBankParameters(0.02);
  }

  spectrumCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    engine.spread = Math.max(0.1, Math.min(5.0, engine.spread + delta));
    sliderSpread.value = engine.spread;
    syncUIFromEngine();
    engine.updateFilterBankParameters(0.03);
  }, { passive: false });

  // --- Animation & Render Loop ---
  function renderLoop() {
    requestAnimationFrame(renderLoop);

    // 1. Update 8-Preset Parameter Morphing Interpolation
    updateMorphInterpolation();

    // 2. Update Orbit Physics on 2D Pad Puck
    if (isOrbiting && !isDraggingPuck) {
      padPuck.x += padPuck.vx;
      padPuck.y += padPuck.vy;

      if (padPuck.x <= 0.05 || padPuck.x >= 0.95) {
        padPuck.vx = -padPuck.vx + (Math.random() - 0.5) * 0.001;
        padPuck.x = Math.max(0.05, Math.min(0.95, padPuck.x));
      }
      if (padPuck.y <= 0.05 || padPuck.y >= 0.95) {
        padPuck.vy = -padPuck.vy + (Math.random() - 0.5) * 0.001;
        padPuck.y = Math.max(0.05, Math.min(0.95, padPuck.y));
      }

      if (padMode === 'morph') {
        applyPadMorphInterpolation(padPuck.x, padPuck.y);
      } else {
        applyDirectPad(padPuck.x, padPuck.y);
      }
    }

    // Record Puck Trail
    puckTrail.push({ x: padPuck.x, y: padPuck.y, life: 1.0 });
    if (puckTrail.length > 25) {
      puckTrail.shift();
    }

    // 3. Render 2D Pad Canvas
    renderPadCanvas();

    // 4. Render Spectrum Visualizer Canvas
    renderSpectrumCanvas();

    // 5. Render Resonator Waterfall / Filter Energy Bars
    if (filterBarsCtx) {
      renderFilterBars();
    }

    // 6. Real-time Master Limiter Gain Reduction Meter Update
    if (grMeterBar && grMeterVal) {
      if (engine.limiterEnabled && engine.masterLimiterNode) {
        const red = engine.getLimiterReduction();
        const absRed = Math.abs(red);
        if (absRed > 0.1) {
          const pct = Math.min(100, (absRed / 16) * 100);
          grMeterBar.style.width = `${pct}%`;
          grMeterVal.textContent = `-${absRed.toFixed(1)}dB`;
        } else {
          grMeterBar.style.width = '0%';
          grMeterVal.textContent = '0dB';
        }
      } else {
        grMeterBar.style.width = '0%';
        grMeterVal.textContent = 'OFF';
      }
    }
  }

  // --- Render 2D Pad ---
  function renderPadCanvas() {
    const w = padCanvas.width;
    const h = padCanvas.height;
    padCtx.clearRect(0, 0, w, h);

    padCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    padCtx.lineWidth = 1;
    const steps = 8;
    for (let i = 1; i < steps; i++) {
      const gx = (i / steps) * w;
      const gy = (i / steps) * h;
      padCtx.beginPath();
      padCtx.moveTo(gx, 0); padCtx.lineTo(gx, h);
      padCtx.moveTo(0, gy); padCtx.lineTo(w, gy);
      padCtx.stroke();
    }

    padCtx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
    padCtx.beginPath();
    padCtx.moveTo(w / 2, 0); padCtx.lineTo(w / 2, h);
    padCtx.moveTo(0, h / 2); padCtx.lineTo(w, h / 2);
    padCtx.stroke();

    if (padMode === 'morph') {
      const corners = [
        { label: 'A: ' + snapshots.A.distMode, x: 28, y: 22, color: '#00f2fe' },
        { label: 'B: ' + snapshots.B.distMode, x: w - 28, y: 22, color: '#f72585', align: 'right' },
        { label: 'C: ' + snapshots.C.distMode, x: 28, y: h - 14, color: '#ffb703' },
        { label: 'D: ' + snapshots.D.distMode, x: w - 28, y: h - 14, color: '#9d4edd', align: 'right' }
      ];

      padCtx.font = '10px "JetBrains Mono", monospace';
      corners.forEach(c => {
        padCtx.fillStyle = c.color;
        padCtx.textAlign = c.align || 'left';
        padCtx.fillText(c.label, c.x, c.y);
      });
    } else {
      padCtx.font = '10px "JetBrains Mono", monospace';
      padCtx.fillStyle = 'rgba(255,255,255,0.4)';
      padCtx.textAlign = 'left';
      padCtx.fillText('X: Frequency →', 12, h - 12);
      padCtx.fillText('↑ Y: Resonance Q', 12, 20);
    }

    for (let i = 0; i < puckTrail.length - 1; i++) {
      const p1 = puckTrail[i];
      const p2 = puckTrail[i + 1];
      const alpha = (i / puckTrail.length) * 0.45;
      padCtx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
      padCtx.lineWidth = (i / puckTrail.length) * 4;
      padCtx.beginPath();
      padCtx.moveTo(p1.x * w, p1.y * h);
      padCtx.lineTo(p2.x * w, p2.y * h);
      padCtx.stroke();
    }

    const px = padPuck.x * w;
    const py = padPuck.y * h;

    const grad = padCtx.createRadialGradient(px, py, 2, px, py, 24);
    grad.addColorStop(0, 'rgba(0, 242, 254, 0.8)');
    grad.addColorStop(0.5, 'rgba(247, 37, 133, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    padCtx.fillStyle = grad;
    padCtx.beginPath();
    padCtx.arc(px, py, 24, 0, Math.PI * 2);
    padCtx.fill();

    padCtx.fillStyle = '#ffffff';
    padCtx.beginPath();
    padCtx.arc(px, py, 5, 0, Math.PI * 2);
    padCtx.fill();

    padCtx.strokeStyle = '#00f2fe';
    padCtx.lineWidth = 2;
    padCtx.beginPath();
    padCtx.arc(px, py, 9, 0, Math.PI * 2);
    padCtx.stroke();
  }

  // --- Render Spectrum Visualizer ---
  function renderSpectrumCanvas() {
    const w = spectrumCanvas.width;
    const h = spectrumCanvas.height;
    spectrumCtx.clearRect(0, 0, w, h);

    const freqMarkers = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
    spectrumCtx.font = '10px "JetBrains Mono", monospace';
    spectrumCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    spectrumCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    spectrumCtx.lineWidth = 1;

    for (const f of freqMarkers) {
      const u = Math.log2(f / 20) / Math.log2(20000 / 20);
      const x = u * w;
      spectrumCtx.beginPath();
      spectrumCtx.moveTo(x, 0);
      spectrumCtx.lineTo(x, h);
      spectrumCtx.stroke();

      const label = f >= 1000 ? `${f / 1000}k` : `${f}`;
      spectrumCtx.fillText(label, x + 3, h - 8);
    }

    if (engine.outputAnalyser && engine.outputFreqData) {
      engine.outputAnalyser.getByteFrequencyData(engine.outputFreqData);

      spectrumCtx.beginPath();
      spectrumCtx.moveTo(0, h);
      const binCount = engine.outputAnalyser.frequencyBinCount;
      const sr = engine.ctx.sampleRate;

      for (let i = 0; i < binCount; i++) {
        const freq = (i / binCount) * (sr / 2);
        if (freq < 20 || freq > 20000) continue;
        const u = Math.log2(freq / 20) / Math.log2(20000 / 20);
        const x = u * w;
        const val = engine.outputFreqData[i] / 255;
        const y = h - val * (h - 20);
        spectrumCtx.lineTo(x, y);
      }
      spectrumCtx.lineTo(w, h);

      const fftGrad = spectrumCtx.createLinearGradient(0, 0, 0, h);
      fftGrad.addColorStop(0, 'rgba(0, 242, 254, 0.35)');
      fftGrad.addColorStop(0.5, 'rgba(157, 78, 221, 0.15)');
      fftGrad.addColorStop(1, 'rgba(10, 13, 20, 0.0)');
      spectrumCtx.fillStyle = fftGrad;
      spectrumCtx.fill();

      spectrumCtx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
      spectrumCtx.lineWidth = 1.5;
      spectrumCtx.stroke();
    }

    const N = engine.activeFilterCount;
    for (let i = 0; i < N; i++) {
      const item = engine.filterGraph[i];
      if (!item) continue;
      const freq = item.targetFreq;
      if (freq < 20 || freq > 20000) continue;

      const u = Math.log2(freq / 20) / Math.log2(20000 / 20);
      const x = u * w;

      let energy = 0;
      if (engine.outputAnalyser && engine.outputFreqData) {
        const bin = Math.floor((freq / (engine.ctx.sampleRate / 2)) * engine.outputAnalyser.frequencyBinCount);
        if (bin >= 0 && bin < engine.outputFreqData.length) {
          energy = engine.outputFreqData[bin] / 255;
        }
      }
      item.energy = item.energy * 0.8 + energy * 0.2;

      const poleHeight = Math.min(h - 30, (item.targetGain * 30 + item.energy * 120 + Math.log10(item.targetQ + 1) * 35));
      const poleY = h - poleHeight;

      const q = Math.max(1, item.targetQ);
      const bwRatio = 1 / q;
      const bwPixels = Math.max(4, bwRatio * w * 0.8);

      spectrumCtx.beginPath();
      spectrumCtx.moveTo(x - bwPixels * 2.5, h);
      spectrumCtx.quadraticCurveTo(x, poleY, x + bwPixels * 2.5, h);

      const hue = 180 + u * 150;
      const alpha = 0.25 + item.energy * 0.6;
      spectrumCtx.fillStyle = `hsla(${hue}, 90%, 60%, ${alpha * 0.35})`;
      spectrumCtx.fill();

      spectrumCtx.strokeStyle = `hsla(${hue}, 95%, 65%, ${alpha})`;
      spectrumCtx.lineWidth = 1.5 + item.energy * 2;
      spectrumCtx.beginPath();
      spectrumCtx.moveTo(x, h);
      spectrumCtx.lineTo(x, poleY);
      spectrumCtx.stroke();

      spectrumCtx.fillStyle = '#ffffff';
      spectrumCtx.beginPath();
      spectrumCtx.arc(x, poleY, 2.5 + item.energy * 3.5, 0, Math.PI * 2);
      spectrumCtx.fill();
    }

    const centerU = Math.log2(engine.centerFreq / 20) / Math.log2(20000 / 20);
    const centerX = centerU * w;
    spectrumCtx.strokeStyle = 'rgba(255, 183, 3, 0.7)';
    spectrumCtx.lineWidth = 2;
    spectrumCtx.setLineDash([4, 4]);
    spectrumCtx.beginPath();
    spectrumCtx.moveTo(centerX, 0);
    spectrumCtx.lineTo(centerX, h);
    spectrumCtx.stroke();
    spectrumCtx.setLineDash([]);

    spectrumCtx.fillStyle = '#ffb703';
    spectrumCtx.fillText(`F0: ${Math.round(engine.centerFreq)}Hz (${freqToNoteName(engine.centerFreq)})`, centerX + 6, 20);
  }

  // --- Render Waterfall / Filter Energy Bars ---
  function renderFilterBars() {
    const w = filterBarsCanvas.width;
    const h = filterBarsCanvas.height;
    filterBarsCtx.clearRect(0, 0, w, h);

    const N = engine.activeFilterCount;
    const barWidth = Math.max(1, (w / N) - 1);

    for (let i = 0; i < N; i++) {
      const item = engine.filterGraph[i];
      const energy = item ? item.energy : 0;
      const barH = energy * h;
      const x = i * (w / N);
      const y = h - barH;

      const hue = 180 + (i / N) * 160;
      filterBarsCtx.fillStyle = `hsla(${hue}, 90%, 60%, 0.85)`;
      filterBarsCtx.fillRect(x, y, barWidth, barH);
    }
  }

  // Full Banner Drawer Toggle (Matching Spectral Delay Studio)
  const btnToggleFullBanner = document.getElementById('btnToggleFullBanner');
  const fullBannerDrawer = document.getElementById('fullBannerDrawer');
  const bannerToggleText = document.getElementById('bannerToggleText');

  if (btnToggleFullBanner && fullBannerDrawer) {
    btnToggleFullBanner.addEventListener('click', () => {
      const isHidden = fullBannerDrawer.style.display === 'none';
      fullBannerDrawer.style.display = isHidden ? 'flex' : 'none';
      bannerToggleText.textContent = isHidden ? '✕ 收合大圖' : '📐 展開完整大圖';
    });
  }

  // Initial Setup: Render the 8 Preset Buttons and apply Slot 1 Default
  renderPresetButtons();
  applyFullPresetDirectly(PRESET_SLOTS[0]);
  updateActivePresetBadge(0);

  // Start Animation Loop
  renderLoop();
});
