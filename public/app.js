// MoneyMap Frontend

// ===== State =====
const state = {
  authenticated: false,
  categories: [],
  businesses: [],
  paymentMethods: [],
  expenses: [],
  recurring: [],
  summary: {},
  currentView: 'dashboard',
  expenseFilters: {},
  expenseSort: { col: 'date', order: 'desc' },
  editingExpense: null,
  editingRecurring: null,
  theme: localStorage.getItem('moneymap-theme') || 'dark',
  chartInstance: null,
  searchTimeout: null,
  pagination: { page: 1, pageSize: 50, total: 0 },
  budgetGoals: [],
};

// ===== API =====
const api = {
  async get(url) {
    const res = await fetch(url);
    if (res.status === 401) { showLoginScreen(); throw new Error('Not authenticated'); }
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  },
  async post(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 401) { showLoginScreen(); throw new Error('Not authenticated'); }
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  },
  async put(url, body) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 401) { showLoginScreen(); throw new Error('Not authenticated'); }
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  },
  async del(url) {
    const res = await fetch(url, { method: 'DELETE' });
    if (res.status === 401) { showLoginScreen(); throw new Error('Not authenticated'); }
    if (!res.ok && res.status !== 204) throw new Error('Delete failed');
  },

  getCategories: () => api.get('/api/categories'),
  getBusinesses: () => api.get('/api/businesses'),
  getPaymentMethods: () => api.get('/api/payment-methods'),

  getExpenses(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.business) params.set('business', filters.business);
    if (filters.who) params.set('who', filters.who);
    if (filters.payment_method) params.set('payment_method', filters.payment_method);
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.order) params.set('order', filters.order);
    if (filters.limit) params.set('limit', filters.limit);
    if (filters.offset !== undefined) params.set('offset', filters.offset);
    const qs = params.toString();
    return api.get('/api/expenses' + (qs ? '?' + qs : ''));
  },
  createExpense: (data) => api.post('/api/expenses', data),
  updateExpense: (id, data) => api.put(`/api/expenses/${id}`, data),
  deleteExpense: (id) => api.del(`/api/expenses/${id}`),

  getRecurring: () => api.get('/api/recurring'),
  createRecurring: (data) => api.post('/api/recurring', data),
  updateRecurring: (id, data) => api.put(`/api/recurring/${id}`, data),
  deleteRecurring: (id) => api.del(`/api/recurring/${id}`),

  getBudgetGoals: () => api.get('/api/budget-goals'),
  createBudgetGoal: (data) => api.post('/api/budget-goals', data),
  updateBudgetGoal: (id, data) => api.put(`/api/budget-goals/${id}`, data),
  deleteBudgetGoal: (id) => api.del(`/api/budget-goals/${id}`),

  getSummary: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (year) params.set('year', year);
    const qs = params.toString();
    return api.get('/api/summary' + (qs ? '?' + qs : ''));
  },
};

// ===== Utilities =====
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getCategoryBadgeClass(name) {
  if (!name) return 'badge-custom';
  const lower = name.toLowerCase();
  if (lower === 'business') return 'badge-business';
  if (lower === 'wedding') return 'badge-wedding';
  if (lower === 'personal') return 'badge-personal';
  return 'badge-custom';
}

function getCategoryDotClass(name) {
  if (!name) return 'dot-custom';
  const lower = name.toLowerCase();
  if (lower === 'business') return 'dot-business';
  if (lower === 'wedding') return 'dot-wedding';
  if (lower === 'personal') return 'dot-personal';
  return 'dot-custom';
}

function lookupName(list, id) {
  const item = list.find(i => i.id === id);
  return item ? item.name : '—';
}

function showLoading(container) {
  container.innerHTML = '<div class="loading-spinner"></div>';
}

function showError(container, msg) {
  container.innerHTML = `<div class="error-message">${msg}</div>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ===== Auth =====
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/status');
    const data = await res.json();
    return data.authenticated;
  } catch {
    return false;
  }
}

function showLoginScreen() {
  state.authenticated = false;
  document.getElementById('login-screen').classList.remove('hidden');
  document.querySelector('.app-layout').style.display = 'none';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').style.display = 'none';
}

function hideLoginScreen() {
  state.authenticated = true;
  document.getElementById('login-screen').classList.add('hidden');
  document.querySelector('.app-layout').style.display = '';
}

async function handleLogin(e) {
  e.preventDefault();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  const btnText = document.querySelector('.login-btn-text');
  const spinner = document.querySelector('.btn-spinner');
  const btn = document.getElementById('login-btn');

  errorEl.style.display = 'none';
  btn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = '';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      errorEl.textContent = data.error || 'Login failed';
      errorEl.style.display = '';
      return;
    }
    hideLoginScreen();
    init();
  } catch {
    errorEl.textContent = 'Unable to connect to server';
    errorEl.style.display = '';
  } finally {
    btn.disabled = false;
    btnText.style.display = '';
    spinner.style.display = 'none';
  }
}

async function handleLogout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch { /* ignore */ }
  showLoginScreen();
}

// ===== Toast System =====
const toastIcons = {
  success: 'check-circle',
  error: 'x-circle',
  warning: 'alert-triangle',
  info: 'info',
};

function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i data-lucide="${toastIcons[type] || 'info'}" class="toast-icon"></i>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Close"><i data-lucide="x"></i></button>
  `;
  container.appendChild(toast);
  lucide.createIcons({ nodes: [toast] });

  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  if (!toast || toast.classList.contains('removing')) return;
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 250);
}

