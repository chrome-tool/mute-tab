document.addEventListener("DOMContentLoaded", function () {
  const muteUnmuteTab = document.getElementById("muteUnmuteTab");
  const muteUnmuteAllTabs = document.getElementById("muteUnmuteAllTabs");
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    tabs.forEach((tab) => {
      if (tab.active) {
        muteUnmuteTab.checked = tab.mutedInfo.muted;
      }
    });

    let isAllMuted = tabs.reduce((acc, curr) => {
      return acc && curr.mutedInfo.muted;
    }, true);
    muteUnmuteAllTabs.checked = isAllMuted;
  });

  muteUnmuteTab.addEventListener("change", function (e) {
    muteOrUnmuteCurrnetTab(e.target.checked);
  });
  muteUnmuteAllTabs.addEventListener("change", function (e) {
    muteAllOrUnmuteAllTab(e.target.checked);
  });

  document.getElementById("muteUnmuteTabsLabel").innerHTML =
    chrome.i18n.getMessage("muteUnmuteTab");
  document.getElementById("muteUnmuteAllTabsLabel").innerHTML =
    chrome.i18n.getMessage("muteUnmuteAllTabs");
});

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  switch (request.action) {
    case "muteUnmuteTab":
      const muteUnmuteTab = document.getElementById("muteUnmuteTab");
      muteUnmuteTab.checked = request.isMuted;
      muteOrUnmuteCurrnetTab(request.isMuted);
      break;
    case "muteUnmuteAllTabs":
      const muteUnmuteAllTabs = document.getElementById("muteUnmuteAllTabs");
      muteUnmuteAllTabs.checked = request.isMuted;
      muteAllOrUnmuteAllTab(request.isMuted);
      break;
  }
});

async function muteOrUnmuteCurrnetTab(muted) {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    async function (tabs) {
      await chrome.tabs.update(tabs[0].id, { muted: muted });
      await chrome.runtime.sendMessage({
        action: "updateIcon",
        isMuted: muted,
      });
    }
  );
  const muteUnmuteAllTabs = document.getElementById("muteUnmuteAllTabs");
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    let isAllMuted = tabs.reduce((acc, curr) => {
      if (curr.active) return acc && muted;
      else return acc && curr.mutedInfo.muted;
    }, true);
    muteUnmuteAllTabs.checked = isAllMuted;
  });
}

async function muteAllOrUnmuteAllTab(muted) {
  const muteUnmuteTab = document.getElementById("muteUnmuteTab");
  muteUnmuteTab.checked = muted;
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    for (var i = 0; i < tabs.length; i++) {
      chrome.tabs.update(tabs[i].id, { muted: muted });
    }
  });
  await chrome.runtime.sendMessage({
    action: "updateIcon",
    isMuted: muted,
  });
}
