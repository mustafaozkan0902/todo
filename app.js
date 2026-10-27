// ==========================================================================
// Şantiye İş Listesi - Ultra Sade & Kompakt (app.js)
// Sol: Tik + Yapılacak İş | Sağ: Mahal / Konu / Saat (Ekrana 12-16 satır sığar)
// ==========================================================================

let state = {
  tasks: [],
  activeStatusFilter: 'all', // 'all' | 'pending' | 'urgent' | 'done'
  activeCatFilter: 'all',
  quickUrgent: false,
  theme: 'dark',
  fullscreenDesktop: false
};

const STORAGE_KEY = 'santiye_kompakt_todo_v3';

const DOM = {
  html: document.documentElement,
  iphoneWrapper: document.getElementById('iphone-wrapper'),
  toggleFrameBtn: document.getElementById('toggle-frame-btn'),
  currentDateText: document.getElementById('current-date-text'),
  statCounter: document.getElementById('stat-counter'),
  exportWhatsappBtn: document.getElementById('export-whatsapp-btn'),
  clearDoneBtn: document.getElementById('clear-done-btn'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),

  // Filtreler
  filterChips: document.querySelectorAll('#filter-bar .f-chip'),
  catFilterSelect: document.getElementById('cat-filter-select'),

  // Görev Listesi
  taskFeed: document.getElementById('task-feed'),

  // Alt Hızlı Ekleme Barı
  quickAddForm: document.getElementById('quick-add-form'),
  quickUrgentBtn: document.getElementById('quick-urgent-btn'),
  quickTaskInput: document.getElementById('quick-task-input'),
  voiceDictateBtn: document.getElementById('voice-dictate-btn'),
  quickTagSelect: document.getElementById('quick-tag-select'),

  // Düzenleme Penceresi
  editSheetOverlay: document.getElementById('edit-sheet-overlay'),
  closeSheetBtn: document.getElementById('close-sheet-btn'),
  editTaskForm: document.getElementById('edit-task-form'),
  editTaskId: document.getElementById('edit-task-id'),
  editTaskTitle: document.getElementById('edit-task-title'),
  editTaskLoc: document.getElementById('edit-task-loc'),
  editTaskCat: document.getElementById('edit-task-cat'),
  editTaskNote: document.getElementById('edit-task-note'),
  editTaskUrgent: document.getElementById('edit-task-urgent'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),

  toastBanner: document.getElementById('toast-banner'),
  toastText: document.getElementById('toast-text')
};

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  updateDateBadge();
  setupTopActions();
  setupFilters();
  setupQuickAdd();
  setupVoice();
  setupEditSheet();
  renderAll();
});

