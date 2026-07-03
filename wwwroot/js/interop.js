// Minimal localStorage bridge for Blazor WASM (no backend). Loaded as a
// plain global script and called via IJSRuntime.InvokeAsync("localStorageInterop.*").
window.localStorageInterop = {
  getItem: function (key) {
    return localStorage.getItem(key);
  },
  setItem: function (key, value) {
    localStorage.setItem(key, value);
  },
};
