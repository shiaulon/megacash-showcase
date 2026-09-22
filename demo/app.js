const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const now = new Date();
const periodKey = `${now.getFullYear()}-${now.getMonth()}`;
const storageKey = 'megacash-showcase-v2';
const safeDay = offset => new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - offset), 12);

function seedTransactions() {
  return [
    { id: 1, description: 'Salário', category: 'Receitas', amount: 7850, type: 'income', date: safeDay(8), icon: 'briefcase-business' },
    { id: 2, description: 'Supermercado Central', category: 'Alimentação', amount: 486.72, type: 'expense', date: safeDay(1), icon: 'shopping-cart' },
    { id: 3, description: 'Aluguel', category: 'Moradia', amount: 1850, type: 'expense', date: safeDay(5), icon: 'house' },
    { id: 4, description: 'Combustível', category: 'Transporte', amount: 240, type: 'expense', date: safeDay(2), icon: 'car' },
    { id: 5, description: 'Streaming e música', category: 'Assinaturas', amount: 74.80, type: 'expense', date: safeDay(3), icon: 'play' },
    { id: 6, description: 'Freelance', category: 'Receitas', amount: 1250, type: 'income', date: safeDay(12), icon: 'laptop' },
    { id: 7, description: 'Restaurante', category: 'Alimentação', amount: 138.40, type: 'expense', date: safeDay(0), icon: 'utensils' },
    { id: 8, description: 'Farmácia', category: 'Saúde', amount: 92.30, type: 'expense', date: safeDay(6), icon: 'heart-pulse' }
  ];
}

function initialState() { return { page: 'dashboard', transactions: seedTransactions() }; }
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.periodKey === periodKey && Array.isArray(saved.transactions)) {
      return { page: 'dashboard', transactions: saved.transactions.map(item => ({ ...item, date: new Date(item.date) })) };
    }
  } catch (_) {}
  return initialState();
}

let state = loadState();
const requestedPage = new URLSearchParams(window.location.search).get('screen');
if (['dashboard', 'transactions', 'invoice', 'planning', 'more'].includes(requestedPage)) state.page = requestedPage;
function saveState() { localStorage.setItem(storageKey, JSON.stringify({ periodKey, transactions: state.transactions })); }

const navigation = [
  { id: 'dashboard', label: 'Início', icon: 'layout-dashboard' },
  { id: 'transactions', label: 'Transações', icon: 'arrow-left-right' },
  { id: 'invoice', label: 'Fatura', icon: 'credit-card' },
  { id: 'planning', label: 'Planejar', icon: 'chart-no-axes-combined' },
  { id: 'more', label: 'Mais', icon: 'grid-2x2' }
];

function totals() {
  const income = state.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = state.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  return { income, expense, balance: 12480.35 + income - expense };
}

