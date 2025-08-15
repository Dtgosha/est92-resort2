// Est92 Resort - Client-side logic (bookings, admin)
(() => {
  // Pricing map
  const pricing = {
    'T': 10,
    'S': 30,
    'E': 35,
    'V': 40
  };

  // Room lists
  const rooms = {
    'T': ['T1','T2','T3','T4'],
    'S': ['S1','S2','S3','S4','S5'],
    'E': ['E1','E2','E3'],
    'V': ['V1','V2','V3','V4']
  };

  // Admin users
  const admins = [
    { username: 'Denzel', password: '12345' },
    { username: 'Dellon Gosha', password: '12345' },
    { username: 'Charles Gosha', password: '12345' }
  ];

  // Utility: read URL param
  function getParam(name) {
    const u = new URLSearchParams(window.location.search);
    return u.get(name);
  }

  // Booking page init
  function initBookingPage() {
    const bookingType = document.getElementById('bookingType');
    const roomSelection = document.getElementById('roomSelection');
    const roomId = document.getElementById('roomId');
    const checkin = document.getElementById('checkin');
    const checkout = document.getElementById('checkout');
    const guests = document.getElementById('guests');
    const totalCost = document.getElementById('totalCost');
    const form = document.getElementById('bookingForm');
    const message = document.getElementById('message');

    // Null checks
    if (!bookingType || !roomSelection || !roomId || !checkin || !checkout || !guests || !totalCost || !form || !message) return;

    // populate room options default to T series
    function populateRooms(series) {
      roomId.innerHTML = '';
      if(!rooms[series]) return;
      rooms[series].forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        roomId.appendChild(opt);
      });
    }

    // detect query params for prefilling
    const qtype = getParam('type');
    const qT = getParam('Troom');
    const qS = getParam('Sroom');
    const qE = getParam('Eroom');
    const qV = getParam('Vroom');
    const service = getParam('service');

    if (service === 'restaurant') {
      bookingType.value = 'restaurant';
      roomSelection.style.display = 'none';
    } else if (service === 'conference') {
      bookingType.value = 'conference';
      roomSelection.style.display = 'none';
    } else {
      bookingType.value = 'room';
      roomSelection.style.display = 'block';
      if (qT) { populateRooms('T'); roomId.value = qT; }
      else if (qS) { populateRooms('S'); roomId.value = qS; }
      else if (qV) { populateRooms('V'); roomId.value = qV; }
      else if (qE) { populateRooms('E'); roomId.value = qE; }
      else if (qV) { populateRooms('V'); roomId.value = qV; }
      else if (qtype) { populateRooms(qtype); }
      else populateRooms('T');
    }

    // if booking type changes
    bookingType.addEventListener('change', () => {
      if (bookingType.value === 'room') {
        roomSelection.style.display = 'block';
        populateRooms('T');
      } else {
        roomSelection.style.display = 'none';
      }
      calculateCost();
    });

    // when room changes, update calculation base
    roomId.addEventListener('change', calculateCost);
    guests.addEventListener('change', calculateCost);
    checkin.addEventListener('change', calculateCost);
    checkout.addEventListener('change', calculateCost);

    function parseDate(v) {
      if(!v) return null;
      return new Date(v + 'T00:00:00');
    }

    function dateDiffDays(a,b) {
      if(!a||!b) return 0;
      const diff = (b - a) / (1000*60*60*24);
      return Math.max(1, Math.round(diff));
    }

    function calculateCost() {
      const type = bookingType.value;
      let cost = 0;
      if (type === 'room') {
        const r = roomId.value || '';
        const series = r.slice(0,1); // T/S/E/V
        const per = pricing[series] || 0;
        const ci = parseDate(checkin.value);
        const co = parseDate(checkout.value);
        const days = dateDiffDays(ci, co);
        const g = parseInt(guests.value) || 1;
        cost = per * g * days;
      } else if (type === 'conference') {
        const days = Math.max(1, dateDiffDays(parseDate(checkin.value), parseDate(checkout.value)));
        cost = 100 * days;
      } else if (type === 'restaurant') {
        const g = parseInt(guests.value) || 1;
        cost = 5 * g;
      }
      totalCost.textContent = '$' + cost.toFixed(2);
      return cost;
    }

    // form validation and submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      message.textContent = '';
      const fullnameEl = document.getElementById('fullname');
      const phoneEl = document.getElementById('phone');
      const emailEl = document.getElementById('email');
      if (!fullnameEl || !phoneEl || !emailEl) {
        message.textContent = 'Missing required fields.';
        message.style.background='#ffdede';
        return;
      }
      const data = {
        id: 'bk_' + Date.now(),
        type: bookingType.value,
        room: bookingType.value === 'room' ? roomId.value : bookingType.value,
        checkin: checkin.value,
        checkout: checkout.value,
        guests: guests.value,
        fullname: fullnameEl.value.trim(),
        phone: phoneEl.value.trim(),
        email: emailEl.value.trim(),
        total: calculateCost(),
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      // basic validation
      if(!data.fullname || !data.phone || !data.email) {
        message.textContent = 'Please complete all required fields.';
        message.style.background='#ffdede';
        return;
      }
      if (data.type === 'room' && (!data.checkin || !data.checkout)) {
        message.textContent = 'Please select check-in and check-out dates.';
        message.style.background='#ffdede';
        return;
      }
      // save to localStorage
      let all = [];
      try {
        all = JSON.parse(localStorage.getItem('est92_bookings') || '[]');
        if (!Array.isArray(all)) all = [];
      } catch {
        all = [];
      }
      all.push(data);
      localStorage.setItem('est92_bookings', JSON.stringify(all));

      // show confirmation message
      message.textContent = 'Thank you — your booking is confirmed! A confirmation email will be sent.';
      message.style.background='#e6ffee';
      form.reset();
      calculateCost();

      // send email via EmailJS (requires config)
      try {
        if(window.emailjs) {
          const payload = {
            to_email: 'dtgosha11@gmail.com',
            to_name: 'Est92 Owner',
            booking_id: data.id,
            booking_type: data.type,
            room: data.room,
            checkin: data.checkin,
            checkout: data.checkout,
            guests: data.guests,
            fullname: data.fullname,
            phone: data.phone,
            email: data.email,
            total: data.total
          };
          emailjs.send('YOUR_SERVICE_ID','YOUR_TEMPLATE_ID', payload)
            .then(function() { console.log('Email sent'); }, function(err){ console.error('Email error', err); });
        }
      } catch(err) { console.error(err); }
    });

    // initial calc
    calculateCost();
  }

  // Admin login page init
  function initAdminPage() {
    const form = document.getElementById('adminLoginForm');
    const msg = document.getElementById('adminMsg');
    if (!form || !msg) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const userEl = document.getElementById('adminUser');
      const passEl = document.getElementById('adminPass');
      if (!userEl || !passEl) {
        msg.textContent = 'Missing login fields.';
        msg.style.background = '#ffdede';
        return;
      }
      const user = userEl.value.trim();
      const pass = passEl.value;
      const ok = admins.find(a => a.username === user && a.password === pass);
      if (ok) {
        sessionStorage.setItem('est92_admin', JSON.stringify(ok));
        location.href = 'dashboard.html';
      } else {
        msg.textContent = 'Invalid credentials';
        msg.style.background = '#ffdede';
      }
    });
  }

  // Dashboard init
  function initDashboard() {
    const wrap = document.getElementById('bookingsTableWrap');
    const filter = document.getElementById('filterType');
    const logoutBtn = document.getElementById('logoutBtn');
    if (!wrap || !filter || !logoutBtn) return;
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('est92_admin');
      location.href = 'admin.html';
    });

    function render() {
      let all = [];
      try {
        all = JSON.parse(localStorage.getItem('est92_bookings') || '[]');
        if (!Array.isArray(all)) all = [];
      } catch {
        all = [];
      }
      const f = filter.value;
      const filtered = all.filter(b => f === 'all' ? true : b.type === f);
      if (filtered.length === 0) {
        wrap.innerHTML = '<p>No bookings found.</p>';
        return;
      }
      let html = '<table><thead><tr><th>ID</th><th>Type</th><th>Room/Service</th><th>Guest</th><th>Dates</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
      filtered.forEach(b => {
        html += `<tr data-id="${b.id}"><td>${b.id}</td><td>${b.type}</td><td>${b.room}</td><td>${b.fullname} (${b.phone})</td><td>${b.checkin||'-'} → ${b.checkout||'-'}</td><td>$${(typeof b.total === 'number' ? b.total.toFixed(2) : b.total)}</td><td>${b.status}</td><td><button class="mark-paid">Mark Paid</button> <button class="delete">Delete</button></td></tr>`;
      });
      html += '</tbody></table>';
      wrap.innerHTML = html;

      // attach actions
      wrap.querySelectorAll('.mark-paid').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.closest('tr').dataset.id;
          let all = [];
          try {
            all = JSON.parse(localStorage.getItem('est92_bookings') || '[]');
            if (!Array.isArray(all)) all = [];
          } catch {
            all = [];
          }
          const idx = all.findIndex(x => x.id === id);
          if (idx >= 0) {
            all[idx].status = 'Paid';
            localStorage.setItem('est92_bookings', JSON.stringify(all));
            render();
          }
        });
      });
      wrap.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if(!confirm('Delete this booking?')) return;
          const id = e.target.closest('tr').dataset.id;
          let all = [];
          try {
            all = JSON.parse(localStorage.getItem('est92_bookings') || '[]');
            if (!Array.isArray(all)) all = [];
          } catch {
            all = [];
          }
          all = all.filter(x => x.id !== id);
          localStorage.setItem('est92_bookings', JSON.stringify(all));
          render();
        });
      });
    }

    filter.addEventListener('change', render);
    render();
  }

  // Auto-run appropriate init based on page content
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('bookingForm')) initBookingPage();
    else if (document.getElementById('adminLoginForm')) initAdminPage();
    else if (document.getElementById('bookingsTableWrap')) initDashboard();
  });

})();