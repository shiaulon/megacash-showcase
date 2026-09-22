const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const now = new Date();
const safeDay = (offset) => new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - offset), 12);

const state = {
  page: 'dashboard',
  transactions: [
    { id: 1, description: 'Salário', category: 'Receitas', amount: 7850, type: 'income', date: safeDay(8), icon: 'briefcase-business' },
    { id: 2, description: 'Supermercado Central', category: 'Alimentação', amount: 486.72, type: 'expense', date: safeDay(1), icon: 'shopping-cart' },
    { id: 3, description: 'Aluguel', category: 'Moradia', amount: 1850, type: 'expense', date: safeDay(5), icon: 'house' },
    { id: 4, description: 'Combustível', category: 'Transporte', amount: 240, type: 'expense', date: safeDay(2), icon: 'car' },
    { id: 5, description: 'Streaming e música', category: 'Assinaturas', amount: 74.80, type: 'expense', date: safeDay(3), icon: 'play' },
    { id: 6, description: 'Freelance', category: 'Receitas', amount: 1250, type: 'income', date: safeDay(12), icon: 'laptop' },
    { id: 7, description: 'Restaurante', category: 'Alimentação', amount: 138.40, type: 'expense', date: safeDay(0), icon: 'utensils' },
    { id: 8, description: 'Farmácia', category: 'Saúde', amount: 92.30, type: 'expense', date: safeDay(6), icon: 'heart-pulse' }
  ]
};

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'transactions', label: 'Transações', icon: 'arrow-left-right' },
  { id: 'invoice', label: 'Fatura', icon: 'credit-card' },
  { id: 'planning', label: 'Planejamento', icon: 'chart-no-axes-combined' }
];

const categoryColors = { Alimentação: '#d85c55', Moradia: '#3874cb', Transporte: '#b77916', Assinaturas: '#7657b8', Saúde: '#168a68' };

function totals() {
  const income = state.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = state.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  return { income, expense, balance: 12480.35 + income - expense };
}

function renderNav() {
  const markup = navigation.map(item => `
    <button class="nav-button ${state.page === item.id ? 'active' : ''}" data-page="${item.id}" type="button">
      <i data-lucide="${item.icon}"></i><span>${item.label}</span>
    </button>`).join('');
  document.querySelector('.desktop-nav').innerHTML = markup;
  document.querySelector('.mobile-nav').innerHTML = markup;
  document.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => {
    state.page = button.dataset.page;
    render();
  }));
}

function txRow(transaction) {
  const sign = transaction.type === 'income' ? '+' : '-';
  return `<div class="transaction-row">
    <div class="transaction-icon"><i data-lucide="${transaction.icon || 'receipt-text'}"></i></div>
    <div class="transaction-copy"><strong>${transaction.description}</strong><span>${transaction.category} · ${shortDate.format(transaction.date)}</span></div>
    <div class="transaction-value ${transaction.type === 'income' ? 'positive' : 'negative'}">${sign} ${money.format(transaction.amount)}</div>
  </div>`;
}

function dashboard() {
  const { income, expense, balance } = totals();
  return `<div class="summary-grid">
    <article class="card summary-card"><p class="card-label">Saldo total</p><p class="summary-value">${money.format(balance)}</p><p class="summary-detail">Em 3 contas</p></article>
    <article class="card summary-card"><p class="card-label">Receitas no mês</p><p class="summary-value positive">${money.format(income)}</p><p class="summary-detail positive">8,4% acima do mês anterior</p></article>
    <article class="card summary-card"><p class="card-label">Despesas no mês</p><p class="summary-value negative">${money.format(expense)}</p><p class="summary-detail">42% da renda mensal</p></article>
    <article class="card summary-card"><p class="card-label">Fatura atual</p><p class="summary-value">${money.format(2148.90)}</p><p class="summary-detail">Fecha dia ${String(Math.min(28, now.getDate() + 6)).padStart(2, '0')}</p></article>
  </div>
  <div class="content-grid">
    <article class="card"><div class="section-header"><h2>Fluxo do mês</h2><span>Receitas e despesas</span></div><div class="chart-wrap"><canvas id="cash-chart"></canvas></div></article>
    <article class="card"><div class="section-header"><h2>Movimentações recentes</h2><button class="text-button" data-page="transactions">Ver todas</button></div><div class="transaction-list">${state.transactions.slice().sort((a,b) => b.date-a.date).slice(0,5).map(txRow).join('')}</div></article>
  </div>`;
}

function transactions() {
  return `<article class="card table-card"><div class="table-toolbar"><div><h2>Transações de ${capitalize(monthLabel.format(now))}</h2><span class="card-label">${state.transactions.length} movimentações fictícias</span></div><span class="pill">Sincronizado</span></div>
  <table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th>Valor</th></tr></thead><tbody>
  ${state.transactions.slice().sort((a,b) => b.date-a.date).map(t => `<tr><td>${shortDate.format(t.date)}</td><td><strong>${t.description}</strong></td><td>${t.category}</td><td>${t.type === 'income' ? 'Conta principal' : 'Cartão Mega'}</td><td class="${t.type === 'income' ? 'positive' : 'negative'}">${t.type === 'income' ? '+' : '-'} ${money.format(t.amount)}</td></tr>`).join('')}
  </tbody></table></article>`;
}