function updateDateBadge() {
  const now = new Date();
  DOM.currentDateText.textContent = now.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    weekday: 'short'
  });
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      state = { ...state, ...JSON.parse(raw) };
    } catch (_) {}
  } else {
    seedCompactSampleTasks();
  }
  DOM.html.setAttribute('data-theme', state.theme || 'dark');
  if (state.fullscreenDesktop) {
    DOM.iphoneWrapper.classList.add('fullscreen-mode');
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function seedCompactSampleTasks() {
  const base = Date.now();
  state.tasks = [
    { id: 't-1', title: '3. kat tabliye demir donatı kontrolü', location: 'A Blok', category: 'Kontrol', urgent: true, done: false, note: 'Beton dökümü öncesi paspayları', time: '08:30', createdAt: base - 10000 },
    { id: 't-2', title: 'C30 beton siparişi teyidi (45 m³)', location: 'A Blok', category: 'Malzeme', urgent: true, done: false, note: 'Saat 14:00 pompası', time: '08:45', createdAt: base - 20000 },
    { id: 't-3', title: 'İskele korkuluk eksiklerini tamamlat', location: 'Saha', category: 'İSG', urgent: true, done: false, note: '', time: '09:00', createdAt: base - 30000 },
    { id: 't-4', title: 'Bodrum elektrik tava montaj kontrolü', location: 'B Blok', category: 'Taşeron', urgent: false, done: false, note: 'Serkan usta ile bakılacak', time: '09:20', createdAt: base - 40000 },
    { id: 't-5', title: '12\'lik nervürlü demir irsaliye teslimi', location: 'Saha', category: 'Malzeme', urgent: false, done: false, note: '', time: '09:50', createdAt: base - 50000 },
    { id: 't-6', title: 'Çatı su yalıtım membran ek yerleri testi', location: 'Çatı', category: 'Kontrol', urgent: false, done: false, note: '', time: '10:15', createdAt: base - 60000 },
    { id: 't-7', title: 'Kalıpçı taşeron hakediş metraj onayı', location: 'Ofis', category: 'Ofis', urgent: false, done: false, note: '', time: '11:00', createdAt: base - 70000 },
    { id: 't-8', title: 'Zemin kat duvar örme şakul kontrolü', location: 'A Blok', category: 'İmalat', urgent: false, done: false, note: '', time: '11:30', createdAt: base - 80000 },
    { id: 't-9', title: 'Asansör kuyusu aydınlatma hattı çekimi', location: 'B Blok', category: 'İSG', urgent: false, done: false, note: '', time: '13:15', createdAt: base - 90000 },
    { id: 't-10', title: 'Sabah saha ekip puantaj kontrolü', location: 'Ofis', category: 'Ofis', urgent: false, done: true, note: '', time: '08:00', createdAt: base - 100000 },
    { id: 't-11', title: 'Jeneratör mazot ikmali kontrolü', location: 'Saha', category: 'Malzeme', urgent: false, done: true, note: '', time: '08:15', createdAt: base - 110000 }
  ];
  saveState();
}

function getTimeStr() {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

// ==========================================================================
// Üst Butonlar
// ==========================================================================
function setupTopActions() {
  if (DOM.toggleFrameBtn) {
    DOM.toggleFrameBtn.addEventListener('click', () => {
      state.fullscreenDesktop = !state.fullscreenDesktop;
      DOM.iphoneWrapper.classList.toggle('fullscreen-mode', state.fullscreenDesktop);
      saveState();
    });
  }

  DOM.themeToggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    DOM.html.setAttribute('data-theme', state.theme);
    saveState();
    showToast(state.theme === 'light' ? '☀️ Açık Tema' : '🌙 Koyu Tema');
  });

  DOM.clearDoneBtn.addEventListener('click', () => {
    const doneCount = state.tasks.filter(t => t.done).length;
    if (doneCount === 0) {
      showToast('Tamamlanmış iş yok');
      return;
    }
    if (confirm(`Tamamlanan ${doneCount} işi listeden kaldırmak istiyor musunuz?`)) {
      state.tasks = state.tasks.filter(t => !t.done);
      saveState();
      renderAll();
      showToast('Tamamlananlar temizlendi');
    }
  });

  DOM.exportWhatsappBtn.addEventListener('click', () => {
    const pending = state.tasks.filter(t => !t.done);
    const done = state.tasks.filter(t => t.done);
    let text = `👷 *ŞANTİYE İŞ LİSTESİ (${DOM.currentDateText.textContent})*\n\n`;
    if (pending.length) {
      text += `*YAPILACAKLAR (${pending.length}):*\n`;
      pending.forEach((t, i) => {
        const rightInfo = [t.location, t.category].filter(Boolean).join('/');
        const tag = rightInfo ? ` [${rightInfo}]` : '';
        const urg = t.urgent ? '❗' : '';
        text += `${i + 1}. ${urg}${t.title}${tag}\n`;
      });
    }
    if (done.length) {
      text += `\n*BİTENLER (${done.length}):*\n`;
      done.forEach((t, i) => {
        text += `✓ ${t.title}\n`;
      });
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast('📋 WhatsApp için kopyalandı'));
    } else {
      prompt('Kopyalayın:', text);
    }
  });
}

// ==========================================================================
// Filtreler
// ==========================================================================
function setupFilters() {
  DOM.filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      DOM.filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeStatusFilter = chip.getAttribute('data-filter');
      renderList();
    });
  });

  DOM.catFilterSelect.addEventListener('change', (e) => {
    state.activeCatFilter = e.target.value;
    renderList();
  });
}

// ==========================================================================
// Hızlı Görev Ekleme (Tek Satır Alt Bar)
// ==========================================================================
function setupQuickAdd() {
  DOM.quickUrgentBtn.addEventListener('click', () => {
    state.quickUrgent = !state.quickUrgent;
    DOM.quickUrgentBtn.classList.toggle('active', state.quickUrgent);
  });

  DOM.quickAddForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawTitle = DOM.quickTaskInput.value.trim();
    if (!rawTitle) {
      DOM.quickTaskInput.focus();
      return;
    }

    const selectedTag = DOM.quickTagSelect.value;
    const mahals = ['A Blok', 'B Blok', 'Bodrum', 'Çatı', 'Saha'];
    let loc = '';
    let cat = '';

    if (mahals.includes(selectedTag)) {
      loc = selectedTag;
    } else if (selectedTag) {
      cat = selectedTag;
    }

    const newTask = {
      id: 't-' + Date.now(),
      title: rawTitle,
      location: loc,
      category: cat,
      urgent: state.quickUrgent,
      done: false,
      note: '',
      time: getTimeStr(),
      createdAt: Date.now()
    };

    state.tasks.unshift(newTask);
    DOM.quickTaskInput.value = '';
    state.quickUrgent = false;
    DOM.quickUrgentBtn.classList.remove('active');

    saveState();
    renderAll();
    DOM.taskFeed.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==========================================================================
// Sesle Yazdırma
// ==========================================================================
function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    DOM.voiceDictateBtn.addEventListener('click', () => {
      DOM.quickTaskInput.focus();
      showToast('Klavye mikrofonunu kullanabilirsiniz');
    });
    return;
  }

  const rec = new SpeechRecognition();
  rec.lang = 'tr-TR';
  rec.interimResults = false;

  let listening = false;
  DOM.voiceDictateBtn.addEventListener('click', () => {
    if (listening) {
      rec.stop();
      return;
    }
    try {
      rec.start();
      listening = true;
      DOM.voiceDictateBtn.classList.add('listening');
      showToast('🎙️ Konuşun...');
    } catch (_) {}
  });

  rec.onresult = (e) => {
    const txt = e.results[0][0].transcript;
    if (txt) {
      DOM.quickTaskInput.value = (DOM.quickTaskInput.value + ' ' + txt).trim();
      DOM.quickTaskInput.focus();
    }
  };
  rec.onend = () => {
    listening = false;
    DOM.voiceDictateBtn.classList.remove('listening');
  };
  rec.onerror = () => {
    listening = false;
    DOM.voiceDictateBtn.classList.remove('listening');
  };
}

