// 魚図鑑用の画像ファイル対応表
// 実画像は images/ フォルダに分離して管理する。
const fishImages = {
  1: 'images/fish-001.jpg'
};

function getFishImage(fish) {
  return fishImages[fish.id] || '';
}

// 図鑑詳細画面が開いたとき、魚IDに対応する画像を自動表示する。
function updateFishImage() {
  const nameEl = document.getElementById('dn');
  const imageEl = document.querySelector('#detail .image');
  if (!nameEl || !imageEl || !window.fishData) return;
  const fish = fishData.find(f => f.name === nameEl.textContent);
  if (!fish) return;
  const src = getFishImage(fish);
  if (src) {
    imageEl.textContent = '';
    imageEl.style.backgroundImage = `url("${src}")`;
    imageEl.style.backgroundSize = 'cover';
    imageEl.style.backgroundPosition = 'center';
    imageEl.style.backgroundRepeat = 'no-repeat';
  } else {
    imageEl.textContent = 'FISH IMAGE';
    imageEl.style.backgroundImage = '';
  }
}

const imageObserver = new MutationObserver(updateFishImage);
function watchFishDetail() {
  const nameEl = document.getElementById('dn');
  if (nameEl) imageObserver.observe(nameEl, {childList:true,characterData:true,subtree:true});
  updateFishImage();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', watchFishDetail);
} else {
  watchFishDetail();
}