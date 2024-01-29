chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.query(
    { active: true, windowId: activeInfo.windowId },
    async function (tabs) {
      if (tabs?.length > 0)
        await updateIcon(tabs[0].mutedInfo.muted, tabs[0].Id);
    }
  );
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case "updateIcon":
      updateIcon(request.isMuted);
      sendResponse();
      break;
  }
});

const MUTE_ICON = "../../icons/mute_icon.png";
const UNMUTE_ICON = "../../icons/unmute_icon.png";
async function updateIcon(isMuted, tabId = null) {
  if (tabId) {
    await chrome.action.setIcon({
      path: isMuted ? MUTE_ICON : UNMUTE_ICON,
      tabId: tabId,
    });
  } else {
    await chrome.action.setIcon({
      path: isMuted ? MUTE_ICON : UNMUTE_ICON,
    });
  }
}
chrome.commands.onCommand.addListener(function (command) {
  switch (command) {
    case "muteUnmuteTab":
      chrome.tabs.query(
        { active: true, currentWindow: true },
        async function (tabs) {
          if (tabs.length > 0)
            chrome.runtime.sendMessage({
              action: "muteUnmuteTab",
              isMuted: !tabs[0].mutedInfo.muted,
              tabId: tabs[0].id,
            });
        }
      );
      break;
    case "muteUnmuteAllTabs":
      chrome.tabs.query({ currentWindow: true }, function (tabs) {
        let isAllMuted = tabs.reduce((acc, curr) => {
          return acc && curr.mutedInfo.muted;
        }, true);
        chrome.runtime.sendMessage({
          action: "muteUnmuteAllTabs",
          isMuted: !isAllMuted,
        });
      });
      break;
  }
});
