// ========== Navigation ==========
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ========== Booking System ==========
const state = {
  step: 1,
  service: '',
  barber: '',
  date: '',
  time: '',
  name: '',
  phone: '',
  email: ''
};

// Step navigation
function showStep(n) {
  state.step = n;
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('bookingStep' + n);
  if (target) target.classList.add('active');

  // Update progress
  document.querySelectorAll('.progress-step').forEach(ps => {
    const s = parseInt(ps.dataset.step);
    ps.classList.remove('active', 'done');
    if (s === n) ps.classList.add('active');
    else if (s < n) ps.classList.add('done');
  });
}

// Service selection (radio buttons)
document.querySelectorAll('input[name="service"]').forEach(input => {
  input.addEventListener('change', () => {
    state.service = input.value;
    const nextBtn = document.querySelector('#bookingStep1 .booking-next');
    if (nextBtn) nextBtn.disabled = false;
  });
});

// Barber selection
document.querySelectorAll('input[name="barber"]').forEach(input => {
  input.addEventListener('change', () => {
    state.barber = input.value;
    const nextBtn = document.querySelector('#bookingStep2 .booking-next');
    if (nextBtn) nextBtn.disabled = false;
  });
});

// "Book This Service" buttons from service cards
document.querySelectorAll('.book-service-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const serviceName = btn.dataset.service;
    const price = btn.dataset.price;
    const value = serviceName + ' - $' + price;

    // Set the radio in booking form
    const radios = document.querySelectorAll('input[name="service"]');
    radios.forEach(r => {
      if (r.value === value) r.checked = true;
    });
    state.service = value;

    // Enable continue button
    const nextBtn = document.querySelector('#bookingStep1 .booking-next');
    if (nextBtn) nextBtn.disabled = false;

    // Scroll to booking
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  });
});

// Next/Back buttons
document.querySelectorAll('.booking-next').forEach(btn => {
  btn.addEventListener('click', () => {
    const next = parseInt(btn.dataset.next);

    // Validation for step 4
    if (next === 5) {
      const name = document.getElementById('custName').value.trim();
      const phone = document.getElementById('custPhone').value.trim();
      if (!name || !phone) {
        alert('Please enter your name and phone number.');
        return;
      }
      state.name = name;
      state.phone = phone;
      state.email = document.getElementById('custEmail').value.trim();
      renderSummary();
    }

    showStep(next);
  });
});

document.querySelectorAll('.booking-back').forEach(btn => {
  btn.addEventListener('click', () => {
    showStep(parseInt(btn.dataset.back));
  });
});

// ========== Date Picker ==========
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

function renderCalendar() {
  const grid = document.getElementById('dateGrid');
  const monthLabel = document.getElementById('dateMonth');
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  monthLabel.textContent = months[currentMonth] + ' ' + currentYear;

  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  let html = days.map(d => '<div class="date-cell day-header">' + d + '</div>').join('');

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    html += '<div class="date-cell empty"></div>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentYear, currentMonth, d);
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isSel = state.date === formatDate(date);
    const cls = isPast ? 'past' : 'available';
    const selCls = isSel ? ' selected' : '';
    html += '<div class="date-cell ' + cls + selCls + '" data-date="' + formatDate(date) + '">' + d + '</div>';
  }

  grid.innerHTML = html;

  // Date click handlers
  grid.querySelectorAll('.date-cell.available').forEach(cell => {
    cell.addEventListener('click', () => {
      grid.querySelectorAll('.date-cell').forEach(c => c.classList.remove('selected'));
      cell.classList.add('selected');
      state.date = cell.dataset.date;
      renderTimeSlots();
    });
  });
}

function formatDate(date) {
  return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
}

document.getElementById('datePrev').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
});
document.getElementById('dateNext').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
});

renderCalendar();

function renderTimeSlots() {
  const container = document.getElementById('timePicker');
  const slotsDiv = document.getElementById('timeSlots');
  container.style.display = 'block';

  // Generate demo time slots
  const slots = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM'];

  // Randomly disable a few slots for realism
  const disabled = new Set();
  for (let i = 0; i < 5; i++) {
    disabled.add(slots[Math.floor(Math.random() * slots.length)]);
  }

  let html = '';
  slots.forEach(slot => {
    if (disabled.has(slot)) return;
    const sel = state.time === slot ? ' selected' : '';
    html += '<div class="time-slot' + sel + '" data-time="' + slot + '">' + slot + '</div>';
  });
  slotsDiv.innerHTML = html;

  slotsDiv.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      slotsDiv.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      state.time = slot.dataset.time;
      const nextBtn = document.querySelector('#bookingStep3 .booking-next');
      if (nextBtn) nextBtn.disabled = false;
    });
  });
}

// ========== Booking Summary ==========
function renderSummary() {
  const summary = document.getElementById('bookingSummary');
  summary.innerHTML = [
    row('Service', state.service),
    row('Barber', state.barber),
    row('Date', state.date),
    row('Time', state.time),
    row('Name', state.name),
    row('Phone', state.phone),
    state.email ? row('Email', state.email) : ''
  ].join('');
}

function row(label, value) {
  return '<div class="summary-row"><span class="label">' + label + '</span><span class="value">' + value + '</span></div>';
}

// ========== Confirm Booking ==========
document.getElementById('confirmBooking').addEventListener('click', () => {
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  document.getElementById('bookingSuccess').style.display = 'block';

  // Update progress to all done
  document.querySelectorAll('.progress-step').forEach(ps => ps.classList.add('done'));
});

document.getElementById('bookAnother').addEventListener('click', () => {
  // Reset
  document.getElementById('bookingSuccess').style.display = 'none';
  state.service = '';
  state.barber = '';
  state.date = '';
  state.time = '';
  state.name = '';
  state.phone = '';
  state.email = '';

  document.querySelectorAll('input[name="service"]').forEach(r => r.checked = false);
  document.querySelectorAll('input[name="barber"]').forEach(r => r.checked = false);
  document.getElementById('custName').value = '';
  document.getElementById('custPhone').value = '';
  document.getElementById('custEmail').value = '';
  document.getElementById('timePicker').style.display = 'none';

  document.querySelectorAll('.booking-next').forEach(btn => btn.disabled = true);
  showStep(1);
});

// ========== Contact Form ==========
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Message sent! (Demo — no message was actually sent.)');
  e.target.reset();
});

// ========== Smooth scroll for anchor links ==========
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      // Close mobile nav if open
      navLinks.classList.remove('open');
    }
  });
});