// ===== Form Validation =====
function clearValidation(form) {
  form.querySelectorAll('.has-error').forEach(g => g.classList.remove('has-error'));
  form.querySelectorAll('.field-error').forEach(e => e.remove());
}

function showFieldError(input, message) {
  const group = input.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  const err = document.createElement('div');
  err.className = 'field-error';
  err.textContent = message;
  group.appendChild(err);
}

function validateExpenseForm() {
  const form = document.getElementById('expense-form');
  clearValidation(form);
  let valid = true;

  const amount = document.getElementById('expense-amount');
  if (!amount.value || parseFloat(amount.value) <= 0) {
    showFieldError(amount, 'Amount is required');
    valid = false;
  }

  const desc = document.getElementById('expense-description');
  if (!desc.value.trim()) {
    showFieldError(desc, 'Description is required');
    valid = false;
  }

  const category = document.getElementById('expense-category');
  if (!category.value) {
    showFieldError(category, 'Category is required');
    valid = false;
  }

  const who = document.getElementById('expense-who');
  if (!who.value) {
    showFieldError(who, 'This field is required');
    valid = false;
  }

  return valid;
}

function validateRecurringForm() {
  const form = document.getElementById('recurring-form');
  clearValidation(form);
  let valid = true;

  const name = document.getElementById('recurring-name');
  if (!name.value.trim()) {
    showFieldError(name, 'Name is required');
    valid = false;
  }

  const amount = document.getElementById('recurring-amount');
  if (!amount.value || parseFloat(amount.value) <= 0) {
    showFieldError(amount, 'Amount is required');
    valid = false;
  }

  const freq = document.getElementById('recurring-frequency');
  if (!freq.value) {
    showFieldError(freq, 'Frequency is required');
    valid = false;
  }

  const due = document.getElementById('recurring-next-due');
  if (!due.value) {
    showFieldError(due, 'Next due date is required');
    valid = false;
  }

  const category = document.getElementById('recurring-category');
  if (!category.value) {
    showFieldError(category, 'Category is required');
    valid = false;
  }

  const who = document.getElementById('recurring-who');
  if (!who.value) {
    showFieldError(who, 'This field is required');
    valid = false;
  }

  return valid;
}

// ===== Notification Panel =====
async function loadNotifications() {
  try {
    const recurring = await api.getRecurring();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const sevenDaysOut = new Date(now);
    sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);

    const overdue = [];
    const today = [];
    const upcoming = [];

    recurring.filter(r => r.status === 'active').forEach(r => {
      const due = new Date(r.next_due + 'T00:00:00');
      if (due < now) {
        overdue.push(r);
      } else if (due.getTime() === now.getTime()) {
        today.push(r);
      } else if (due <= sevenDaysOut) {
        upcoming.push(r);
      }
    });

    const totalCount = overdue.length + today.length + upcoming.length;
    const badge = document.getElementById('notif-badge');
    if (totalCount > 0) {
      badge.textContent = totalCount;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }

    const content = document.getElementById('notif-panel-content');
    if (totalCount === 0) {
      content.innerHTML = '<div class="notif-empty">No upcoming reminders</div>';
      return;
    }

    let html = '';
    if (overdue.length) {
      html += '<div class="notif-group-label" style="color:var(--red)">Overdue</div>';
      overdue.forEach(r => { html += renderNotifItem(r, 'notif-overdue'); });
    }
    if (today.length) {
      html += '<div class="notif-group-label" style="color:var(--orange)">Due Today</div>';
      today.forEach(r => { html += renderNotifItem(r, 'notif-today'); });
    }
    if (upcoming.length) {
      html += '<div class="notif-group-label">Upcoming</div>';
      upcoming.forEach(r => { html += renderNotifItem(r, 'notif-upcoming'); });
    }
    content.innerHTML = html;
  } catch {
    // Silently fail if not authenticated
  }
}

