function sync() {
  let platforms = {};
  let custom = [];
  try { platforms = JSON.parse(localStorage.getItem('addiin_blocked_platforms') || '{}'); } catch {}
  try { custom = JSON.parse(localStorage.getItem('addiin_custom_domains') || '[]'); } catch {}
  chrome.storage.local.set({ shieldActive: localStorage.getItem('addiin_shield_active') === 'true', platforms, custom, appUrl: window.location.origin });
}
window.addEventListener('message', event => {
  if (event.source === window && event.data?.type === 'ADDIIN_SHIELD_UPDATE') chrome.storage.local.set({ shieldActive: event.data.active === true, platforms: event.data.platforms || {}, custom: Array.isArray(event.data.custom) ? event.data.custom : [], appUrl: window.location.origin });
});
sync();
