/* ══════════════════════════════════════════
   DR. DETAIL 805 — APP LOGIC
   - Single-page navigation
   - Theme toggle (dark/light)
   - SMS inquiry form with US phone validation
══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── NAVIGATION ──────────────────────────
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link[data-page]');
  const mobLinks = document.querySelectorAll('.mob-link[data-page]');
  const CAL_ID = '...';
  const CAL_API_KEY = '...';
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxnmWit2Kf6x2akuLyZRwZHDSAt69XbgJdydjbvI4kZzEXOEJ7xse24cALPbgOZqxmm1g/exec'; 

  function showPage(pageId) {
    pages.forEach(p => p.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));
    mobLinks.forEach(l => l.classList.remove('active'));

    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');

    navLinks.forEach(l => {
      if (l.dataset.page === pageId) l.classList.add('active');
    });
    mobLinks.forEach(l => {
      if (l.dataset.page === pageId) l.classList.add('active');
    });

    // --- FIX CALENDAR RENDERING ---
    if (pageId === 'book' && window.calendarInstance) {
      setTimeout(() => {
        window.calendarInstance.updateSize();
      }, 50);
    }

    // Scroll to top of content on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Attach click handlers to all nav links (sidebar + mobile)
  [...navLinks, ...mobLinks].forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });

  // Handle in-page CTA links (Book Now buttons with data-page)
  document.querySelectorAll('a[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });

  // Initialize home page active
  showPage('home');


  // ── THEME TOGGLE ──────────────────────────
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const mobileThemeToggle = document.getElementById('mobileThemeToggle');
  const themeIconWrap = document.getElementById('themeIcon');

  // Icons
  const sunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const moonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  // Load saved preference
  const savedTheme = localStorage.getItem('drdetail-theme') || 'dark';
  applyTheme(savedTheme);

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('drdetail-theme', theme);

    if (theme === 'dark') {
      if (themeIconWrap) themeIconWrap.innerHTML = sunIcon;
      // Update label
      const label = themeToggle && themeToggle.querySelector('.nav-label');
      if (label) label.textContent = 'Light Mode';
    } else {
      if (themeIconWrap) themeIconWrap.innerHTML = moonIcon;
      const label = themeToggle && themeToggle.querySelector('.nav-label');
      if (label) label.textContent = 'Dark Mode';
    }
  }

  function toggleTheme() {
    const current = htmlEl.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);


  // ── PHONE NUMBER FORMATTING & VALIDATION ──
  const clientPhoneInput = document.getElementById('clientPhone');

  function formatUSPhone(val) {
    // Strip everything except digits
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }

  function isValidUSPhone(val) {
    const digits = val.replace(/\D/g, '');
    return digits.length === 10;
  }

  if (clientPhoneInput) {
    clientPhoneInput.addEventListener('input', (e) => {
      const formatted = formatUSPhone(e.target.value);
      e.target.value = formatted;
      // Clear error while typing
      e.target.classList.remove('error');
      document.getElementById('phoneError').classList.remove('visible');
    });
  }


  // ── SMS INQUIRY FORM ──────────────────────
  const sendBtn = document.getElementById('sendInquiry');
  const DR_PHONE = '8056639182'; // no formatting for sms: link

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('clientName');
      const phoneInput = document.getElementById('clientPhone');
      const msgInput = document.getElementById('clientMessage');
      const phoneError = document.getElementById('phoneError');
      const msgError = document.getElementById('msgError');

      let valid = true;

      // Validate phone
      if (!phoneInput || !isValidUSPhone(phoneInput.value)) {
        phoneInput && phoneInput.classList.add('error');
        phoneError && phoneError.classList.add('visible');
        valid = false;
      }

      // Validate message
      if (!msgInput || msgInput.value.trim().length < 5) {
        msgInput && msgInput.classList.add('error');
        msgError && msgError.classList.add('visible');
        valid = false;
      }

      if (!valid) return;

      // Build SMS body
      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput.value.trim();
      const message = msgInput.value.trim();

      const smsBody = [
        `New inquiry via DrDetail805 website`,
        `---`,
        name ? `Name: ${name}` : null,
        `Phone: ${phone}`,
        `---`,
        `Message: ${message}`
      ].filter(Boolean).join('\n');

      // Detect iOS vs Android for SMS separator
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const sep = isIOS ? '&' : '?';

      const smsUrl = `sms:${DR_PHONE}${sep}body=${encodeURIComponent(smsBody)}`;
      window.location.href = smsUrl;
    });
  }

  // Clear field errors on focus
  document.querySelectorAll('.form-group input, .form-group textarea').forEach(el => {
    el.addEventListener('focus', () => {
      el.classList.remove('error');
      const errId = el.id === 'clientPhone' ? 'phoneError' : el.id === 'clientMessage' ? 'msgError' : null;
      if (errId) {
        const errEl = document.getElementById(errId);
        if (errEl) errEl.classList.remove('visible');
      }
    });
  });
   
// ── CALENDAR & BOOKING LOGIC ────────────────
  const calendarEl = document.getElementById('calendar');
  const bookingForm = document.getElementById('booking-form');
  const slotTitle = document.getElementById('selected-slot-title');
  let selectedStartTime = null;

  if (calendarEl) {
    window.calendarInstance = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      events: APPS_SCRIPT_URL,
      eventClick: function(info) {
        info.jsEvent.preventDefault();
        const title = info.event.title.toUpperCase();
        
        if (title.includes('AVAILABLE') || title.includes('OPEN')) {
          selectedStartTime = info.event.startStr;
          slotTitle.innerText = "Selected: " + info.event.start.toLocaleDateString() + " @ " + info.event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          bookingForm.style.display = 'block';
          bookingForm.scrollIntoView({ behavior: 'smooth' });
        }
      },
      headerToolbar: { left: 'prev,next', center: 'title', right: 'listWeek,dayGridMonth' }
    });
    window.calendarInstance.render();
  }

  const confirmBtn = document.getElementById('confirmBooking');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      const name = document.getElementById('bookingName').value;
      const phone = document.getElementById('bookingPhone').value;
      const msg = document.getElementById('bookingMessage').value;
      const status = document.getElementById('formStatus');

      if (!isValidUSPhone(phone) || msg.trim().length < 5) {
        status.innerText = "❌ Please provide a valid phone and service description.";
        return;
      }

      status.innerText = "⏳ Sending to Doctor Detail...";

      try {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            startTime: selectedStartTime,
            description: `${name} - ${msg}`,
            phone: phone
          })
        });
        status.innerText = "✅ Request Sent! Check your phone for a confirmation text soon.";
      } catch (e) {
        status.innerText = "❌ Connection error. Please text us directly!";
      }
    });
  }
});
