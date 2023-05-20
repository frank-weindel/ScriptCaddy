class ThemeManager {
  _linkEl: HTMLLinkElement | undefined;

  onThemeLoad: ((str: CSSStyleDeclaration) => void) | undefined

  listThemes() {
    return [
      'dark',
      'light',
    ];
  }

  setTheme(theme: string) {
    let oldLinkEl;
    if (this._linkEl) {
      oldLinkEl = this._linkEl;
    }
    this._linkEl = document.createElement('link');
    this._linkEl.onload = () => {
      if (this.onThemeLoad) {
        this.onThemeLoad(window.getComputedStyle(document.documentElement));
      }
    };
    this._linkEl.rel = 'stylesheet';
    this._linkEl.href = `assets/themes/${theme}.css`;
    document.head.appendChild(this._linkEl);
    if (oldLinkEl) {
      oldLinkEl.remove();
    }
  }
}

export default new ThemeManager();
