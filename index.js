let transactions = JSON.parse(localStorage.getItem(‘ledger_v2’)) || [];
let activeMonth = ‘all’;
let isDark = localStorage.getItem(‘theme’) !== ‘light’;

const MONTH_NAMES = [’’,‘一月’,‘二月’,‘三月’,‘四月’,‘五月’,‘六月’,‘七月’,‘八月’,‘九月’,‘十月’,‘十一月’,‘十二月’];

// Init
const today = new Date();
document.getElementById(‘yearBadge’).textContent = today.getFullYear() + ’ 年’;
document.getElementById(‘txDate’).value = today.toISOString().split(‘T’)[0];
applyTheme();

// Theme
function toggleTheme() {
isDark = !isDark;
localStorage.setItem(‘theme’, isDark ? ‘dark’ : ‘light’);
applyTheme();
}

function applyTheme() {
document.documentElement.setAttribute(‘data-theme’, isDark ? ‘dark’ : ‘light’);
document.getElementById(‘themeBtn’).textContent = isDark ? ‘☀️ 淺色’ : ‘🌙 深色’;
}

// Month filter
document.getElementById(‘monthFilter’).addEventListener(‘click’, function(e) {
const btn = e.target.closest(’.month-btn’);
if (!btn) return;
document.querySelectorAll(’.month-btn’).forEach(b => b.classList.remove(‘active’));
btn.classList.add(‘active’);
activeMonth = btn.dataset.month;
render();
renderMonthDetail();
});

// Add transaction
function addTransaction() {
const name     = document.getElementById(‘txName’).value.trim();
const amount   = parseFloat(document.getElementById(‘txAmount’).value);
const date     = document.getElementById(‘txDate’).value;
const category = document.getElementById(‘txCategory’).value;

if (!name)         { showToast(‘⚠️ 請輸入項目名稱’); return; }
if (isNaN(amount)) { showToast(‘⚠️ 請輸入有效金額’); return; }
if (!date)         { showToast(‘⚠️ 請選擇日期’);     return; }

transactions.unshift({ id: Date.now(), name, amount, date, category });
save();
render();
renderMonthDetail();
document.getElementById(‘txName’).value = ‘’;
document.getElementById(‘txAmount’).value = ‘’;
showToast(amount >= 0 ? ‘✅ 收入已新增’ : ‘✅ 支出已新增’);
}

// Delete transaction
function deleteTransaction(id) {
transactions = transactions.filter(t => t.id !== id);
save();
render();
renderMonthDetail();
showToast(‘🗑 已刪除’);
}

// Clear all
function clearAll() {
if (!transactions.length) return;
if (!confirm(‘確定要清除全部記錄嗎？’)) return;
transactions = [];
save();
render();
renderMonthDetail();
showToast(‘🗑 已清除全部記錄’);
}

// Filter by month
function filtered() {
if (activeMonth === ‘all’) return transactions;
return transactions.filter(t => (new Date(t.date).getMonth() + 1) === parseInt(activeMonth));
}

// Render main list & summary
function render() {
const list    = filtered();
const income  = list.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
const expense = list.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
const balance = income + expense;

const balEl = document.getElementById(‘balance’);
balEl.textContent = fmtSigned(balance);
balEl.className = ’balance-amount ’ + (balance > 0 ? ‘positive’ : balance < 0 ? ‘negative’ : ‘zero’);

document.getElementById(‘totalIncome’).textContent  = fmt(income);
document.getElementById(‘totalExpense’).textContent = fmt(Math.abs(expense));
document.getElementById(‘txCount’).textContent = list.length + ’ 筆’;

const listEl = document.getElementById(‘txList’);
if (!list.length) {
listEl.innerHTML = `<li class="empty-state"> <div class="empty-icon">📋</div> <p>尚無記錄${activeMonth !== 'all' ? '（此月份）' : ''}</p> </li>`;
return;
}

listEl.innerHTML = list.map(t => {
const isIncome = t.amount >= 0;
const d = new Date(t.date);
const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
return `<li class="tx-item"> <div class="tx-dot ${isIncome ? 'income' : 'expense'}"></div> <div class="tx-info"> <div class="tx-name">${esc(t.name)}</div> <div class="tx-meta">${dateStr} &nbsp;·&nbsp; ${esc(t.category)}</div> </div> <div class="tx-amount ${isIncome ? 'income' : 'expense'}">${isIncome ? '+' : ''}${fmtSigned(t.amount)}</div> <button class="tx-delete" onclick="deleteTransaction(${t.id})" title="刪除">✕</button> </li>`;
}).join(’’);
}

// Render month detail panel
function renderMonthDetail() {
const detail = document.getElementById(‘monthDetail’);
if (activeMonth === ‘all’) {
detail.classList.remove(‘show’);
return;
}
detail.classList.add(‘show’);

const list    = transactions.filter(t => (new Date(t.date).getMonth() + 1) === parseInt(activeMonth));
const income  = list.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
const expense = list.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

document.getElementById(‘monthDetailTitle’).textContent = MONTH_NAMES[parseInt(activeMonth)] + ’ 明細’;
document.getElementById(‘monthDetailStats’).innerHTML = `<span class="month-stat"><span class="label">收入</span><span style="color:var(--green)">${fmt(income)}</span></span> <span class="month-stat"><span class="label">支出</span><span style="color:var(--red)">${fmt(Math.abs(expense))}</span></span> <span class="month-stat"><span class="label">結餘</span><span style="color:var(--accent)">${fmtSigned(income + expense)}</span></span>`;

const listEl = document.getElementById(‘monthTxList’);
if (!list.length) {
listEl.innerHTML = ‘<li class="month-empty">此月份尚無記錄</li>’;
return;
}
listEl.innerHTML = list.map(t => {
const isIncome = t.amount >= 0;
const d = new Date(t.date);
const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
return `<li class="month-tx-item"> <div class="month-tx-dot ${isIncome ? 'income' : 'expense'}"></div> <span class="month-tx-name">${esc(t.name)}</span> <span class="month-tx-meta">${dateStr} · ${esc(t.category)}</span> <span class="month-tx-amount ${isIncome ? 'income' : 'expense'}">${isIncome ? '+' : ''}${fmtSigned(t.amount)}</span> </li>`;
}).join(’’);
}

// Helpers
function save()        { localStorage.setItem(‘ledger_v2’, JSON.stringify(transactions)); }
function fmt(n)        { return ‘$’ + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ‘,’); }
function fmtSigned(n)  { return (n < 0 ? ‘-’ : ‘’) + ‘$’ + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ‘,’); }
function esc(s)        { return String(s).replace(/</g, ‘<’).replace(/>/g, ‘>’); }

function showToast(msg) {
const t = document.getElementById(‘toast’);
t.textContent = msg;
t.classList.add(‘show’);
setTimeout(() => t.classList.remove(‘show’), 2200);
}

// Enter key shortcut
[‘txName’, ‘txAmount’].forEach(id => {
document.getElementById(id).addEventListener(‘keydown’, e => {
if (e.key === ‘Enter’) addTransaction();
});
});

// Initial render
render();
renderMonthDetail();
