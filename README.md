<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>NFT Market</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
:root {
  --bg: var(--tg-theme-bg-color, #0a0a0f);
  --text: var(--tg-theme-text-color, #ffffff);
  --hint: var(--tg-theme-hint-color, #8b8b9e);
  --btn: var(--tg-theme-button-color, #7c3aed);
  --btn-text: var(--tg-theme-button-text-color, #ffffff);
  --card: rgba(255, 255, 255, 0.06);
  --border: rgba(255, 255, 255, 0.1);
  --neon: #a855f7;
  --neon2: #06b6d4;
}
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  background: var(--bg);
  color: var(--text);
  padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
  min-height: 100vh;
  background-image: radial-gradient(circle at 20% 0%, rgba(168,85,247,0.15), transparent 50%),
                    radial-gradient(circle at 80% 100%, rgba(6,182,212,0.15), transparent 50%);
}
.header {
  padding: 20px 16px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(90deg, var(--neon), var(--neon2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.balance {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(10px);
}
.balance span { color: var(--neon2); }
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 16px 24px;
}
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease;
}
.card:active { transform: scale(0.97); }
.nft-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
}
.card-info { padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.nft-name { font-size: 14px; font-weight: 600; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nft-price {
  font-size: 13px;
  font-weight: 700;
  color: var(--neon2);
  display: flex;
  align-items: center;
  gap: 4px;
}
.buy-btn {
  margin: 0 12px 12px;
  border: none;
  border-radius: 12px;
  padding: 10px;
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(90deg, var(--neon), var(--neon2));
  color: #fff;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}
.buy-btn:active { opacity: 0.8; }
.buy-btn:disabled {
  background: var(--card);
  color: var(--hint);
  box-shadow: none;
  border: 1px solid var(--border);
}
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
}
.nav-item {
  font-size: 11px;
  color: var(--hint);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.nav-item.active { color: var(--neon); }
.nav-icon { font-size: 20px; }
</style>
</head>
<body>
  <div class="header">
    <h1>NFT Market</h1>
    <div class="balance">
      <span>◆</span> <span id="balanceVal">2.50 ETH</span>
    </div>
  </div>

  <div class="grid" id="nftGrid"></div>

  <div class="bottom-nav">
    <div class="nav-item active"><div class="nav-icon">◈</div>Витрина</div>
    <div class="nav-item"><div class="nav-icon">◉</div>Мои NFT</div>
    <div class="nav-item"><div class="nav-icon">◐</div>Профиль</div>
  </div>

<script>
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
tg.setHeaderColor('secondary_bg_color');
tg.BackButton.show();
tg.BackButton.onClick(() => tg.close());

let balance = 2.50;
const balanceEl = document.getElementById('balanceVal');

// Синтетические NFT-картинки (градиенты через SVG)
function makeSVG(c1, c2, emoji) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="200" height="200" fill="url(#g)"/>
    <text x="100" y="120" font-size="70" text-anchor="middle" fill="rgba(255,255,255,0.9)">${emoji}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const nfts = [
  { id: 1, name: 'Neon Ape', price: 0.15, img: makeSVG('#7c3aed', '#06b6d4', '🐵') },
  { id: 2, name: 'Cyber Cat', price: 0.08, img: makeSVG('#ec4899', '#f59e0b', '🐱') },
  { id: 3, name: 'Void Skull', price: 0.22, img: makeSVG('#111827', '#7c3aed', '💀') },
  { id: 4, name: 'Glitch Eye', price: 0.12, img: makeSVG('#06b6d4', '#10b981', '👁') },
  { id: 5, name: 'Pixel Crown', price: 0.30, img: makeSVG('#f59e0b', '#ef4444', '👑') },
  { id: 6, name: 'Quantum Orb', price: 0.18, img: makeSVG('#3b82f6', '#a855f7', '🔮') }
];

const grid = document.getElementById('nftGrid');

function render() {
  grid.innerHTML = '';
  nfts.forEach(nft => {
    const owned = nft.owned;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img class="nft-img" src="${nft.img}" alt="${nft.name}">
      <div class="card-info">
        <p class="nft-name">${nft.name}</p>
        <div class="nft-price">${nft.price.toFixed(2)} ETH</div>
      </div>
      <button class="buy-btn" ${owned ? 'disabled' : ''} data-id="${nft.id}">
        ${owned ? 'Куплено ✓' : 'Купить'}
      </button>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.id;
      const nft = nfts.find(n => n.id === id);
      if (nft.owned || balance < nft.price) {
        tg.HapticFeedback.notificationOccurred('error');
        tg.showAlert('Недостаточно средств');
        return;
      }
      balance -= nft.price;
      nft.owned = true;
      balanceEl.textContent = balance.toFixed(2) + ' ETH';
      tg.HapticFeedback.notificationOccurred('success');
      tg.showAlert(`Вы купили ${nft.name}!`);
      render();
    });
  });
}

render();
</script>
</body>
</html>
