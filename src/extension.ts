import { commands, ExtensionContext, window } from "vscode";
import { Config } from "./config";
import { ctx } from "./Context";
import { start, stop } from "./launcher";
import { tryRecoverState } from "./recover";
import { showCommands } from "./showCommands";
import { updateStatusBar } from "./statusBar";
import { laravelTerminal, viteTerminal } from "./terminal";
import { isLaravelSpaProject, loadPackageJSON } from "./utils";

export async function activate(ext: ExtensionContext) {
  ctx.ext = ext;
  commands.registerCommand("laraspa.stop", stop);
  commands.registerCommand("laraspa.start", start);
  commands.registerCommand("laraspa.showCommands", showCommands);

  window.onDidCloseTerminal((e) => {
    if (e === ctx.laravel.terminal || e === ctx.vite.terminal) {
      stop();
      ctx.laravel.terminal = ctx.vite.terminal = undefined!;
    }
  });

  ctx.packageJSON = loadPackageJSON();

  if (!isLaravelSpaProject()) return;

  await tryRecoverState();

  updateStatusBar();

  if (Config.autoStart) {
    //
  }
}
export async function deactivate() {
  laravelTerminal().closeTerminal();
  viteTerminal().closeTerminal();
}
