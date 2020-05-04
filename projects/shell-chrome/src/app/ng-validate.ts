export interface AngularDetection {
  isIvy: boolean;
  isAngular: boolean;
  isDebugMode: boolean;
  isSupportedAngularVersion: boolean;
}

window.addEventListener('message', (event: MessageEvent) => {
  if (event.source === window && event.data) {
    chrome.runtime.sendMessage(event.data);
  }
});

function detectAngular(win: Window): void {
  const isDebugMode = Boolean((win as any).ng);
  const ngVersionElement = document.querySelector('[ng-version]');
  let isSupportedAngularVersion = false;
  let isAngular = false;
  if (ngVersionElement) {
    isAngular = true;
    const attr = ngVersionElement.getAttribute('ng-version');
    const major = attr ? parseInt(attr.split('.')[0], 10) : -1;
    // In case of g3 apps we support major 0.
    if (attr && (major >= 9 || major === 0)) {
      isSupportedAngularVersion = true;
    }
  }

  win.postMessage(
    {
      // Needs to be inline because we're stringifying
      // this function and executing it with eval.
      isIvy: !!(window as any).getAllAngularRootElements?.()?.[0]?.__ngContext__,
      isAngular,
      isDebugMode,
      isSupportedAngularVersion,
    } as AngularDetection,
    '*'
  );
}

function installScript(fn: string): void {
  const source = `;(${fn})(window)`;
  const script = document.createElement('script');
  script.textContent = source;
  document.documentElement.appendChild(script);
  const parentElement = script.parentElement;
  if (parentElement) {
    parentElement.removeChild(script);
  }
}

if (document instanceof HTMLDocument) {
  installScript(detectAngular.toString());
}