function renderNotifItem(r, className) {
  const due = new Date(r.next_due + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24));
  let dateLabel;
  if (diffDays < 0) dateLabel = `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
  else if (diffDays === 0) dateLabel = 'Due today';
  else dateLabel = `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`;

  return `
    <div class="notif-item ${className}">
      <div class="notif-item-left">
        <span class="notif-item-name">${escapeHtml(r.name)}</span>
        <div class="notif-item-meta">
          <span class="badge ${getCategoryBadgeClass(r.categories?.name)}" style="font-size:11px;padding:1px 6px">${escapeHtml(r.categories?.name || '—')}</span>
        </div>
      </div>
      <div class="notif-item-right">
        <div class="notif-item-amount">${formatCurrency(r.amount)}</div>
        <div class="notif-item-date">${dateLabel}</div>
      </div>
    </div>
  `;
}

function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  const isOpen = panel.classList.contains('open');
  if (isOpen) {
    panel.classList.remove('open');
  } else {
    panel.classList.add('open');
    loadNotifications();
  }
}

// ===== Router =====
const viewTitles = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  categories: 'Categories',
  recurring: 'Recurring',
  settings: 'Settings',
};

function navigate(viewName) {
  if (!viewTitles[viewName]) viewName = 'dashboard';
  state.currentView = viewName;

  // Update views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + viewName);
  if (target) target.classList.add('active');

  // Update sidebar
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  if (navItem) navItem.classList.add('active');

  // Update title
  document.getElementById('page-title').textContent = viewTitles[viewName];

  // Update hash without triggering hashchange
  if (location.hash !== '#' + viewName) {
    history.replaceState(null, '', '#' + viewName);
  }

  renderView(viewName);
}

function renderView(viewName) {
  switch (viewName) {
    case 'dashboard': renderDashboard(); break;
    case 'transactions': renderTransactions(); break;
    case 'categories': renderCategories(); break;
    case 'recurring': renderRecurring(); break;
    case 'settings': renderSettings(); break;
  }
}

// ===== Dashboard View =====
async function renderDashboard() {
  const container = document.getElementById('view-dashboard');
  showLoading(container);

  try {
    const [summary, recentRes, chartRes, recurring, budgetGoals] = await Promise.all([
      api.getSummary(),
      api.getExpenses({ sort: 'date', order: 'desc', limit: 10 }),
      api.getExpenses({ sort: 'date', order: 'desc', limit: 500 }),
      api.getRecurring(),
      api.getBudgetGoals(),
    ]);
    state.summary = summary;
    state.budgetGoals = budgetGoals;

    const recentExpenses = recentRes.data;
    const chartExpenses = chartRes.data;
    const now = new Date();
    const dueSoon = recurring.filter(r => {
      if (r.status === 'paused') return false;
      const due = new Date(r.next_due + 'T00:00:00');
      const diffDays = (due - now) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });

    // Build budget goal lookup by category name
    const budgetByCategory = {};
    budgetGoals.forEach(bg => {
      if (bg.categories?.name) {
        budgetByCategory[bg.categories.name] = parseFloat(bg.monthly_limit);
      }
    });

    // Sort categories by amount descending
    const catEntries = Object.entries(summary.byCategory || {}).sort((a, b) => b[1] - a[1]);

    // MoM change display
    let changeHtml = '';
    if (summary.monthOverMonthChange !== null && summary.monthOverMonthChange !== undefined) {
      const isUp = summary.monthOverMonthChange > 0;
      const arrow = isUp ? '&#9650;' : '&#9660;';
      const cls = isUp ? 'up' : 'down';
      changeHtml = `<div class="change ${cls}">${arrow} ${Math.abs(summary.monthOverMonthChange).toFixed(1)}% vs last month</div>`;
    } else {
      changeHtml = '<div class="change" style="color:var(--text-muted)">No prior month data</div>';
    }

    container.innerHTML = `
      <div class="summary-cards">
        <div class="summary-card">
          <div class="label">Total This Month</div>
          <div class="value">${formatCurrency(summary.total)}</div>
          ${changeHtml}
        </div>
        <div class="summary-card">
          <div class="label">By Category</div>
          ${catEntries.length ? catEntries.map(([name, amt]) => {
            const budget = budgetByCategory[name];
            let progressHtml = '';
            if (budget) {
              const pct = Math.min((amt / budget) * 100, 100);
              const colorClass = pct > 80 ? 'red' : pct > 50 ? 'orange' : 'green';
              progressHtml = `
                <div class="budget-progress"><div class="budget-progress-fill ${colorClass}" style="width:${pct}%"></div></div>
                <div class="budget-text">${formatCurrency(amt)} / ${formatCurrency(budget)} (${Math.round((amt / budget) * 100)}%)</div>
              `;
            }
            return `
              <div style="margin-top:8px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span class="badge ${getCategoryBadgeClass(name)}">${escapeHtml(name)}</span>
                  <span style="font-weight:600;font-variant-numeric:tabular-nums">${formatCurrency(amt)}</span>
                </div>
                ${progressHtml}
              </div>
            `;
          }).join('') : '<div style="color:var(--text-muted);margin-top:8px">No expenses yet</div>'}
        </div>
        <div class="summary-card">
          <div class="label">Recurring Due Soon</div>
          <div class="value">${dueSoon.length}</div>
          ${dueSoon.slice(0, 3).map(r => `
            <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:13px">
              <span>${escapeHtml(r.name)}</span>
              <span style="color:var(--text-secondary)">${formatDate(r.next_due)}</span>
            </div>
          `).join('')}
          ${dueSoon.length === 0 ? '<div style="color:var(--text-muted);margin-top:8px">All clear!</div>' : ''}
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Monthly Spending</span>
          </div>
          <div class="chart-container">
            <canvas id="spending-chart"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">Top Categories</span>
          </div>
          <ul class="top-categories-list">
            ${catEntries.length ? catEntries.map(([name, amt]) => `
              <li>
                <span><span class="category-dot ${getCategoryDotClass(name)}"></span>${escapeHtml(name)}</span>
                <span class="category-amount">${formatCurrency(amt)}</span>
              </li>
            `).join('') : '<li style="color:var(--text-muted)">No data yet</li>'}
          </ul>
        </div>
      </div>

      <div class="card recent-section">
        <div class="section-header">
          <h3>Recent Transactions</h3>
          <a href="#transactions" class="view-all-link">View All &#8599;</a>
        </div>
        ${recentExpenses.length ? `
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Who</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${recentExpenses.map(e => `
                <tr>
                  <td>${formatDate(e.date)}</td>
                  <td>${escapeHtml(e.description)}</td>
                  <td><span class="badge ${getCategoryBadgeClass(e.categories?.name)}">${escapeHtml(e.categories?.name || '—')}</span></td>
                  <td>${escapeHtml(e.who_bought_it)}</td>
                  <td class="col-amount">${formatCurrency(e.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<div class="empty-state"><h3>No transactions yet</h3><p>Add your first expense to get started.</p></div>'}
      </div>
    `;

    // Build chart
    buildSpendingChart(chartExpenses);
    lucide.createIcons();
  } catch (err) {
    showError(container, 'Failed to load dashboard: ' + err.message);
  }
}

function buildSpendingChart(expenses) {
  const canvas = document.getElementById('spending-chart');
  if (!canvas) return;

  if (state.chartInstance) {
    state.chartInstance.destroy();
    state.chartInstance = null;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Aggregate by day
  const dailyTotals = new Array(daysInMonth).fill(0);
  expenses.forEach(e => {
    const d = new Date(e.date + 'T00:00:00');
    if (d.getFullYear() === year && d.getMonth() === month) {
      dailyTotals[d.getDate() - 1] += parseFloat(e.amount);
    }
  });

  // Cumulative
  const cumulative = [];
  let running = 0;
  for (let i = 0; i < daysInMonth; i++) {
    running += dailyTotals[i];
    cumulative.push(Math.round(running * 100) / 100);
  }

  const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const isDark = state.theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const tickColor = isDark ? '#8b8b8f' : '#52525b';

  state.chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Spending',
        data: cumulative,
        borderColor: '#8b5cf6',
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => formatCurrency(ctx.parsed.y),
          },
        },
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: tickColor, maxTicksLimit: 10 },
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: tickColor,
            callback: (val) => '$' + val,
          },
        },
      },
    },
  });
}

// ===== Transactions View =====
async function renderTransactions() {
  const container = document.getElementById('view-transactions');

  // Build filter bar (only once if not already present)
  const filtersExist = container.querySelector('.filter-bar');
  if (!filtersExist) {
    container.innerHTML = `
      <div class="filter-bar">
        <div class="form-group">
          <label>Start Date</label>
          <input type="date" id="filter-start-date">
        </div>
        <div class="form-group">
          <label>End Date</label>
          <input type="date" id="filter-end-date">
        </div>
        <div class="form-group">
          <label>Category</label>
          <select id="filter-category">
            <option value="">All Categories</option>
            ${state.categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Business</label>
          <select id="filter-business">
            <option value="">All Businesses</option>
            ${state.businesses.map(b => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Who</label>
          <select id="filter-who">
            <option value="">Everyone</option>
            <option value="Kameron">Kameron</option>
            <option value="CC">CC</option>
            <option value="Shared">Shared</option>
          </select>
        </div>
        <div class="form-group">
          <label>Payment</label>
          <select id="filter-payment">
            <option value="">All Methods</option>
            ${state.paymentMethods.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group search-input">
          <label>Search</label>
          <input type="text" id="filter-search" placeholder="Search descriptions...">
        </div>
      </div>
      <div id="transactions-table-area"><div class="loading-spinner"></div></div>
    `;
    attachFilterListeners();
  }

  await fetchAndRenderTransactions();
}

function attachFilterListeners() {
  const changeHandler = () => {
    updateFiltersFromInputs();
    state.pagination.page = 1;
    fetchAndRenderTransactions();
  };

  ['filter-start-date', 'filter-end-date', 'filter-category', 'filter-business', 'filter-who', 'filter-payment'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', changeHandler);
  });

  const searchEl = document.getElementById('filter-search');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      clearTimeout(state.searchTimeout);
      state.searchTimeout = setTimeout(() => {
        updateFiltersFromInputs();
        state.pagination.page = 1;
        fetchAndRenderTransactions();
      }, 300);
    });
  }
}

function updateFiltersFromInputs() {
  state.expenseFilters = {
    start_date: document.getElementById('filter-start-date')?.value || '',
    end_date: document.getElementById('filter-end-date')?.value || '',
    category: document.getElementById('filter-category')?.value || '',
    business: document.getElementById('filter-business')?.value || '',
    who: document.getElementById('filter-who')?.value || '',
    payment_method: document.getElementById('filter-payment')?.value || '',
    search: document.getElementById('filter-search')?.value || '',
  };
}

async function fetchAndRenderTransactions() {
  const area = document.getElementById('transactions-table-area');
  if (!area) return;
  showLoading(area);

  try {
    const offset = (state.pagination.page - 1) * state.pagination.pageSize;
    const filters = {
      ...state.expenseFilters,
      sort: state.expenseSort.col,
      order: state.expenseSort.order,
      limit: state.pagination.pageSize,
      offset,
    };
    const response = await api.getExpenses(filters);
    const expenses = response.data;
    state.expenses = expenses;
    state.pagination.total = response.total;

    const totalPages = Math.max(1, Math.ceil(response.total / state.pagination.pageSize));

    if (expenses.length === 0) {
      const hasFilters = Object.values(state.expenseFilters).some(v => v);
      area.innerHTML = `
        <div class="empty-state">
          <i data-lucide="receipt"></i>
          <h3>No expenses found</h3>
          <p>${hasFilters ? 'Try adjusting your filters.' : 'Add your first expense to get started.'}</p>
          ${!hasFilters ? '<button class="btn btn-primary" onclick="openModal(\'expense\')"><i data-lucide="plus"></i> Add Expense</button>' : ''}
        </div>
      `;
      lucide.createIcons();
      return;
    }

    const sortCol = state.expenseSort.col;
    const sortOrder = state.expenseSort.order;
    const sortClass = (col) => {
      if (col === sortCol) return sortOrder === 'asc' ? 'sorted-asc' : 'sorted-desc';
      return '';
    };

    area.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th class="${sortClass('date')}" data-sort="date">Date</th>
            <th class="${sortClass('description')}" data-sort="description">Description</th>
            <th>Category</th>
            <th>Business</th>
            <th>Who</th>
            <th class="text-right ${sortClass('amount')}" data-sort="amount">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map(e => `
            <tr data-id="${e.id}">
              <td>${formatDate(e.date)}</td>
              <td>${escapeHtml(e.description)}</td>
              <td><span class="badge ${getCategoryBadgeClass(e.categories?.name)}">${escapeHtml(e.categories?.name || '—')}</span></td>
              <td>${escapeHtml(e.businesses?.name || '—')}</td>
              <td>${escapeHtml(e.who_bought_it)}</td>
              <td class="col-amount">${formatCurrency(e.amount)}</td>
              <td class="col-actions">
                <button class="btn btn-sm btn-secondary edit-expense-btn" data-id="${e.id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-expense-btn" data-id="${e.id}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="pagination-bar">
        <div class="pagination-left">
          <label for="page-size-select" style="margin-bottom:0;display:inline;margin-right:6px">Show</label>
          <select id="page-size-select" class="page-size-select">
            <option value="25" ${state.pagination.pageSize === 25 ? 'selected' : ''}>25</option>
            <option value="50" ${state.pagination.pageSize === 50 ? 'selected' : ''}>50</option>
            <option value="100" ${state.pagination.pageSize === 100 ? 'selected' : ''}>100</option>
          </select>
        </div>
        <div class="pagination-info">Page ${state.pagination.page} of ${totalPages}</div>
        <div class="pagination-right">
          <button class="btn btn-secondary btn-sm pagination-btn" id="pagination-prev" ${state.pagination.page <= 1 ? 'disabled' : ''}>Previous</button>
          <button class="btn btn-secondary btn-sm pagination-btn" id="pagination-next" ${state.pagination.page >= totalPages ? 'disabled' : ''}>Next</button>
        </div>
      </div>
    `;

    // Pagination handlers
    document.getElementById('pagination-prev')?.addEventListener('click', () => {
      if (state.pagination.page > 1) {
        state.pagination.page--;
        fetchAndRenderTransactions();
      }
    });
    document.getElementById('pagination-next')?.addEventListener('click', () => {
      if (state.pagination.page < totalPages) {
        state.pagination.page++;
        fetchAndRenderTransactions();
      }
    });
    document.getElementById('page-size-select')?.addEventListener('change', (e) => {
      state.pagination.pageSize = parseInt(e.target.value);
      state.pagination.page = 1;
      fetchAndRenderTransactions();
    });

    // Sort click handlers
    area.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (state.expenseSort.col === col) {
          state.expenseSort.order = state.expenseSort.order === 'asc' ? 'desc' : 'asc';
        } else {
          state.expenseSort.col = col;
          state.expenseSort.order = col === 'amount' ? 'desc' : 'asc';
        }
        state.pagination.page = 1;
        fetchAndRenderTransactions();
      });
    });

    // Edit/Delete handlers
    area.querySelectorAll('.edit-expense-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const expense = state.expenses.find(e => e.id === btn.dataset.id);
        if (expense) openModal('expense', expense);
      });
    });

    area.querySelectorAll('.delete-expense-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this expense?')) return;
        try {
          await api.deleteExpense(btn.dataset.id);
          showToast('Expense deleted', 'success');
          fetchAndRenderTransactions();
        } catch (err) {
          showToast('Failed to delete expense: ' + err.message, 'error');
        }
      });
    });

    lucide.createIcons();
  } catch (err) {
    showError(area, 'Failed to load transactions: ' + err.message);
  }
}

// ===== Categories View =====
async function renderCategories() {
  const container = document.getElementById('view-categories');
  showLoading(container);

  try {
    const [summary, expensesRes] = await Promise.all([
      api.getSummary(),
      api.getExpenses({ limit: 500 }),
    ]);

    // Count expenses per category
    const countByCategory = {};
    expensesRes.data.forEach(e => {
      const name = e.categories?.name || 'Uncategorized';
      countByCategory[name] = (countByCategory[name] || 0) + 1;
    });

    const byCategory = summary.byCategory || {};

    if (state.categories.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>No categories</h3><p>Categories will appear once configured.</p></div>';
      return;
    }

    container.innerHTML = `
      <div class="category-grid">
        ${state.categories.map(cat => {
          const amt = byCategory[cat.name] || 0;
          const count = countByCategory[cat.name] || 0;
          return `
            <div class="category-card" data-category-id="${cat.id}">
              <div class="category-name">
                <span class="badge ${getCategoryBadgeClass(cat.name)}">${escapeHtml(cat.name)}</span>
              </div>
              <div class="category-stats">
                <span class="stat-amount">${formatCurrency(amt)}</span>
                <span class="stat-count">${count} transaction${count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Click to filter transactions by category
    container.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        state.expenseFilters = { category: card.dataset.categoryId };
        navigate('transactions');
        // After navigating, set the filter dropdown
        setTimeout(() => {
          const filterEl = document.getElementById('filter-category');
          if (filterEl) filterEl.value = card.dataset.categoryId;
        }, 50);
      });
    });
  } catch (err) {
    showError(container, 'Failed to load categories: ' + err.message);
  }
}

// ===== Recurring View =====
async function renderRecurring() {
  const container = document.getElementById('view-recurring');
  showLoading(container);

  try {
    const recurring = await api.getRecurring();
    state.recurring = recurring;

    const addBtn = `<button class="btn btn-primary" id="add-recurring-btn"><i data-lucide="plus"></i> Add Recurring</button>`;

    if (recurring.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i data-lucide="repeat"></i>
          <h3>No recurring expenses</h3>
          <p>Track subscriptions and regular bills here.</p>
          ${addBtn}
        </div>
      `;
      attachAddRecurringBtn();
      lucide.createIcons();
      return;
    }

    const now = new Date();

    container.innerHTML = `
      <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
        ${addBtn}
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th class="text-right">Amount</th>
            <th>Frequency</th>
            <th>Next Due</th>
            <th>Category</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${recurring.map(r => {
            const due = new Date(r.next_due + 'T00:00:00');
            const isOverdue = r.status === 'active' && due < now;
            const statusClass = r.status === 'active' ? 'status-active' : 'status-paused';
            return `
              <tr data-id="${r.id}">
                <td>${escapeHtml(r.name)}</td>
                <td class="col-amount">${formatCurrency(r.amount)}</td>
                <td style="text-transform:capitalize">${escapeHtml(r.frequency)}</td>
                <td class="${isOverdue ? 'overdue' : ''}">${formatDate(r.next_due)}${isOverdue ? ' (Overdue)' : ''}</td>
                <td><span class="badge ${getCategoryBadgeClass(r.categories?.name)}">${escapeHtml(r.categories?.name || '—')}</span></td>
                <td><span class="${statusClass}" style="text-transform:capitalize">${r.status}</span></td>
                <td class="col-actions">
                  <button class="btn btn-sm btn-secondary toggle-status-btn" data-id="${r.id}" data-status="${r.status}">
                    ${r.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                  <button class="btn btn-sm btn-secondary edit-recurring-btn" data-id="${r.id}">Edit</button>
                  <button class="btn btn-sm btn-danger delete-recurring-btn" data-id="${r.id}">Delete</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    attachAddRecurringBtn();

    // Toggle status
    container.querySelectorAll('.toggle-status-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const newStatus = btn.dataset.status === 'active' ? 'paused' : 'active';
        try {
          await api.updateRecurring(btn.dataset.id, { status: newStatus });
          showToast(`Recurring expense ${newStatus === 'paused' ? 'paused' : 'resumed'}`, 'success');
          renderRecurring();
        } catch (err) {
          showToast('Failed to update status: ' + err.message, 'error');
        }
      });
    });

    // Edit
    container.querySelectorAll('.edit-recurring-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rec = state.recurring.find(r => r.id === btn.dataset.id);
        if (rec) openModal('recurring', rec);
      });
    });

    // Delete
    container.querySelectorAll('.delete-recurring-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this recurring expense?')) return;
        try {
          await api.deleteRecurring(btn.dataset.id);
          showToast('Recurring expense deleted', 'success');
          renderRecurring();
        } catch (err) {
          showToast('Failed to delete: ' + err.message, 'error');
        }
      });
    });

    lucide.createIcons();
  } catch (err) {
    showError(container, 'Failed to load recurring expenses: ' + err.message);
  }
}

