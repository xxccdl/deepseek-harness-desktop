// True three-key global hotkey (Ctrl+D+S) for the quick-chat panel.
//
// Electron's globalShortcut cannot do this: on Windows it maps to
// RegisterHotKey which only accepts ONE non-modifier key, so a
// "CommandOrControl+D+S" accelerator is silently reduced to Ctrl+S (the last
// plain key wins) and Ctrl+S alone also triggers. We therefore install a
// low-level keyboard hook (WH_KEYBOARD_LL) through koffi (a pure N-API FFI
// already present in the dependency tree) and detect the exact Ctrl+D+S
// chord ourselves — Ctrl+S alone is passed through untouched.

"use strict";

const koffi = require("koffi");

const WH_KEYBOARD_LL = 13;
const WM_KEYDOWN = 0x0100;
const WM_SYSKEYDOWN = 0x0104;
const VK_CONTROL = 0x11;
const VK_D = 0x44;
const VK_S = 0x53;
const KEY_DOWN = 0x8000;
/** Debounce repeated firings while the chord is held. */
const FIRE_COOLDOWN_MS = 300;

const user32 = koffi.load("user32.dll");

// KBDLLHOOKSTRUCT (x64): four DWORDs then a ULONG_PTR, 24 bytes total.
const KBDLLHOOKSTRUCT = koffi.struct("KBDLLHOOKSTRUCT", {
  vkCode: "uint32",
  scanCode: "uint32",
  flags: "uint32",
  time: "uint32",
  dwExtraInfo: "uintptr"
});

// LRESULT CALLBACK LowLevelKeyboardProc(int nCode, WPARAM wParam, LPARAM lParam)
koffi.proto("LowLevelKeyboardProc", "intptr", ["int32", "uintptr", "uintptr"]);

const SetWindowsHookExW = user32.func("SetWindowsHookExW", "void *", ["int32", "void *", "void *", "uint32"]);
const CallNextHookEx = user32.func("CallNextHookEx", "intptr", ["void *", "int32", "uintptr", "uintptr"]);
const UnhookWindowsHookEx = user32.func("UnhookWindowsHookEx", "int32", ["void *"]);
const GetAsyncKeyState = user32.func("GetAsyncKeyState", "int16", ["int32"]);

let hook = null; // HHOOK
let callback = null; // registered koffi callback
let onTrigger = null;
let lastFired = 0;

function down(vk) {
  return (GetAsyncKeyState(vk) & KEY_DOWN) !== 0;
}

const proc = (nCode, wParam, lParam) => {
  if (nCode >= 0 && (wParam === WM_KEYDOWN || wParam === WM_SYSKEYDOWN)) {
    try {
      const kb = koffi.decode(lParam, KBDLLHOOKSTRUCT);
      const vk = kb.vkCode;
      if (vk === VK_D || vk === VK_S) {
        const other = vk === VK_D ? VK_S : VK_D;
        if (down(VK_CONTROL) && down(other)) {
          const now = Date.now();
          if (now - lastFired > FIRE_COOLDOWN_MS) {
            lastFired = now;
            try { onTrigger?.(); } catch { /* keep the hook alive */ }
          }
          return 1; // consume the chord so nothing else sees it
        }
      }
    } catch { /* malformed message — pass through */ }
  }
  return CallNextHookEx(hook, nCode, wParam, lParam);
};

/**
 * Install the Ctrl+D+S low-level hook.
 * @param handler - fired when the exact chord is pressed.
 * @returns true when the hook is installed.
 */
function install(handler) {
  if (hook !== null) return true;
  onTrigger = handler;
  try {
    callback = koffi.register(proc, "LowLevelKeyboardProc");
    hook = SetWindowsHookExW(WH_KEYBOARD_LL, callback, null, 0);
    if (hook === null) {
      koffi.unregister(callback);
      callback = null;
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Remove the hook. Safe to call multiple times. */
function uninstall() {
  if (hook !== null) {
    try { UnhookWindowsHookEx(hook); } catch { /* ignore */ }
    hook = null;
  }
  if (callback !== null) {
    try { koffi.unregister(callback); } catch { /* ignore */ }
    callback = null;
  }
  onTrigger = null;
}

module.exports = { install, uninstall };
