// 魚図鑑用の画像ファイル対応表
// 画像は images/ フォルダに魚IDと同じ番号で登録する。
// 例: images/fish-001.jpg = 星屑あじ
const fishImages = {
  1: 'images/fish-001.jpg'
};

function getFishImage(fish) {
  return fishImages[fish.id] || '';
}