function attachAddRecurringBtn() {
  const btn = document.getElementById('add-recurring-btn');
  if (btn) btn.addEventListener('click', () => openModal('recurring'));
}

// ===== Settings View =====
async function renderSettings() {
  const container = document.getElementById('view-settings');
  const isLight = state.theme === 'light';

  let budgetGoals = [];
  try {
    budgetGoals = await api.getBudgetGoals();
    state.budgetGoals = budgetGoals;
  } catch { /* ignore */ }

  // Map goal by category_id
  const goalByCatId = {};
  budgetGoals.forEach(bg => { goalByCatId[bg.category_id] = bg; });

  container.innerHTML = `
    <div class="settings-section">
      <h3>Appearance</h3>
      <div class="setting-row">
        <div>
          <div class="setting-label">Light Mode</div>
          <div class="setting-description">Switch between dark and light theme</div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="theme-toggle" ${isLight ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    <div class="settings-section" style="margin-top:32px">
      <h3>Budget Goals</h3>
      <p class="setting-description" style="margin-bottom:12px">Set monthly spending limits per category</p>
      ${state.categories.map(cat => {
        const goal = goalByCatId[cat.id];
        return `
          <div class="budget-row" data-category-id="${cat.id}" data-goal-id="${goal?.id || ''}">
            <span class="badge ${getCategoryBadgeClass(cat.name)}">${escapeHtml(cat.name)}</span>
            <div class="budget-row-input">
              <span class="budget-dollar">$</span>
              <input type="number" class="budget-limit-input" step="0.01" min="0" placeholder="No limit" value="${goal ? goal.monthly_limit : ''}">
            </div>
            <button class="btn btn-sm btn-primary budget-save-btn">Save</button>
            ${goal ? '<button class="btn btn-sm btn-danger budget-remove-btn">Remove</button>' : ''}
          </div>
        `;
      }).join('')}
    </div>
    <div class="settings-section" style="margin-top:32px">
      <h3>Coming Soon</h3>
      <div class="setting-row">
        <div>
          <div class="setting-label">Multi-User Support</div>
          <div class="setting-description">Invite others to share expense tracking</div>
        </div>
      </div>
      <div class="setting-row">
        <div>
          <div class="setting-label">Export Data</div>
          <div class="setting-description">Download your expenses as CSV</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('theme-toggle').addEventListener('change', (e) => {
    state.theme = e.target.checked ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('moneymap-theme', state.theme);
    if (state.chartInstance) {
      state.chartInstance.destroy();
      state.chartInstance = null;
    }
  });

  // Budget save handlers
  container.querySelectorAll('.budget-save-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest('.budget-row');
      const catId = row.dataset.categoryId;
      const goalId = row.dataset.goalId;
      const input = row.querySelector('.budget-limit-input');
      const value = parseFloat(input.value);

      if (!value || value <= 0) {
        showToast('Enter a valid amount', 'warning');
        return;
      }

      try {
        if (goalId) {
          await api.updateBudgetGoal(goalId, { monthly_limit: value });
        } else {
          await api.createBudgetGoal({ category_id: catId, monthly_limit: value });
        }
        showToast('Budget goal saved', 'success');
        renderSettings();
      } catch (err) {
        showToast('Failed to save budget goal: ' + err.message, 'error');
      }
    });
  });

  // Budget remove handlers
  container.querySelectorAll('.budget-remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest('.budget-row');
      const goalId = row.dataset.goalId;
      if (!goalId) return;

      try {
        await api.deleteBudgetGoal(goalId);
        showToast('Budget goal removed', 'success');
        renderSettings();
      } catch (err) {
        showToast('Failed to remove budget goal: ' + err.message, 'error');
      }
    });
  });
}

// ===== Modal =====
function openModal(mode, data) {
  const overlay = document.getElementById('modal-overlay');
  const expenseForm = document.getElementById('expense-form');
  const recurringForm = document.getElementById('recurring-form');

  if (mode === 'expense') {
    expenseForm.style.display = '';
    recurringForm.style.display = 'none';
    document.getElementById('expense-form-title').textContent = data ? 'Edit Expense' : 'Add Expense';
    clearValidation(expenseForm);
    populateExpenseForm(data);
    state.editingExpense = data || null;
  } else {
    expenseForm.style.display = 'none';
    recurringForm.style.display = '';
    document.getElementById('recurring-form-title').textContent = data ? 'Edit Recurring Expense' : 'Add Recurring Expense';
    clearValidation(recurringForm);
    populateRecurringForm(data);
    state.editingRecurring = data || null;
  }

  overlay.classList.add('open');
  lucide.createIcons();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  state.editingExpense = null;
  state.editingRecurring = null;
}

function populateExpenseForm(data) {
  document.getElementById('expense-id').value = data?.id || '';
  document.getElementById('expense-amount').value = data?.amount || '';
  document.getElementById('expense-description').value = data?.description || '';
  document.getElementById('expense-date').value = data?.date || new Date().toISOString().slice(0, 10);
  document.getElementById('expense-category').value = data?.category_id || '';
  document.getElementById('expense-business').value = data?.business_id || '';
  document.getElementById('expense-who').value = data?.who_bought_it || '';
  document.getElementById('expense-payment').value = data?.payment_method_id || '';
  document.getElementById('expense-notes').value = data?.notes || '';

  // Toggle business field visibility
  toggleBusinessField('expense', data?.category_id);
}

function populateRecurringForm(data) {
  document.getElementById('recurring-id').value = data?.id || '';
  document.getElementById('recurring-name').value = data?.name || '';
  document.getElementById('recurring-amount').value = data?.amount || '';
  document.getElementById('recurring-frequency').value = data?.frequency || '';
  document.getElementById('recurring-next-due').value = data?.next_due || '';
  document.getElementById('recurring-category').value = data?.category_id || '';
  document.getElementById('recurring-business').value = data?.business_id || '';
  document.getElementById('recurring-who').value = data?.who_bought_it || '';
  document.getElementById('recurring-payment').value = data?.payment_method_id || '';

  toggleBusinessField('recurring', data?.category_id);
}

function toggleBusinessField(formPrefix, categoryId) {
  const group = document.getElementById(formPrefix + '-business-group');
  if (!group) return;
  const cat = state.categories.find(c => c.id === categoryId);
  group.style.display = (cat && cat.name.toLowerCase() === 'business') ? '' : 'none';
}

async function handleExpenseSubmit(e) {
  e.preventDefault();

  if (!validateExpenseForm()) return;

  const id = document.getElementById('expense-id').value;
  const data = {
    amount: parseFloat(document.getElementById('expense-amount').value),
    description: document.getElementById('expense-description').value.trim(),
    category_id: document.getElementById('expense-category').value,
    business_id: document.getElementById('expense-business').value || null,
    date: document.getElementById('expense-date').value || null,
    who_bought_it: document.getElementById('expense-who').value,
    payment_method_id: document.getElementById('expense-payment').value || null,
    notes: document.getElementById('expense-notes').value.trim() || null,
  };

  try {
    if (id) {
      await api.updateExpense(id, data);
      showToast('Expense updated', 'success');
    } else {
      await api.createExpense(data);
      showToast('Expense added', 'success');
    }
    closeModal();
    renderView(state.currentView);
  } catch (err) {
    showToast('Failed to save expense: ' + err.message, 'error');
  }
}

async function handleRecurringSubmit(e) {
  e.preventDefault();

  if (!validateRecurringForm()) return;

  const id = document.getElementById('recurring-id').value;
  const data = {
    name: document.getElementById('recurring-name').value.trim(),
    amount: parseFloat(document.getElementById('recurring-amount').value),
    frequency: document.getElementById('recurring-frequency').value,
    next_due: document.getElementById('recurring-next-due').value,
    category_id: document.getElementById('recurring-category').value,
    business_id: document.getElementById('recurring-business').value || null,
    who_bought_it: document.getElementById('recurring-who').value,
    payment_method_id: document.getElementById('recurring-payment').value || null,
  };

  try {
    if (id) {
      await api.updateRecurring(id, data);
      showToast('Recurring expense updated', 'success');
    } else {
      await api.createRecurring(data);
      showToast('Recurring expense added', 'success');
    }
    closeModal();
    renderView(state.currentView);
  } catch (err) {
    showToast('Failed to save recurring expense: ' + err.message, 'error');
  }
}

// ===== Populate Form Dropdowns =====
function populateDropdowns() {
  // Category dropdowns (expense + recurring)
  ['expense-category', 'recurring-category'].forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    const placeholder = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (placeholder) select.appendChild(placeholder);
    state.categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      select.appendChild(opt);
    });
  });

  // Business dropdowns
  ['expense-business', 'recurring-business'].forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    const placeholder = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (placeholder) select.appendChild(placeholder);
    state.businesses.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.name;
      select.appendChild(opt);
    });
  });

  // Payment method dropdowns
  ['expense-payment', 'recurring-payment'].forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    const placeholder = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (placeholder) select.appendChild(placeholder);
    state.paymentMethods.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    });
  });
}

// ===== Init =====
async function init() {
  // Apply theme
  document.documentElement.setAttribute('data-theme', state.theme);

  // Load reference data
  try {
    const [categories, businesses, paymentMethods] = await Promise.all([
      api.getCategories(),
      api.getBusinesses(),
      api.getPaymentMethods(),
    ]);
    state.categories = categories;
    state.businesses = businesses;
    state.paymentMethods = paymentMethods;
    populateDropdowns();
  } catch (err) {
    console.error('Failed to load reference data:', err);
  }

  // Initialize Lucide icons
  lucide.createIcons();

  // Event listeners
  document.getElementById('add-expense-btn').addEventListener('click', () => openModal('expense'));

  document.getElementById('expense-form').addEventListener('submit', handleExpenseSubmit);
  document.getElementById('recurring-form').addEventListener('submit', handleRecurringSubmit);

  // Category change toggles business field
  document.getElementById('expense-category').addEventListener('change', (e) => {
    toggleBusinessField('expense', e.target.value);
  });
  document.getElementById('recurring-category').addEventListener('change', (e) => {
    toggleBusinessField('recurring', e.target.value);
  });

  // Modal close
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      // Also close notif panel
      document.getElementById('notif-panel')?.classList.remove('open');
    }
  });

  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(item.dataset.view);
    });
  });

  // View All link on dashboard
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-all-link')) {
      e.preventDefault();
      navigate('transactions');
    }
  });

  // Hash routing
  window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1) || 'dashboard';
    navigate(hash);
  });

  // Load notifications for badge count
  loadNotifications();

  // Navigate to initial view
  const initialView = location.hash.slice(1) || 'dashboard';
  navigate(initialView);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Attach login/logout listeners before auth check
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('notif-bell-btn').addEventListener('click', toggleNotifPanel);
  document.getElementById('notif-close-btn').addEventListener('click', () => {
    document.getElementById('notif-panel').classList.remove('open');
  });

  lucide.createIcons();

  // Check auth status
  const isAuth = await checkAuth();
  if (isAuth) {
    hideLoginScreen();
    init();
  } else {
    showLoginScreen();
  }
});
