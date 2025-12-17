// record.js — FINAL MODULATOR (WAV + FIRE ICON + FONT MENARIK)
(function () {
  /* =========================
     ROOT CONTAINER
  ========================= */
  const container = document.createElement('div');
  container.id = 'recordModulator';
  document.body.appendChild(container);

  /* =========================
     GOOGLE FONT
  ========================= */
  const link = document.createElement('link');
  link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);

  /* =========================
     STYLES
  ========================= */
  const style = document.createElement('style');
  style.textContent = `
  #recordModulator { font-family: 'Poppins', sans-serif; padding: 40px; text-align: center; }
  #recordModulator h1 { font-size: 28px; cursor: pointer; user-select: none; display: inline-flex; align-items: center; justify-content: center; gap: 10px; transition: transform .25s, opacity .25s; }
  #recordModulator h1:hover { transform: scale(1.08); opacity: .85; }
  .fire-icon { display:inline-block; color: orange; animation: fireAnim 1s infinite alternate; }
  @keyframes fireAnim { 0% { transform: translateY(0) scale(1); opacity:1; } 50% { transform: translateY(-3px) scale(1.2); opacity:0.8; } 100% { transform: translateY(0) scale(1); opacity:1; } }

  #recordModulator button { font-size: 22px; padding: 12px 18px; margin: 6px; border-radius: 12px; border: none; cursor: pointer; color: #fff; background: linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045); transition: .2s; }
  #recordModulator button:hover { transform: scale(1.1); }
  #recordModulator button.locked { opacity: .5; cursor: not-allowed; }
  #recordModulator button:disabled { opacity: 0.5; cursor: not-allowed; transform: scale(1); }

  .blink { animation: blink 1.2s infinite; }
  @keyframes blink {0%{opacity:1}50%{opacity:.3}100%{opacity:1}}

  /* Floating controls */
  #recordModulator .floating { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); padding: 14px; border-radius: 16px; background: rgba(255,255,255,.92); backdrop-filter: blur(10px); display: none; z-index: 999; }

  /* Overlay + Popup flex centering */
  #recordModulator .overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.5);
    z-index: 900;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #recordModulatorPopup {
    background: #fff;
    padding: 24px;
    border-radius: 14px;
    width: 90%;
    max-width: 520px;
    max-height: 80vh;
    overflow-y: auto;
    transform: scale(.95);
    opacity: 0;
    transition: .25s;
    pointer-events: none;
    position: relative;
    z-index: 1500;
  }
  #recordModulatorPopup.show { transform: scale(1); opacity: 1; pointer-events: auto; }
  #recordModulatorPopup.hidden { display: none; }

  /* <p> isolasi untuk focus mode */
  #recordModulatorPopup .popupHighlight {
    color: #000 !important;
    font-weight: 600 !important;
    background: rgba(255,255,255,0.95) !important;
    z-index: 2000 !important;
    pointer-events: auto !important;
  }
  #recordModulatorPopup .popupHighlight a {
    color: #1a73e8 !important;
    text-decoration: underline !important;
  }

  #recordModulatorPopup textarea { width: 100%; height: 200px; margin-top: 10px; font-family: monospace; }

  /* Toast */
  #recordModulator .toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,.85); color: #fff; padding: 12px 20px; border-radius: 12px; opacity: 0; transition: .3s; z-index: 1600; }
  #recordModulator .toast.show { opacity: 1; }
  `;
  document.head.appendChild(style);

  /* =========================
     HTML
  ========================= */
  container.innerHTML = `
    <h1 id="openRecorder">
      <span class="fire-icon">🔥</span>
      Let's get practice!
      <span class="fire-icon">🔥</span>
    </h1>
    <div class="click-hint">
      <span class="up-arrow">⬆️</span>
      <span class="up-arrow">⬆️</span>
      <span class="up-arrow">⬆️</span>
    </div>
    <div class="click-hint">
      <span class="click-text">Click</span>
    </div>

    <div class="overlay"></div>
    <div id="recordModulatorPopup" class="hidden">
      <h3>Correction Steps</h3>
      <p class="popupHighlight">
        Rekam suara Anda menggunakan tombol ⏺ di bawah.<br>
        Setelah selesai, unduh file audio dan simpan di pc/android Anda.<br>  
        Buka halaman <a href="https://gemini.google.com/app" target="_blank">https://gemini.google.com/app</a><br>
        Upload rekaman audio Anda<br>
        Gunakan prompt berikut:
      </p>
      <textarea readonly></textarea>
      <button id="copyPrompt">Salin Prompt</button>
    </div>
    <div class="floating">
      <button id="recordBtn">⏺</button>
      <button id="playBtn" disabled>▶</button>
      <button id="downloadBtn" disabled>⬇️</button>
      <button id="resetBtn" disabled>🧹</button>
      <button id="correctionBtn">📝</button>
      <button id="closeFloatingBtn">❌</button>
    </div>
  `;

  /* =========================
     ELEMENTS
  ========================= */
  const openRecorder = container.querySelector('#openRecorder');
  const floating = container.querySelector('.floating');
  const overlay = container.querySelector('.overlay');
  const popup = container.querySelector('#recordModulatorPopup');

  const recordBtn = container.querySelector('#recordBtn');
  const playBtn = container.querySelector('#playBtn');
  const resetBtn = container.querySelector('#resetBtn');
  const downloadBtn = container.querySelector('#downloadBtn');
  const correctionBtn = container.querySelector('#correctionBtn');
  const closeFloatingBtn = container.querySelector('#closeFloatingBtn');
  const copyPrompt = container.querySelector('#copyPrompt');
  const promptText = popup.querySelector('textarea');

  /* =========================
     POPUP PROMPT CONTENT
  ========================= */
  promptText.value = `"Saya telah mengunggah rekaman audio. Saya ingin Anda bertindak sebagai penilai aksen bahasa Inggris profesional. 
1. Transkripsikan semua kata yang saya ucapkan dalam rekaman ini.
2. Analisis setiap kata tersebut dengan fokus pada American Accent (General American). Nilai dan beri umpan balik pada pengucapan vokal dan konsonan.
3. Format Output: Sajikan hasil analisis dalam bentuk tabel dengan tiga kolom:
   - Kolom 1: Kata yang diucapkan.
   - Kolom 2: Status Kualitatif ('🟢 Bagus', '🟡 Perlu Sedikit Perbaikan', atau '🔴 Perlu Perbaikan').
   - Kolom 3: Umpan Balik spesifik yang menjelaskan secara singkat apa yang perlu diperbaiki."`;

  /* =========================
     TOAST
  ========================= */
  function toast(msg = 'Berhasil disalin') {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    container.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 1500);
  }

  /* =========================
     INDEXEDDB
  ========================= */
  let db;
  const request = indexedDB.open('recordingsDB', 1);
  request.onupgradeneeded = e => {
    db = e.target.result;
    if (!db.objectStoreNames.contains('audios')) db.createObjectStore('audios', { keyPath: 'id' });
  };
  request.onsuccess = e => {
    db = e.target.result;
    playBtn.disabled = resetBtn.disabled = downloadBtn.disabled = true;
    popup.classList.add('hidden');
    overlay.style.display = 'none';
    floating.style.display = 'none';
    loadAudioFromDB();
  };
  function saveAudioToDB(blob) { if (!db) return; const tx = db.transaction('audios','readwrite'); tx.objectStore('audios').put({id:'latest', blob}); }
  function deleteAudioFromDB() { if (!db) return; const tx = db.transaction('audios','readwrite'); tx.objectStore('audios').delete('latest'); }
  function loadAudioFromDB() { if (!db) return; const tx = db.transaction('audios','readonly'); const store = tx.objectStore('audios'); const getReq = store.get('latest'); getReq.onsuccess = () => { if(getReq.result){ audioBlob = getReq.result.blob; audio.src = URL.createObjectURL(audioBlob); } } }

  /* =========================
     AUDIO WAV LOGIC
  ========================= */
  let recorder, chunks=[], audioBlob=null;
  const audio = new Audio(); let stream;
  audio.onended = () => playBtn.textContent='▶';

  function encodeWAV(buffers, sampleRate) {
    const interleaved = buffers[0];
    const buffer = new ArrayBuffer(44 + interleaved.length * 2);
    const view = new DataView(buffer);
    function writeString(view, offset, string){ for(let i=0;i<string.length;i++){view.setUint8(offset+i,string.charCodeAt(i));} }
    let offset=0;
    writeString(view, offset,'RIFF'); offset+=4;
    view.setUint32(offset,36 + interleaved.length*2,true); offset+=4;
    writeString(view, offset,'WAVE'); offset+=4;
    writeString(view, offset,'fmt '); offset+=4;
    view.setUint32(offset,16,true); offset+=4;
    view.setUint16(offset,1,true); offset+=2;
    view.setUint16(offset,1,true); offset+=2;
    view.setUint32(offset,sampleRate,true); offset+=4;
    view.setUint32(offset,sampleRate*2,true); offset+=4;
    view.setUint16(offset,2,true); offset+=2;
    view.setUint16(offset,16,true); offset+=2;
    writeString(view, offset,'data'); offset+=4;
    view.setUint32(offset,interleaved.length*2,true); offset+=4;
    let index=0;
    for(let i=0;i<interleaved.length;i++){ view.setInt16(offset + index, interleaved[i]*0x7FFF,true); index+=2; }
    return new Blob([view],{type:'audio/wav'});
  }

  async function startRecording() {
    chunks = [];
    stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096,1,1);
    source.connect(processor); processor.connect(context.destination);
    const buffers = [];
    processor.onaudioprocess = e => { const data = e.inputBuffer.getChannelData(0); buffers.push(new Float32Array(data)); };
    recorder = { stop: () => { processor.disconnect(); source.disconnect(); context.close(); stream.getTracks().forEach(t=>t.stop()); 
      const flat = new Float32Array(buffers.reduce((acc,b)=>acc.concat(Array.from(b)),[]));
      audioBlob = encodeWAV([flat], context.sampleRate); 
      audio.src = URL.createObjectURL(audioBlob); 
      playBtn.disabled = resetBtn.disabled = downloadBtn.disabled = false; 
      recordBtn.classList.add('locked'); saveAudioToDB(audioBlob);
      recorder = null; // reset recorder agar bisa rekam lagi
    }};
  }

  /* =========================
     OPEN RECORDER
  ========================= */
  openRecorder.onclick = async ()=>{
    try {
      await navigator.mediaDevices.getUserMedia({audio:true});
      audio.pause(); audio.src&&URL.revokeObjectURL(audio.src); audio.src=''; audioBlob=null;
      playBtn.disabled=resetBtn.disabled=downloadBtn.disabled=true;
      recordBtn.classList.remove('locked');
      deleteAudioFromDB();
      floating.style.display='block';
    }catch{ toast('Mic ditolak'); }
  }

  /* =========================
     RECORD BUTTON
  ========================= */
  recordBtn.onclick = async () => {
    if(recordBtn.classList.contains('locked')) return;

    // Scroll ke word-card pertama di example.js
    const exampleContainer = document.querySelector('.container.module-container.focus-primary');
    if(exampleContainer){
      const wordCards = exampleContainer.querySelectorAll('.word-card');
      if(wordCards.length > 0) wordCards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if(!recorder){
      await startRecording();
      recordBtn.textContent='⏹';
      recordBtn.classList.add('blink');
    } else {
      recorder.stop();
      recordBtn.classList.remove('blink');
      recordBtn.textContent='⏺';
    }
  }

  /* =========================
     PLAY BUTTON
  ========================= */
  playBtn.onclick = () => {
    if(!audioBlob) return;
    if(audio.paused){ audio.play(); playBtn.textContent='⏹'; }
    else{ audio.pause(); audio.currentTime=0; playBtn.textContent='▶'; }
  }

  /* =========================
     RESET BUTTON
  ========================= */
  resetBtn.onclick = () => {
    audio.pause(); audio.src&&URL.revokeObjectURL(audio.src); audio.src=''; audioBlob=null;
    playBtn.textContent='▶'; playBtn.disabled=resetBtn.disabled=downloadBtn.disabled=true;
    recordBtn.classList.remove('locked'); deleteAudioFromDB();
  }

  /* =========================
     DOWNLOAD BUTTON
  ========================= */
  downloadBtn.onclick = () => {
    if(!audioBlob) return;
    const a=document.createElement('a'); a.href=URL.createObjectURL(audioBlob); a.download='recording.wav'; a.click(); URL.revokeObjectURL(a.href);
  }

  /* =========================
     CORRECTION POPUP
  ========================= */
  correctionBtn.onclick = e => {
    e.stopPropagation();
    overlay.style.display = 'flex';
    popup.classList.remove('hidden');
    requestAnimationFrame(() => popup.classList.add('show'));
    popup.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  overlay.onclick = () => {
    popup.classList.remove('show');
    setTimeout(() => { popup.classList.add('hidden'); overlay.style.display = 'none'; }, 250);
  }

  /* =========================
     COPY PROMPT
  ========================= */
  copyPrompt.onclick = () => {
    navigator.clipboard.writeText(promptText.value).then(() => toast()).catch(() => toast('Gagal menyalin'));
  }

  /* =========================
     CLOSE FLOATING BUTTON
  ========================= */
  closeFloatingBtn.onclick = () => {
    audio.pause(); audio.src&&URL.revokeObjectURL(audio.src); audio.src=''; audioBlob=null;
    playBtn.disabled=resetBtn.disabled=downloadBtn.disabled=true;
    recordBtn.classList.remove('locked'); deleteAudioFromDB(); floating.style.display='none'; toast('Data audio dihapus');
  }

})();
