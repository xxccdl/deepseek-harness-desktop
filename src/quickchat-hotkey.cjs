// True three-key global hotkey (Ctrl+D+S) for the quick-chat panel.
//
// Electron's globalShortcut cannot do this: on Windows it maps to
// RegisterHotKey which only accepts ONE non-modifier key, so a
// "CommandOrControl+D+S" accelerator is silently reduced to Ctrl+S (the last
// plain key wins) and Ctrl+S alone also triggers.
//
// A WH_KEYBOARD_LL hook would also work, but its callback is only dispatched
// while the installing thread pumps Windows messages — the Electron main
// process's Node thread has no message pump, so the hook never fires. Instead
// we poll GetAsyncKeyState: it reads the current global keyboard state (no
// message loop needed, works from any foreground app) and we fire on the
// rising edge of the exact Ctrl+D+S chord. Ctrl+S alone never matches.

"use strict";

const koffi = require("koffi");

const VK_CONTROL = 0x11;
const VK_D = 0x44;
const VK_S = 0x53;
const KEY_DOWN = 0x8000;
/** Poll interval — short enough to feel instant, long enough to stay cheap. */
const POLL_MS = 50;
/** Debounce repeated fires while the chord is held. */
const FIRE_COOLDOWN_MS = 350;

const user32 = koffi.load("user32.dll");
const GetAsyncKeyState = user32.func("GetAsyncKeyState", "int16", ["int32"]);

let onTrigger = null;
let timer = null;
let prevDown = false;
let lastFired = 0;

function down(vk) {
  return (GetAsyncKeyState(vk) & KEY_DOWN) !== 0;
}

/** True when exactly Ctrl+D+S are held together (other keys don't matter). */
function chordDown() {
  return down(VK_CONTROL) && down(VK_D) && down(VK_S);
}

/**
 * Install the Ctrl+D+S poller.
 * @param handler - fired on each fresh press of the exact chord.
 * @returns true.
 */
function install(handler) {
  if (timer !== null) return true;
  onTrigger = handler;
  prevDown = chordDown();
  timer = setInterval(() => {
    let now = false;
    try {
      now = chordDown();
    } catch { /* transient FFI failure — keep polling */ }
    if (now && !prevDown) {
      const t = Date.now();
      if (t - lastFired > FIRE_COOLDOWN_MS) {
        lastFired = t;
        try { onTrigger?.(); } catch { /* keep polling */ }
      }
    }
    prevDown = now;
  }, POLL_MS);
  return true;
}

/** Remove the poller. Safe to call multiple times. */
function uninstall() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  onTrigger = null;
}

module.exports = { install, uninstall };