function navigate(page) { state.page = page; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function renderNav() {
  const extraPages = ['accounts', 'goals', 'reports', 'plans'];
  const markup = navigation.map(item => `<button class="nav-button ${state.page === item.id || (item.id === 'more' && extraPages.includes(state.page)) ? 'active' : ''}" data-page="${item.id}" type="button"><i data-lucide="${item.icon}"></i><span>${item.label}</span></button>`).join('');
  document.querySelector('.desktop-nav').innerHTML = markup;
  document.querySelector('.mobile-nav').innerHTML = markup;
  document.querySelectorAll('.desktop-nav [data-page], .mobile-nav [data-page]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.page)));
}

function txRow(transaction, removable = false) {
  const sign = transaction.type === 'income' ? '+' : '-';
  return `<div class="transaction-row"><div class="transaction-icon"><i data-lucide="${transaction.icon || 'receipt-text'}"></i></div><div class="transaction-copy"><strong>${escapeHtml(transaction.description)}</strong><span>${escapeHtml(transaction.category)} · ${shortDate.format(transaction.date)}</span></div><div class="transaction-actions"><div class="transaction-value ${transaction.type === 'income' ? 'positive' : 'negative'}">${sign} ${money.format(transaction.amount)}</div>${removable ? `<button class="delete-button" data-delete="${transaction.id}" title="Excluir" aria-label="Excluir transação"><i data-lucide="trash-2"></i></button>` : ''}</div></div>`;
}

function dashboard() {
  const { income, expense, balance } = totals();
  return `<div class="summary-grid"><article class="card summary-card"><p class="card-label">Saldo total</p><p class="summary-value">${money.format(balance)}</p><p class="summary-detail">Em 3 contas</p></article><article class="card summary-card"><p class="card-label">Receitas no mês</p><p class="summary-value positive">${money.format(income)}</p><p class="summary-detail positive">8,4% acima do anterior</p></article><article class="card summary-card"><p class="card-label">Despesas no mês</p><p class="summary-value negative">${money.format(expense)}</p><p class="summary-detail">${Math.round(expense / income * 100)}% da renda</p></article><article class="card summary-card"><p class="card-label">Fatura atual</p><p class="summary-value">${money.format(2148.90)}</p><p class="summary-detail">Fecha dia ${String(Math.min(28, now.getDate() + 6)).padStart(2, '0')}</p></article></div><div class="content-grid"><article class="card"><div class="section-header"><h2>Fluxo do mês</h2><span>Receitas e despesas</span></div><div class="chart-wrap"><canvas id="cash-chart"></canvas></div></article><article class="card"><div class="section-header"><h2>Movimentações recentes</h2><button class="text-button" data-page="transactions">Ver todas</button></div><div class="transaction-list">${state.transactions.slice().sort((a,b) => b.date-a.date).slice(0,5).map(t => txRow(t)).join('')}</div></article></div>`;
}

function transactions() {
  return `<article class="card"><div class="section-header"><div><h2>Movimentações</h2><span>${state.transactions.length} registros neste mês</span></div><span class="pill">Local</span></div><div class="transaction-list">${state.transactions.slice().sort((a,b) => b.date-a.date).map(t => txRow(t, true)).join('')}</div></article>`;
}

function invoice() {
  const closeDay = Math.min(28, now.getDate() + 6), dueDay = Math.min(28, closeDay + 7);
  return `<article class="card invoice-hero"><div><p class="card-label">Fatura de ${capitalize(monthLabel.format(now))}</p><p class="summary-value">${money.format(2148.90)}</p><p class="summary-detail">Limite disponível: ${money.format(7851.10)}</p></div><div class="invoice-meta"><div><span>Fechamento</span><strong>${closeDay} ${shortMonth()}</strong></div><div><span>Vencimento</span><strong>${dueDay} ${shortMonth()}</strong></div></div></article><div class="content-grid"><article class="card"><div class="section-header"><h2>Compras na fatura</h2><span>Final 2048</span></div>${state.transactions.filter(t => t.type === 'expense').slice(0,6).map(t => txRow(t)).join('')}</article><article class="card"><div class="section-header"><h2>Limite do cartão</h2><span>R$ 10.000</span></div><p class="summary-value">21,5%</p><div class="progress"><span style="width:21.5%"></span></div><p class="summary-detail" style="margin-top:12px">Compras após o fechamento entram automaticamente na próxima fatura.</p></article></div>`;
}

function planning() {
  const plans = [{name:'Alimentação',spent:1138.40,limit:1500,cls:''},{name:'Moradia',spent:1850,limit:2100,cls:'warning'},{name:'Transporte',spent:540,limit:900,cls:''},{name:'Lazer',spent:620,limit:700,cls:'danger'},{name:'Saúde',spent:292.30,limit:600,cls:''},{name:'Assinaturas',spent:174.80,limit:250,cls:''}];
  return `<div class="summary-grid"><article class="card summary-card"><p class="card-label">Orçamento</p><p class="summary-value">${money.format(6050)}</p><p class="summary-detail">6 categorias</p></article><article class="card summary-card"><p class="card-label">Utilizado</p><p class="summary-value">${money.format(4615.50)}</p><p class="summary-detail">76,3% planejado</p></article><article class="card summary-card"><p class="card-label">Disponível</p><p class="summary-value positive">${money.format(1434.50)}</p><p class="summary-detail">Até o fim do mês</p></article><article class="card summary-card"><p class="card-label">Reserva</p><p class="summary-value">${money.format(1800)}</p><p class="summary-detail">67% concluída</p></article></div><div class="plan-grid" style="margin-top:10px">${plans.map(p => `<article class="card"><h3>${p.name}</h3><p>${money.format(p.spent)} de ${money.format(p.limit)}</p><div class="progress ${p.cls}"><span style="width:${Math.min(100,p.spent/p.limit*100)}%"></span></div><div class="progress-meta" style="margin-top:9px"><span>${Math.round(p.spent/p.limit*100)}% utilizado</span><strong>${money.format(p.limit-p.spent)}</strong></div></article>`).join('')}</div>`;
}

function more() {
  const modules = [['accounts','landmark','Contas e cartões','Saldos e limites consolidados'],['goals','target','Metas','Objetivos e progresso mensal'],['reports','chart-pie','Relatórios','Análise por categoria'],['plans','badge-dollar-sign','Planos','Recursos Basic e Pro']];
  return `<div class="module-grid">${modules.map(([page,icon,title,text]) => `<button class="module-button" data-page="${page}" type="button"><i data-lucide="${icon}"></i><strong>${title}</strong><span>${text}</span></button>`).join('')}</div><article class="card" style="margin-top:10px"><div class="section-header"><h2>Conta demonstração</h2><span class="pill">Pro</span></div><p class="summary-detail">Ambiente local com dados fictícios. Nenhuma informação é enviada ao MegaCash ou ao Firebase.</p></article>`;
}

function accounts() {
  const items = [['landmark','Conta principal','Banco Inter',18698.13],['wallet-cards','Reserva','Banco do Brasil',8200],['credit-card','Cartão Mega','Limite disponível',7851.10]];
  return `<article class="card"><div class="section-header"><h2>Contas e cartões</h2><button class="text-button" data-page="more">Voltar</button></div>${items.map(i => `<div class="account-card"><div class="transaction-icon"><i data-lucide="${i[0]}"></i></div><div><strong>${i[1]}</strong><span>${i[2]}</span></div><strong>${money.format(i[3])}</strong></div>`).join('')}</article>`;
}

function goals() {
  const items = [['Reserva de emergência',12000,18000],['Viagem',4200,9000],['Novo notebook',3100,6000]];
  return `<article class="card"><div class="section-header"><h2>Metas financeiras</h2><button class="text-button" data-page="more">Voltar</button></div>${items.map(i => `<div class="goal-row"><div class="goal-head"><strong>${i[0]}</strong><span>${money.format(i[1])} de ${money.format(i[2])}</span></div><div class="progress"><span style="width:${i[1]/i[2]*100}%"></span></div></div>`).join('')}</article>`;
}

function reports() {
  const items = [['Moradia',1850,56],['Alimentação',1138,35],['Transporte',540,16],['Lazer',320,10],['Saúde',292,9]];
  return `<article class="card"><div class="section-header"><h2>Despesas por categoria</h2><button class="text-button" data-page="more">Voltar</button></div><div class="report-bars">${items.map(i => `<div class="report-bar"><strong>${i[0]}</strong><div class="progress"><span style="width:${i[2]}%"></span></div><span>${money.format(i[1])}</span></div>`).join('')}</div></article>`;
}

function plans() {
  return `<div class="plan-grid"><article class="card"><span class="pill">Atual</span><h2>Pro mensal</h2><p class="summary-value">R$ 29,90</p><p class="summary-detail">Todos os recursos, relatórios avançados, planejamento e maior capacidade.</p></article><article class="card"><h2>Basic anual</h2><p class="summary-value">R$ 179,00</p><p class="summary-detail">Controle financeiro essencial com economia no plano anual.</p></article></div><button class="text-button" data-page="more" style="margin-top:12px">Voltar aos módulos</button>`;
}

function drawChart() {
  const canvas=document.getElementById('cash-chart');if(!canvas)return;const dpr=window.devicePixelRatio||1,rect=canvas.getBoundingClientRect();canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const w=rect.width,h=rect.height,pad=28,income=[1200,2400,2600,5300,6200,7850,9100],expense=[520,980,1350,1740,2300,2840,3380];ctx.strokeStyle='#e2e5ed';ctx.lineWidth=1;for(let i=0;i<5;i++){const y=pad+(h-pad*2)*i/4;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke();}const line=(values,color)=>{ctx.beginPath();values.forEach((v,i)=>{const x=pad+(w-pad*2)*i/(values.length-1),y=h-pad-(v/10000)*(h-pad*2);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.strokeStyle=color;ctx.lineWidth=3;ctx.lineJoin='round';ctx.stroke();};line(income,'#168a68');line(expense,'#d85c55');ctx.font='11px system-ui';ctx.fillStyle='#697084';ctx.fillText('Receitas',pad,15);ctx.fillStyle='#168a68';ctx.fillRect(pad+48,8,16,3);ctx.fillStyle='#697084';ctx.fillText('Despesas',pad+80,15);ctx.fillStyle='#d85c55';ctx.fillRect(pad+134,8,16,3);
}

function render() {
  const views={dashboard,transactions,invoice,planning,more,accounts,goals,reports,plans};
  const titles={dashboard:'Dashboard',transactions:'Transações',invoice:'Fatura do cartão',planning:'Planejamento',more:'Mais recursos',accounts:'Contas e cartões',goals:'Metas',reports:'Relatórios',plans:'Planos'};
  document.getElementById('current-period').textContent=capitalize(monthLabel.format(now));document.getElementById('page-title').textContent=titles[state.page];document.getElementById('view').innerHTML=views[state.page]();renderNav();
  document.querySelectorAll('#view [data-page]').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.page)));
  document.querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',()=>{state.transactions=state.transactions.filter(t=>String(t.id)!==button.dataset.delete);saveState();render();toast('Transação removida');}));
  if(window.lucide)lucide.createIcons();requestAnimationFrame(drawChart);
}

function capitalize(value){return value.charAt(0).toUpperCase()+value.slice(1);}
function shortMonth(){return new Intl.DateTimeFormat('pt-BR',{month:'short'}).format(now).replace('.','');}
function escapeHtml(value){const div=document.createElement('div');div.textContent=String(value);return div.innerHTML;}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('visible');setTimeout(()=>el.classList.remove('visible'),2400);}

document.getElementById('add-transaction').addEventListener('click',()=>document.getElementById('transaction-dialog').showModal());
document.getElementById('transaction-form').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget);state.transactions.unshift({id:Date.now(),description:data.get('description'),category:data.get('category'),amount:Number(data.get('amount')),type:data.get('type'),date:new Date(),icon:'receipt-text'});saveState();document.getElementById('transaction-dialog').close();render();toast('Transação salva neste navegador');});
document.getElementById('reset-demo').addEventListener('click',()=>{localStorage.removeItem(storageKey);state=initialState();render();toast('Dados demonstrativos restaurados');});
window.addEventListener('resize',()=>requestAnimationFrame(drawChart));
window.addEventListener('DOMContentLoaded',render);
