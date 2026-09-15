const DEFAULT_BLOCKED = { facebook: ['facebook.com', 'messenger.com'], instagram: ['instagram.com'], x: ['x.com', 'twitter.com'], tiktok: ['tiktok.com'], youtube: ['youtube.com'] };
const passes = {};
function normalize(value) { return typeof value === 'string' ? value.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0].replace(/[^a-z0-9.-]/g, '') : ''; }
async function blocked(url) {
  try {
    const hostname = normalize(new URL(url).hostname);
    const data = await chrome.storage.local.get(['shieldActive', 'platforms', 'custom']);
    if (data.shieldActive !== true || !hostname || (passes[hostname] && passes[hostname] > Date.now())) return false;
    const domains = [];
    Object.entries(DEFAULT_BLOCKED).forEach(([key, values]) => { if (!data.platforms || data.platforms[key] !== false) domains.push(...values); });
    if (Array.isArray(data.custom)) domains.push(...data.custom.map(normalize).filter(Boolean));
    return domains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch { return false; }
}
async function inspect(tabId, url) {
  if (await blocked(url)) chrome.tabs.update(tabId, { url: `${chrome.runtime.getURL('blocked.html')}?domain=${encodeURIComponent(new URL(url).hostname)}` });
}
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => inspect(tabId, changeInfo.url || tab.url));
chrome.webNavigation.onBeforeNavigate.addListener(details => { if (details.frameId === 0) inspect(details.tabId, details.url); });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'TEMPORARY_PASS') { const domain = normalize(message.domain); if (domain) passes[domain] = Date.now() + 300000; sendResponse({ success: Boolean(domain) }); }
});
