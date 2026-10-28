# ILab 共振濾波工作室 (ILab Resonance Filter Studio)

> **互動音樂與多媒體實驗室 (ILAB)**  
> **實驗室主持人：鄭建文 (Prof. Cheng-Wen Cheng)**  
> **實驗室網站：** [https://ilab-ntut.blogspot.com/](https://ilab-ntut.blogspot.com/)  
> **主持人網站：** [https://cwcheng2009.blogspot.com/](https://cwcheng2009.blogspot.com/)  

🌐 **線上即時體驗 (Live Demo)**：[https://cwcheng2009.github.io/reson-filter-studio/](https://cwcheng2009.github.io/reson-filter-studio/)

---

## 📖 系統簡介 (Overview)

**ILab 共振濾波工作室 (ILab Resonance Filter Studio)** 是一套在瀏覽器端即時運行的電聲音樂與音效設計工作站，其核心架構汲取自經典二階共振濾波器組 (Resonant Filter Bank) 聲學設計。

本系統運用現代 Web Audio API 原生硬體加速管線，建立由多達 **128 組二階共振濾波器 (Second-Order Resonant Filter Bank)** 所構成的聲音塑形矩陣。無論輸入任何聲音訊號（自選音訊、鼓組、人聲、麥克風收音、甚至純粹的雨滴點擊或雜訊），皆能透過共振頻率分佈律制、高 Q 值尖峰諧振與 2D 質地漸變控制，將原始聲音轉化為具有晶瑩金屬感、鐘鳴、西藏頌缽、外星聲道母音或沉積岩洞穴般的奇異電聲景觀。

---

## 🎛️ 核心技術與聲學架構 (Key Features & Architecture)

### 1. 多頻段共振濾波器組 (Resonator Filter Bank)
* **濾波器數量擴展：** 支援 16、24、32、48、64、至最高 128 組並行共振濾波器。
* **三種濾波響應類型：**
  * `Bandpass`（帶通濾波）：經典帶通運作模式，將非諧振頻率全面削去，僅保留極致銳利的純淨諧振線條。
  * `Peaking`（峰值諧振加強）：在保留原始聲音本體的同時，於特定分佈頻率注入強烈金屬光澤。
  * `Lowpass`（共振低通）：結合高 Q 值截止點的共振低通陣列。
* **共振銳利度 Q 值：** 範圍自 0.5（柔和溫潤修飾）至 150（產生近乎無限自激鳴響的雷射金屬鈴音）。
* **聲學材質衰減阻尼 (Decay / Damping Tilt)：**
  * 負斜率（$-1.0$）：高頻衰減較快，模擬木質、毛氈與泥土等柔軟吸音材質。
  * 正斜率（$+1.0$）：高頻長久振盪，模擬玻璃、鋼管與水晶教堂鐘等堅硬反射材質。
* **立體聲全景擴展 (Stereo Spread)：** 各濾波器依頻段交叉分佈於左右立體聲場，營造沉浸式三維聲學空間。

### 2. 豐富的調律律制與頻率分佈 (Scales & Distribution Engine)
使用者可自由指定濾波器群的中心頻率（$F_0$）與開合倍率（Spread），並選用多樣化的物理與音樂調音模式：
* **諧波列 (Harmonic Series)：** $f_k = F_0 \times (k + 1)$，自然銅管與管樂器的泛音共鳴。
* **次諧波列 (Subharmonic Series)：** $f_k = F_0 / (k + 1)$，深沉金屬潛艇與次低頻共鳴。
* **等比八度 (Geometric Octave)：** 對數等距分佈，均勻覆蓋人耳聽覺頻帶。
* **線性梳形 (Linear Comb)：** 均勻線性頻率間距，創造鐘聲與金屬非諧音環形調變質感。
* **五聲音階 (Pentatonic)：** 東方民族調式，搭配脈衝激發呈現卡林巴琴或空靈木琴風情。
* **甘美朗調式 (Balinese Gamelan Slendro & Pelog)：** 印尼傳統金屬敲擊樂器的微音程諧振。
* **全音階 (Whole Tone)：** 德布西印象派神祕空間感。
* **自然純律 (Just Intonation)：** 純正諧波比例（1/1, 9/8, 5/4, 4/3, 3/2...），音色晶瑩澄澈。
* **24 平均律微音程 (24-TET Microtonal)：** 四分之一音密集金屬微塵。
* **母音共鳴峰 (Formant Vowels)：** 模擬人類聲道母音（[a], [e], [i], [o], [u]）的聲學共振。
* **隨機有機金屬板 (Stochastic Random)：** 模擬非對稱金屬薄片敲擊的混亂諧振。

### 3. 8 組預設快照與參數平滑漸變系統 (8-Preset Parameter Morphing System)
本系統提供頂部專屬的 8 槽位快照矩陣：
* **8 組精選聲響槽位 (Slots 01 - 08)：**
  1. `西藏頌缽`：174Hz 自然純律，長尾柔和低頻衰減。
  2. `水晶教堂鐘`：528Hz 諧波列，極高 Q 值反射金屬鈴音。
  3. `外星母音合唱`：330Hz 人聲聲道共鳴峰，Peaking 模式奇異吟詠。
  4. `甘美朗金屬琴`：392Hz 印尼爪哇微音程，高密度脈衝擊發。
  5. `雨滴卡林巴琴`：440Hz 五聲音階，70% 隨機泊松分佈打擊。
  6. `深海金屬潛艇`：82Hz 次諧波陣列，沉重低頻節奏雜訊脈衝。
  7. `玻璃風管共振`：660Hz 對數等比八度，白雜訊激發與高擾動游移。
  8. `太空全音階`：261Hz 印象派全音階，合成鋸齒波琶音序列。
* **自訂漸變時間 (Morph Time)：**
  * 支援自訂滑桿與數值調整：**0.0 秒（即時跳轉）至 20.0 秒（悠長緩慢無痕漸變）**。
  * 提供快捷預設秒數標籤：`0s`、`1.0s`、`3.0s`、`6.0s`、`12.0s`。
* **對數音高與平滑插值演算法：**
  * 中心頻率 $F_0$ 與共振 Q 值均在 $\log_2$ 對數空間中插值，保證頻率平滑滑移（Glissando）無跳音與破音。
  * 結合 Cosine S-curve 緩動函數，過渡質地極度自然。
  * 畫面上所有控制滑桿、頻譜柱與狀態標籤同步即時滑移，提供完整的視覺與聽覺同步反饋。
* **即時覆寫儲存模式 (Store Mode)：**
  * 點擊「💾 儲存模式」後，點擊任意 1 至 8 號槽位即可將當前手動調配好的音色覆寫保存至該槽位。
* **自動巡航循環演奏 (Auto-Cycle Sequencer)：**
  * 啟動後，系統會依照設定的漸變時間自動在 1 ➔ 2 ➔ 3 ➔ ... ➔ 8 ➔ 1 之間無止境循環漸變，極適合無人值守的聲音裝置展覽、環境氛圍音樂與冥想音景演出。

### 4. 2D 向量控制器與 4 角快照漸變 (2D Morphing Controller)
* **雙模式切換：**
  * **直接控制模式 (Direct Control)：** 橫軸（X）即時調變中心頻率 $F_0$，縱軸（Y）調變共振品質因子 Q。
  * **4 角快照插值模式 (4-Corner Snapshot Morphing)：** 分別將喜愛的聲響儲存於角落 A、B、C、D，透過雙線性插值平滑漸變所有共振參數。
* **漫遊物理運動 (Orbit / Wander Physics)：** 啟動後，控制圓點將依據向量速度在空間中彈跳漫遊，隨機產生持續演變的自生成電聲織體 (Generative Soundscape)。

### 4. 全方位激發訊號源 (Exciters)
共振濾波器組需要訊號能量以觸發共振。本系統內建五大即時激發源：
1. **即時脈衝與隨機雨滴 (Impulse / Clicks)：** 具備泊松隨機機率分佈與敲擊硬度控制，呈現清脆打擊質感。
2. **雜訊風鳴 (Pink / White Noise)：** 支援粉紅雜訊與白雜訊，並提供節奏脈衝門閥 (Pulsed Burst)。
3. **合成琶音 (Synth Arpeggiator)：** 內建 4 種合成波形與自動 8 步階琶音序列。
4. **取樣音檔 (Sampler & File Dropzone)：** 內建 4 首高解析程序化取樣（鼓組循環、人聲母音、自然雨滴、金屬擦弦），並支援拖放任何本機 WAV / MP3 檔案。
5. **即時麥克風 (Live Mic)：** 即時串流麥克風聲音，透過耳機即時聆聽人聲與環境音被共振重構的聲音。

### 5. 雙畫布即時動態頻譜視覺化 (Dual Canvas Visualization)
* **頻譜即時響應畫布：**
  * 對數頻率座標軸（20 Hz 至 20 kHz）。
  * 即時輸出 FFT 動態曲線。
  * 獨立共振極點柱（Lorentzian 共振響應鐘形曲線），依據即時通過各頻帶的能量呈現發光律動。
  * 支援直接於頻譜畫布點擊拖曳調節頻率與 Q 值，滾輪縮放頻寬開合。
* **濾波器頻帶能量瀑布瀑布條：** 獨立呈現各頻帶之能量活性。

### 6. 無損音訊錄音與 WAV 匯出 (Master WAV Recorder)
* 內建 16-bit 48kHz PCM WAV 音訊編碼器。
* 隨時錄下即時演奏、漸變過程，一鍵無損下載保存。

---

## 🚀 快速啟動 (Quick Start)

### 方式一：使用一鍵啟動腳本 (Recommended)
於終端機執行：
```bash
cd "reson-filter-studio"
./start.sh
```
系統會自動在預設瀏覽器開啟 `http://localhost:8092`。

### 方式二：使用 Python HTTP 伺服器
```bash
cd "reson-filter-studio"
python3 -m http.server 8092
```
於瀏覽器開啟 `http://localhost:8092` 即可開始體驗。

---

## 📂 檔案結構 (File Structure)

```
reson-filter-studio/
├── index.html          # 主頁面結構與 ILAB 品牌雙 QR 頂部工具列
├── style.css           # 暗黑電聲科技 UI 與響應式排版
├── reson-engine.js     # Web Audio 核心引擎 (128 濾波器組、激發源、WAV 錄音器)
├── app.js              # 控制器、2D Pad 物理漫遊、雙畫布渲染迴圈與預設管理
├── start.sh            # 一鍵本地伺服器啟動腳本
├── assets/             # ILAB 官方 Logo 與實驗室/主持人雙 QR Code 圖片
└── README.md           # 本技術文件
```

---

## 🏛️ 實驗室資訊 (Lab Credits)

* **機構：** 互動音樂與多媒體實驗室 (Interactive Music & Multimedia Lab, ILAB)
* **實驗室主持人：** 鄭建文 (Prof. Cheng-Wen Cheng)
* **實驗室網站：** [https://ilab-ntut.blogspot.com/](https://ilab-ntut.blogspot.com/)
* **主持人個人網站：** [https://cwcheng2009.blogspot.com/](https://cwcheng2009.blogspot.com/)
