// modulator.js
(function() {
  const container = document.createElement('div');
  container.id = 'modulatorContainer';
  document.body.appendChild(container);

  const style = document.createElement('style');
  style.textContent = `
    /* Font & Container */
    #modulatorContainer { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; padding: 40px; text-align: center; background: transparent; }
    #modulatorContainer h1 { 
      font-family: 'Poppins', 'Segoe UI', sans-serif; 
      font-size: 28px; 
      margin-bottom: 20px; 
      cursor: pointer; 
      user-select: none;
      transition: transform 0.2s ease;
    }
    #modulatorContainer h1:hover { transform: scale(1.05); color: #fd1d1d; }

    /* Buttons */
    #modulatorContainer button { font-family: 'Poppins', 'Segoe UI', sans-serif; font-weight: 600; padding: 12px 18px; margin: 5px; font-size: 22px; border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; background: linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045); color: #fff; }
    #modulatorContainer button:hover { transform: scale(1.12); box-shadow: 0 4px 12px rgba(0,0,0,0.25); }
    #modulatorContainer button:disabled { opacity: 0.5; cursor: not-allowed; background: #888; }
    #modulatorContainer button.active { background: linear-gradient(45deg, #fcb045, #fd1d1d, #833ab4); box-shadow: 0 0 15px rgba(255,255,255,0.8); transform: scale(1.2); }
    @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
    #modulatorContainer button.blink { animation: blink 1.3s infinite; }

    /* Floating Panel */
    #modulatorContainer #floatingControls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); padding: 12px 16px; border-radius: 16px; display: none; z-index: 999; background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); box-shadow: 0 0 20px rgba(0,0,0,0.3); position: relative; }

    /* Overlay */
    #modulatorContainer #overlay { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); z-index: 900; }

    /* Popup */
    #modulatorContainer #correctionPopup { display: none; position: fixed; top:50%; left:50%; transform: translate(-50%, -50%); background: #fff; padding: 25px; border-radius: 14px; box-shadow: 0 0 20px rgba(0,0,0,0.3); width: 90%; max-width: 520px; z-index: 1000; }
    #modulatorContainer #correctionPopup textarea { font-family: 'Courier New', monospace; font-size: 14px; width: 100%; height: 150px; margin-top: 12px; }

    /* Close Button */
    #modulatorContainer .closeBtn { padding: 6px 12px; font-size: 14px; background: red; color: #fff; border-radius: 50%; cursor: pointer; z-index: 1000; }
    #modulatorContainer #floatingControls .closeBtn { position: absolute; top: 0; right: 0; }
    #modulatorContainer #correctionPopup .closeBtn { position: absolute; top: 10px; right: -10px; }

    /* Mobile */
    @media (max-width: 480px) {
      #modulatorContainer { padding: 20px; font-size: 16px; }
      #modulatorContainer h1 { font-size: 22px; }
      #modulatorContainer button { font-size: 10px; padding: 10px 14px; }
      #modulatorContainer #floatingControls { bottom: 10px; padding: 10px 12px; border-radius: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
      #modulatorContainer #correctionPopup { width: 95%; padding: 20px; }
      #modulatorContainer #correctionPopup textarea { height: 120px; }
    }
  `;
  document.head.appendChild(style);

  // =========================
  // 3. HTML Elements
  // =========================
  const h1 = document.createElement('h1');
  h1.textContent = "Let's get practice!";
  container.appendChild(h1);

  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  container.appendChild(overlay);

  const popup = document.createElement('div');
  popup.id = 'correctionPopup';
  popup.innerHTML = `
    <button id="closePopup" class="closeBtn">X</button>
    <h3>Correction Steps</h3>
    <ol>
      <li>Buka halaman <a href="https://gemini.google.com/app" target="_blank">Gemini</a></li>
      <li>Upload rekaman audio Anda</li>
      <li>Gunakan prompt berikut:</li>
    </ol>
    <textarea id="promptText" readonly>
"Saya telah mengunggah rekaman audio. Saya ingin Anda bertindak sebagai penilai aksen bahasa Inggris profesional. 

1. Transkripsikan semua kata yang saya ucapkan dalam rekaman ini.
2. Analisis setiap kata tersebut dengan fokus pada American Accent (General American). Nilai dan beri umpan balik pada pengucapan vokal dan konsonan.
3. Format Output: Sajikan hasil analisis dalam bentuk tabel dengan tiga kolom:
   - Kolom 1: Kata yang diucapkan.
   - Kolom 2: Status Kualitatif ('🟢 Bagus', '🟡 Perlu Sedikit Perbaikan', atau '🔴 Perlu Perbaikan').
   - Kolom 3: Umpan Balik spesifik yang menjelaskan secara singkat apa yang perlu diperbaiki."
    </textarea>
    <button id="copyPrompt">Salin Prompt</button>
  `;
  container.appendChild(popup);

  const floating = document.createElement('div');
  floating.id = 'floatingControls';
  floating.innerHTML = `
    <button id="startBtn">⏺</button>
    <button id="listenBtn" disabled>▶</button>
    <button id="resetBtn" disabled>🧹</button>
    <button id="downloadBtn" disabled>⬇️</button>
    <button id="correctionBtn">📝</button>
    <button id="closeFloating" class="closeBtn">X</button>
  `;
  container.appendChild(floating);

  // =========================
  // 4. Audio & IndexedDB logic
  // =========================
  let mediaRecorder, audioChunks = [], audioBlob, audio = new Audio(), stream;
  let db;
  const request = indexedDB.open('audioDB', 1);
  request.onupgradeneeded = e => { db = e.target.result; if(!db.objectStoreNames.contains('recordings')) db.createObjectStore('recordings', { keyPath:'id' }); };
  request.onsuccess = e => db = e.target.result;

  const startBtn = document.getElementById('startBtn');
  const listenBtn = document.getElementById('listenBtn');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const correctionBtn = document.getElementById('correctionBtn');
  const closeFloating = document.getElementById('closeFloating');
  const closePopup = document.getElementById('closePopup');
  const copyPrompt = document.getElementById('copyPrompt');
  const promptText = document.getElementById('promptText');

  // =========================
  // 5. Audio amplification function
  // =========================
  async function amplifyAudio(blob, gain) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const amplifiedBuffer = audioContext.createBuffer(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      const amplifiedData = amplifiedBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        amplifiedData[i] = channelData[i] * gain;
      }
    }

    const amplifiedBlob = new Blob([await audioContext.encodeAudioData(amplifiedBuffer)], { type: 'audio/webm' });
    audioContext.close();
    return amplifiedBlob;
  }

  // =========================
  // 6. Event listeners
  // =========================

  // Klik judul sebagai tombol record
  h1.addEventListener('click', async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } });
      floating.style.display='block';
    } catch {
      alert('Microphone access denied');
    }
  });

  closeFloating.addEventListener('click', () => floating.style.display='none');

  startBtn.addEventListener('click', async () => {
    if(!mediaRecorder || mediaRecorder.state==='inactive'){
      audioChunks=[]; audioBlob=null;
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      startBtn.classList.add('blink'); startBtn.textContent='⏹';
      mediaRecorder.ondataavailable = e=>audioChunks.push(e.data);
      mediaRecorder.onstop = async ()=>{
        try {
          const rawBlob = new Blob(audioChunks,{type:'audio/webm'});
          // Amplify volume
          const amplifiedBlob = await amplifyAudio(rawBlob, 2); // Double the volume
          audioBlob = amplifiedBlob;
          audio.src=URL.createObjectURL(audioBlob);
          listenBtn.disabled=false; resetBtn.disabled=false; downloadBtn.disabled=false;
          startBtn.classList.remove('blink'); startBtn.textContent='⏺';
          if(stream){ stream.getTracks().forEach(track => track.stop()); stream = null; }
          const tx = db.transaction(['recordings'],'readwrite'); tx.objectStore('recordings').put({id:'latest', blob:audioBlob});
        } catch (error) {
          console.error('Error amplifying audio:', error);
          // Fallback to original blob without amplification
          audioBlob = new Blob(audioChunks,{type:'audio/webm'});
          audio.src=URL.createObjectURL(audioBlob);
          listenBtn.disabled=false; resetBtn.disabled=false; downloadBtn.disabled=false;
          startBtn.classList.remove('blink'); startBtn.textContent='⏺';
          if(stream){ stream.getTracks().forEach(track => track.stop()); stream = null; }
          const tx = db.transaction(['recordings'],'readwrite'); tx.objectStore('recordings').put({id:'latest', blob:audioBlob});
        }
      };
    } else if(mediaRecorder.state==='recording'){
      mediaRecorder.stop();
      startBtn.classList.remove('blink'); startBtn.textContent='⏺';
    }
  });

  listenBtn.addEventListener('click', ()=>{
    if(audio.paused){ audio.play(); listenBtn.textContent='⏹'; listenBtn.classList.add('active'); audio.onended=()=>{ listenBtn.textContent='▶'; listenBtn.classList.remove('active'); }; }
    else{ audio.pause(); audio.currentTime=0; listenBtn.textContent='▶'; listenBtn.classList.remove('active'); }
  });

  resetBtn.addEventListener('click', ()=>{
    if(mediaRecorder && mediaRecorder.state==='recording'){ mediaRecorder.stop(); }
    audioChunks=[]; audioBlob=null; if(audio.src) URL.revokeObjectURL(audio.src); audio.src='';
    startBtn.textContent='⏺'; startBtn.disabled=false; startBtn.classList.remove('disabled-stop','blink');
    listenBtn.disabled=true; resetBtn.disabled=true; downloadBtn.disabled=true; listenBtn.textContent='▶'; listenBtn.classList.remove('active');
    if(stream){ stream.getTracks().forEach(track => track.stop()); stream = null; }
    const tx = db.transaction(['recordings'],'readwrite'); tx.objectStore('recordings').delete('latest');
  });

  downloadBtn.addEventListener('click', ()=>{
    if(!audioBlob){ alert('Rekaman belum selesai.'); return; }
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a'); a.href=url; a.download='recording_learning_english_geuwat.mp3'; a.click(); URL.revokeObjectURL(url);
  });

  correctionBtn.addEventListener('click', ()=>{ overlay.style.display='block'; popup.style.display='block'; });
  closePopup.addEventListener('click', ()=>{ overlay.style.display='none'; popup.style.display='none'; });
  overlay.addEventListener('click', ()=>{ overlay.style.display='none'; popup.style.display='none'; });

  copyPrompt.addEventListener('click', ()=>{
    navigator.clipboard.writeText(promptText.value).then(()=>alert('Prompt berhasil disalin!')).catch(()=>alert('Gagal menyalin prompt'));
  });

})();
