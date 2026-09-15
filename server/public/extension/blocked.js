const domain = new URLSearchParams(location.search).get('domain') || 'Social Media';
document.getElementById('title').textContent = `${domain} is paused`;
chrome.storage.local.get('appUrl', data => {
  const appUrl = typeof data.appUrl === 'string' && /^https?:\/\//.test(data.appUrl) ? data.appUrl : '';
  document.getElementById('app').href = `${appUrl}/focus`;
});
document.getElementById('pass').addEventListener('click', () => chrome.runtime.sendMessage({ type: 'TEMPORARY_PASS', domain }, response => {
  if (response?.success) location.href = `https://${domain}`;
}));
