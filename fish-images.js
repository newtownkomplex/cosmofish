// 魚図鑑用の画像ファイル対応表
// 魚データのIDと画像ファイルを1対1で管理する。
const fishImages = {
  1: 'images/fish-001.svg',
  2: 'images/fish-002.svg'
};

function getFishImage(fish) {
  return fishImages[fish.id] || '';
}

function setFishImage(fish) {
  const imageEl = document.querySelector('#detail .image');
  if (!imageEl) return;
  const src = getFishImage(fish);
  imageEl.textContent = '';
  imageEl.style.backgroundImage = src ? `url("${src}")` : '';
  imageEl.style.backgroundSize = 'cover';
  imageEl.style.backgroundPosition = 'center';
  imageEl.style.backgroundRepeat = 'no-repeat';
}

// 詳細画面が開いたときに、表示中の魚へ対応する画像を自動適用する。
function applyCurrentFishImage() {
  const detail = document.querySelector('#detail');
  const noEl = document.querySelector('#dno');
  if (!detail || !noEl) return;

  const match = noEl.textContent.match(/No\.\s*(\d+)/i);
  if (!match) return;

  const fish = fishData.find(f => f.id === Number(match[1]));
  if (fish) setFishImage(fish);
}

const imageObserver = new MutationObserver(() => {
  requestAnimationFrame(applyCurrentFishImage);
});

document.addEventListener('DOMContentLoaded', () => {
  const detail = document.querySelector('#detail');
  if (detail) imageObserver.observe(detail, { attributes: true, childList: true, subtree: true, characterData: true });
  applyCurrentFishImage();
});