function invoice() {
  const closeDay = Math.min(28, now.getDate() + 6);
  const dueDay = Math.min(28, closeDay + 7);
  return `<article class="card invoice-hero"><div><p class="card-label">Fatura de ${capitalize(monthLabel.format(now))}</p><p class="summary-value">${money.format(2148.90)}</p><p class="summary-detail">Limite disponível: ${money.format(7851.10)}</p></div><div class="invoice-meta"><div><span>Fechamento</span><strong>${closeDay} ${shortMonth()}</strong></div><div><span>Vencimento</span><strong>${dueDay} ${shortMonth()}</strong></div></div></article>
  <div class="content-grid"><article class="card"><div class="section-header"><h2>Compras na fatura</h2><span>Cartão final 2048</span></div>${state.transactions.filter(t => t.type === 'expense').slice(0,6).map(txRow).join('')}</article>
  <article class="card"><div class="section-header"><h2>Limite do cartão</h2><span>R$ 10.000</span></div><p class="summary-value">21,5%</p><div class="progress"><span style="width:21.5%"></span></div><p class="summary-detail" style="margin-top:12px">A fatura é recalculada com dados relativos ao mês atual.</p></article></div>`;
}

function planning() {
  const plans = [
    { name: 'Alimentação', spent: 1138.40, limit: 1500, cls: '' },
    { name: 'Moradia', spent: 1850, limit: 2100, cls: 'warning' },
    { name: 'Transporte', spent: 540, limit: 900, cls: '' },
    { name: 'Lazer', spent: 620, limit: 700, cls: 'danger' },
    { name: 'Saúde', spent: 292.30, limit: 600, cls: '' },
    { name: 'Assinaturas', spent: 174.80, limit: 250, cls: '' }
  ];
  return `<div class="summary-grid"><article class="card summary-card"><p class="card-label">Orçamento mensal</p><p class="summary-value">${money.format(6050)}</p><p class="summary-detail">Distribuído em 6 categorias</p></article><article class="card summary-card"><p class="card-label">Utilizado</p><p class="summary-value">${money.format(4615.50)}</p><p class="summary-detail">76,3% do planejado</p></article><article class="card summary-card"><p class="card-label">Disponível</p><p class="summary-value positive">${money.format(1434.50)}</p><p class="summary-detail">Até o fim do mês</p></article><article class="card summary-card"><p class="card-label">Meta de reserva</p><p class="summary-value">${money.format(1800)}</p><p class="summary-detail">67% concluída</p></article></div>
  <div class="plan-grid" style="margin-top:14px">${plans.map(p => `<article class="card"><h3>${p.name}</h3><p>${money.format(p.spent)} de ${money.format(p.limit)}</p><div class="progress ${p.cls}"><span style="width:${Math.min(100, p.spent/p.limit*100)}%"></span></div><div class="progress-meta" style="margin-top:9px"><span>${Math.round(p.spent/p.limit*100)}% utilizado</span><strong>${money.format(p.limit-p.spent)}</strong></div></article>`).join('')}</div>`;
}

function drawChart() {
  const canvas = document.getElementById('cash-chart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
  const w = rect.width, h = rect.height, pad = 28;
  const income = [1200, 2400, 2600, 5300, 6200, 7850, 9100];
  const expense = [520, 980, 1350, 1740, 2300, 2840, 3380];
  ctx.strokeStyle = '#e2e5ed'; ctx.lineWidth = 1;
  for (let i=0;i<5;i++) { const y=pad+(h-pad*2)*i/4; ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke(); }
  const line = (values, color) => { ctx.beginPath(); values.forEach((v,i) => { const x=pad+(w-pad*2)*i/(values.length-1); const y=h-pad-(v/10000)*(h-pad*2); i?ctx.lineTo(x,y):ctx.moveTo(x,y); });ctx.strokeStyle=color;ctx.lineWidth=3;ctx.lineJoin='round';ctx.stroke(); };
  line(income, '#168a68'); line(expense, '#d85c55');
  ctx.font='11px system-ui';ctx.fillStyle='#697084';ctx.fillText('Receitas', pad, 15);ctx.fillStyle='#168a68';ctx.fillRect(pad+48,8,16,3);ctx.fillStyle='#697084';ctx.fillText('Despesas', pad+80,15);ctx.fillStyle='#d85c55';ctx.fillRect(pad+134,8,16,3);
}

function render() {
  const titles = { dashboard: 'Dashboard', transactions: 'Transações', invoice: 'Fatura do cartão', planning: 'Planejamento' };
  document.getElementById('current-period').textContent = capitalize(monthLabel.format(now));
  document.getElementById('page-title').textContent = titles[state.page];
  document.getElementById('view').innerHTML = ({ dashboard, transactions, invoice, planning })[state.page]();
  renderNav();
  document.querySelectorAll('#view [data-page]').forEach(button => button.addEventListener('click', () => { state.page=button.dataset.page; render(); }));
  if (window.lucide) lucide.createIcons();
  requestAnimationFrame(drawChart);
}

function capitalize(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
function shortMonth() { return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(now).replace('.', ''); }
function toast(message) { const el=document.getElementById('toast');el.textContent=message;el.classList.add('visible');setTimeout(()=>el.classList.remove('visible'),2400); }

document.getElementById('add-transaction').addEventListener('click', () => document.getElementById('transaction-dialog').showModal());
document.getElementById('transaction-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.transactions.unshift({ id: Date.now(), description: data.get('description'), category: data.get('category'), amount: Number(data.get('amount')), type: data.get('type'), date: new Date(), icon: 'receipt-text' });
  document.getElementById('transaction-dialog').close();
  render(); toast('Transação adicionada à demonstração');
});
window.addEventListener('resize', () => requestAnimationFrame(drawChart));
window.addEventListener('DOMContentLoaded', render);

