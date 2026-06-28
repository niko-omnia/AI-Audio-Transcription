/// <reference types="chrome" />

let lastText = "";
let lastTime = 0;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type == "PING") {
    console.log("PONG!");
    return;
  }

  if (msg.type !== "TRANSCRIBED_TEXT") return;

  const now = Date.now();

  if (msg.text === lastText && now - lastTime < 2000) return;

  lastText = msg.text;
  lastTime = now;

  document.execCommand("insertText", false, `${msg.text} `);
});

export {};
