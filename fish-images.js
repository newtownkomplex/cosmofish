// 魚図鑑用の画像ファイル対応表
// 魚データのIDと画像ファイルを1対1で管理する。
const fishImages = {
  1: 'images/fish-001.svg'
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
