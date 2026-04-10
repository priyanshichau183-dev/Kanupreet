const API = 'http://localhost:3000/api';

// ── Auth state ──────────────────────────────────────────────
let currentUser = JSON.parse(localStorage.getItem('kanu_user') || 'null');
let token = localStorage.getItem('kanu_token') || null;

function updateAuthUI() {
    const btn = document.getElementById('authBtn');
    if (!btn) return;
    if (currentUser) {
        btn.textContent = `Hi, ${currentUser.name.split(' ')[0]}`;
        btn.onclick = logout;
    } else {
        btn.textContent = 'Sign Up';
        btn.onclick = () => openModal('signupModal');
    }
}

function logout() {
    currentUser = null; token = null;
    localStorage.removeItem('kanu_user');
    localStorage.removeItem('kanu_token');
    updateAuthUI();
    showToast('Logged out. See you soon!', 'info');
}

// ── Toast ────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${type} show`;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = 'toast'; }, 4000);
}

// ── Modal ────────────────────────────────────────────────────
function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
}

window.addEventListener('click', e => {
    ['bookingModal', 'signupModal'].forEach(id => {
        const el = document.getElementById(id);
        if (e.target === el) closeModal(id);
    });
});

// ── Theme ────────────────────────────────────────────────────
const themes = ['light', 'dark', 'ocean', 'forest', 'sunset'];
let currentThemeIndex = 0;

function toggleTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('kanu_theme', newTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeBtn = document.querySelector('.theme-toggle');
    const sunIcon = themeBtn.querySelector('.sun-icon');
    const moonIcon = themeBtn.querySelector('.moon-icon');
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    sunIcon.style.display = currentTheme === 'light' ? 'block' : 'none';
    moonIcon.style.display = currentTheme === 'dark' ? 'block' : 'none';
    
    // For other themes, show a palette icon
    if (!['light', 'dark'].includes(currentTheme)) {
        sunIcon.style.display = 'none';
        moonIcon.textContent = '🎨';
        moonIcon.style.display = 'block';
    } else {
        moonIcon.textContent = '🌙';
    }
}

(function initTheme() {
    const saved = localStorage.getItem('kanu_theme') || 'light';
    currentThemeIndex = themes.indexOf(saved) !== -1 ? themes.indexOf(saved) : 0;
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon();
})();

// ── Navbar scroll ────────────────────────────────────────────
window.addEventListener('scroll', () => {
    document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// ── Smooth scroll ────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ── Scroll reveal ────────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .gallery-item, .schedule-item, .location-card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});

// ── Particle canvas ──────────────────────────────────────────
(function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * 1920, y: Math.random() * 1080,
            r: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            a: Math.random() * 0.6 + 0.2
        });
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        let particleColor;
        
        switch(currentTheme) {
            case 'ocean': particleColor = 'rgba(6,182,212,'; break;
            case 'forest': particleColor = 'rgba(34,197,94,'; break;
            case 'sunset': particleColor = 'rgba(249,115,22,'; break;
            case 'dark': particleColor = 'rgba(102,126,234,'; break;
            default: particleColor = 'rgba(102,126,234,';
        }
        
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = particleColor + p.a + ')';
            ctx.fill();
        });
        // draw lines between close particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = particleColor + (0.15 * (1 - dist / 120)) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

// ── Booking: load available slots ────────────────────────────
async function loadSlots(date) {
    const container = document.getElementById('slotsContainer');
    const grid = document.getElementById('slotsGrid');
    const hiddenInput = document.getElementById('selectedTime');
    hiddenInput.value = '';
    grid.innerHTML = '<span style="color:var(--text-secondary);font-size:0.9rem">Loading...</span>';
    container.style.display = 'block';

    const allSlots = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
    const labels = { '09:00':'9 AM','10:00':'10 AM','11:00':'11 AM','12:00':'12 PM','13:00':'1 PM','14:00':'2 PM','15:00':'3 PM','16:00':'4 PM','17:00':'5 PM','18:00':'6 PM','19:00':'7 PM' };

    let booked = [];
    try {
        const res = await fetch(`${API}/bookings/slots?date=${date}`);
        const data = await res.json();
        booked = data.bookedSlots || [];
    } catch (_) { /* server might be offline */ }

    grid.innerHTML = '';
    allSlots.forEach(slot => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = labels[slot];
        btn.className = 'slot-btn' + (booked.includes(slot) ? ' booked' : '');
        if (!booked.includes(slot)) {
            btn.onclick = () => {
                document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                hiddenInput.value = slot;
            };
        }
        grid.appendChild(btn);
    });
}

// ── Booking form ─────────────────────────────────────────────
async function handleBooking(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');

    if (!form.time.value) { showToast('Please select a time slot.', 'error'); return; }

    const payload = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        service: form.service.value,
        date: form.date.value,
        time: form.time.value
    };

    btn.textContent = 'Booking...'; btn.disabled = true;

    try {
        const res = await fetch(`${API}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Booking failed');
        showToast('Appointment confirmed! See you soon.', 'success');
        form.reset();
        document.getElementById('slotsContainer').style.display = 'none';
        closeModal('bookingModal');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.textContent = 'Confirm Booking'; btn.disabled = false;
    }
}

// ── Contact form ─────────────────────────────────────────────
async function handleQuery(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');

    const payload = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        message: form.message.value
    };

    btn.textContent = 'Sending...'; btn.disabled = true;

    try {
        const res = await fetch(`${API}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send');
        showToast("Message sent! We'll get back to you soon.", 'success');
        form.reset();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.textContent = 'Send Message'; btn.disabled = false;
    }
}

// ── Signup ───────────────────────────────────────────────────
async function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');

    if (form.password.value !== form.confirm.value) {
        showToast("Passwords don't match.", 'error'); return;
    }

    btn.textContent = 'Creating account...'; btn.disabled = true;

    try {
        const res = await fetch(`${API}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: form.name.value, email: form.email.value, phone: form.phone.value, password: form.password.value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        currentUser = data.user; token = data.token;
        localStorage.setItem('kanu_user', JSON.stringify(currentUser));
        localStorage.setItem('kanu_token', token);
        updateAuthUI();
        showToast(`Welcome, ${currentUser.name.split(' ')[0]}!`, 'success');
        form.reset();
        closeModal('signupModal');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.textContent = 'Sign Up'; btn.disabled = false;
    }
}

// ── Login ────────────────────────────────────────────────────
async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Logging in...'; btn.disabled = true;

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email.value, password: form.password.value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        currentUser = data.user; token = data.token;
        localStorage.setItem('kanu_user', JSON.stringify(currentUser));
        localStorage.setItem('kanu_token', token);
        updateAuthUI();
        showToast(`Welcome back, ${currentUser.name.split(' ')[0]}!`, 'success');
        form.reset();
        closeModal('signupModal');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.textContent = 'Login'; btn.disabled = false;
    }
}

// ── Auth modal switch ────────────────────────────────────────
function switchToLogin() {
    document.getElementById('signupView').style.display = 'none';
    document.getElementById('loginView').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Welcome Back';
}

function switchToSignup() {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('signupView').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Create Account';
}

// ── Set min date on booking ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
    updateAuthUI();
});
