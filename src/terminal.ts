import { window } from "vscode";
import { Config } from "./config";
import { Context, ctx } from "./Context";
import { timeout } from "./utils";

export function terminal(project: Context) {
  // return {
  function isTerminalActive() {
    return project.terminal && project.terminal.exitStatus == null;
  }
  function ensureTerminal() {
    if (isTerminalActive()) return;

    project.terminal = window.createTerminal();
  }
  function closeTerminal() {
    if (isTerminalActive()) {
      project.terminal?.sendText("\x03");
      project.terminal?.dispose();
      project.terminal = undefined!;
    }
  }
  function endProcess() {
    if (isTerminalActive()) project.terminal?.sendText("\x03");
    ctx.ext.globalState.update(stateKey("pid"), undefined);
  }
  function stateKey(key: string) {
    return [project.title, key].join("-");
  }
  async function executeCommand(cmd: string) {
    ensureTerminal();
    project.terminal?.sendText(cmd);
    if (Config.showTerminal) project.terminal?.show(false);
    await timeout(2000);
    const pid = await project.terminal?.processId;
    if (pid) ctx.ext.globalState.update(stateKey("pid"), pid);
  }
  return {
    ensureTerminal,
    isTerminalActive,
    closeTerminal,
    endProcess,
    stateKey,
    executeCommand,
  };
}

export function laravelTerminal() {
  return terminal(ctx.laravel);
}
export function viteTerminal() {
  return terminal(ctx.vite);
}
