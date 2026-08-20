// 捕獲後の釣りスポット再出現演出
// 6つの円と魚影をいったん薄くして消し、新しい配置を浮かび上がらせてから操作可能にする。
(() => {
  const FADE_OUT = 450;
  const HOLD = 180;
  const FADE_IN = 900;

  function install() {
    const pond = document.getElementById('pond');
    if (!pond || typeof window.shadows !== 'function') return false;

    const originalShadows = window.shadows;
    if (originalShadows.__spotResetWrapped) return true;

    const wrapped = function () {
      pond.classList.remove('spot-reset-in');
      pond.classList.add('spot-reset-out');

      // 消え切るまでタップを受け付けない
      pond.style.pointerEvents = 'none';

      setTimeout(() => {
        originalShadows();
        pond.classList.remove('spot-reset-out');
        pond.classList.add('spot-reset-in');

        setTimeout(() => {
          pond.classList.remove('spot-reset-in');
          pond.style.pointerEvents = '';
        }, FADE_IN);
      }, FADE_OUT + HOLD);
    };

    wrapped.__spotResetWrapped = true;
    window.shadows = wrapped;
    return true;
  }

  const style = document.createElement('style');
  style.textContent = `
    #pond.spot-reset-out {
      animation: spotFadeOut ${FADE_OUT}ms ease-out forwards !important;
    }
    #pond.spot-reset-out .spot,
    #pond.spot-reset-out .shadow {
      animation: none !important;
    }
    #pond.spot-reset-in {
      animation: spotFadeIn ${FADE_IN}ms ease-out forwards !important;
    }
    #pond.spot-reset-in .spot {
      animation: spotCircleRise ${FADE_IN}ms ease-out both !important;
    }
    #pond.spot-reset-in .shadow {
      animation: fishShadowRise ${FADE_IN}ms ease-out both !important;
    }
    @keyframes spotFadeOut {
      from { opacity: 1; transform: scale(1); filter: brightness(1); }
      to { opacity: 0; transform: scale(.96); filter: brightness(.35); }
    }
    @keyframes spotFadeIn {
      from { opacity: 0; transform: scale(.96); filter: brightness(.35); }
      to { opacity: 1; transform: scale(1); filter: brightness(1); }
    }
    @keyframes spotCircleRise {
      from { opacity: 0; transform: translateY(10px) scale(.94); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes fishShadowRise {
      from { opacity: 0; transform: translate(-50%, -50%) translateY(12px) scale(.72); }
      to { opacity: 1; transform: translate(-50%, -50%) translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