// ==========================================================================
// Render: Sol = İş Başlığı | Sağ = Detay Etiketleri (Mahal, Konu, Saat)
// ==========================================================================
function renderAll() {
  const total = state.tasks.length;
  const pending = state.tasks.filter(t => !t.done).length;
  DOM.statCounter.textContent = `${pending} Bekleyen`;
  renderList();
  lucide.createIcons();
}

function renderList() {
  let list = state.tasks.filter(t => {
    if (state.activeStatusFilter === 'pending' && t.done) return false;
    if (state.activeStatusFilter === 'urgent' && (!t.urgent || t.done)) return false;
    if (state.activeStatusFilter === 'done' && !t.done) return false;
    if (state.activeCatFilter !== 'all' && t.category !== state.activeCatFilter && t.location !== state.activeCatFilter) return false;
    return true;
  });

  // Sıralama: Tamamlanmamışlar üstte (Aciller en üstte), tamamlananlar altta
  list.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
    return b.createdAt - a.createdAt;
  });

  if (list.length === 0) {
    DOM.taskFeed.innerHTML = `<div class="empty-state-compact">Kayıtlı iş yok. Alttan hemen yazabilirsiniz.</div>`;
    return;
  }

  DOM.taskFeed.innerHTML = '';
  list.forEach(task => {
    const row = document.createElement('div');
    row.className = `task-row ${task.urgent && !task.done ? 'urgent-row' : ''} ${task.done ? 'done-row' : ''}`;

    // Sağ taraftaki kompakt detay etiketleri
    const locHTML = task.location ? `<span class="r-badge r-loc">${escapeHTML(task.location)}</span>` : '';
    const catHTML = task.category ? `<span class="r-badge r-cat">${escapeHTML(task.category)}</span>` : '';
    const timeHTML = task.time ? `<span class="r-time">${task.time}</span>` : '';
    const subnoteHTML = task.note ? `<span class="row-subnote">${escapeHTML(task.note)}</span>` : '';

    row.innerHTML = `
      <button type="button" class="row-check" data-check="${task.id}" aria-label="Tamamla">
        <i data-lucide="check"></i>
      </button>
      <div class="row-main" data-edit="${task.id}">
        <span class="row-title">${escapeHTML(task.title)}</span>
        ${subnoteHTML}
      </div>
      <div class="row-right" data-edit="${task.id}">
        ${locHTML}
        ${catHTML}
        ${timeHTML}
      </div>
    `;

    row.querySelector('[data-check]').addEventListener('click', (e) => {
      e.stopPropagation();
      task.done = !task.done;
      saveState();
      renderAll();
    });

    row.querySelectorAll('[data-edit]').forEach(el => {
      el.addEventListener('click', () => openEditSheet(task.id));
    });

    DOM.taskFeed.appendChild(row);
  });

  lucide.createIcons();
}

// ==========================================================================
// Düzenleme Çekmecesi
// ==========================================================================
function setupEditSheet() {
  DOM.closeSheetBtn.addEventListener('click', closeSheet);
  DOM.editSheetOverlay.addEventListener('click', (e) => {
    if (e.target === DOM.editSheetOverlay) closeSheet();
  });

  DOM.editTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const task = state.tasks.find(t => t.id === DOM.editTaskId.value);
    if (task) {
      task.title = DOM.editTaskTitle.value.trim();
      task.location = DOM.editTaskLoc.value.trim();
      task.category = DOM.editTaskCat.value;
      task.note = DOM.editTaskNote.value.trim();
      task.urgent = DOM.editTaskUrgent.checked;
      saveState();
      renderAll();
      closeSheet();
    }
  });

  DOM.deleteTaskBtn.addEventListener('click', () => {
    const id = DOM.editTaskId.value;
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState();
    renderAll();
    closeSheet();
    showToast('Silindi');
  });
}

function openEditSheet(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  DOM.editTaskId.value = task.id;
  DOM.editTaskTitle.value = task.title;
  DOM.editTaskLoc.value = task.location || '';
  DOM.editTaskCat.value = task.category || '';
  DOM.editTaskNote.value = task.note || '';
  DOM.editTaskUrgent.checked = !!task.urgent;
  DOM.editSheetOverlay.classList.add('active');
}

function closeSheet() {
  DOM.editSheetOverlay.classList.remove('active');
}

let toastTimer = null;
function showToast(msg) {
  if (toastTimer) clearTimeout(toastTimer);
  DOM.toastText.textContent = msg;
  DOM.toastBanner.classList.add('show');
  toastTimer = setTimeout(() => DOM.toastBanner.classList.remove('show'), 2000);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}
