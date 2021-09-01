import { StatusBarAlignment, window } from "vscode";
import { ctx } from "./Context";

export function ensureStatusBar() {
  if (!ctx.statusBar) {
    ctx.statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 1000);
    ctx.statusBar.command = "laraspa.showCommands";
    ctx.statusBar.show();
  }
}

export function updateStatusBar() {
  ensureStatusBar();
  // if (ctx.command === "vitepress") {
  //   if (ctx.active) {
  //     ctx.statusBar.text =
  //       ctx.currentMode === "serve"
  //         ? "$(repo) VitePress (Build)"
  //         : "$(repo) VitePress";
  //     ctx.statusBar.color = "#42b883";
  //   } else {
  //     ctx.statusBar.text = "$(stop-circle) VitePress";
  //     ctx.statusBar.color = undefined;
  //   }
  // } else {
  if (ctx.active) {
    ctx.statusBar.text =
      ctx.currentMode === "serve"
        ? "$(symbol-event) Laravel Spa (Build)"
        : "$(symbol-event) Laravel-Spa";
    ctx.statusBar.color = "#ebb549";
  } else {
    ctx.statusBar.text = "$(stop-circle) Laravel Spa";
    ctx.statusBar.color = undefined;
  }
  // }
}
