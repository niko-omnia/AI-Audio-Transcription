let isRecording = false;

async function ensureOffscreen() {
  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["USER_MEDIA"],
      justification: "Audio recording"
    });
  } catch (e: any) {}
}

function start_rec() {
  chrome.action.setBadgeText({ text: "REC" });
  chrome.action.setBadgeBackgroundColor({ color: "red" });
}

function stop_rec() {
  chrome.action.setBadgeText({ text: "" });
  chrome.action.setBadgeBackgroundColor({ color: "white" });
}

let executedIn: number[] = [];

chrome.runtime.onMessage.addListener(async (msg, sender) => {
  // START
  if (msg.type === "START_RECORDING") {
    isRecording = true;

    start_rec();

    await chrome.storage.local.set({ isRecording: true });
    await ensureOffscreen();

    chrome.runtime.sendMessage({
      type: "OFFSCREEN_START"
    });
  }

  // STOP
  if (msg.type === "STOP_RECORDING") {
    isRecording = false;

    stop_rec();

    await chrome.storage.local.set({ isRecording: false });

    chrome.runtime.sendMessage({
      type: "OFFSCREEN_STOP"
    });
  }

  // STATE
  if (msg.type === "GET_STATE") {
    const state = await chrome.storage.local.get("isRecording");

    chrome.runtime.sendMessage({
      type: "STATE",
      isRecording: state.isRecording ?? false
    });
  }

  // ⭐ ADD THIS: forward transcript to active tab
  if (msg.type === "TRANSCRIBED_TEXT") {
    console.log("background received transcription", msg.text);

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
    console.log(tab, tab.id);

    if (!tab?.id) return;
    
    if (!executedIn.includes(tab.id)) {
      executedIn.push(tab.id);

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["contentScript.js"]
      });
    }
    
    chrome.tabs.sendMessage(tab.id, {
      type: "TRANSCRIBED_TEXT",
      text: msg.text
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-recording") {
    isRecording = !isRecording;

    await chrome.storage.local.set({ isRecording });

    if (isRecording) {
      start_rec();

      await ensureOffscreen();
      chrome.runtime.sendMessage({ type: "OFFSCREEN_START" });
    } else {
      stop_rec();
      chrome.runtime.sendMessage({ type: "OFFSCREEN_STOP" });
    }
  }
});

export {};
