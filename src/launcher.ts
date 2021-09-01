import { window } from "vscode";
import { ctx } from "./Context";
import { composeUrl, Config } from "./config";
// import { closePanel } from "./example/open";
import { updateStatusBar } from "./statusBar";
import { laravelTerminal, viteTerminal } from "./terminal";
import { waitFor, getName, tryPort } from "./utils";
export async function start({
  mode = "dev",
  searchPort = !ctx.active,
  waitForStart = true,
  stopPrevious = true,
} = {}) {
  if (stopPrevious) stop();
  //   if (mode !== ctx.currentMode) closePanel();
  ctx.currentMode = mode as any;

  await startVite();
  await startLaravel();
  if (waitForStart) {
    var error = null;
    const { laravel, vite } = ctx;
    [laravel, vite].map(async (project) => {
      !(await waitFor(
        project.url,
        Config.pingInterval,
        Config.maximumTimeout
      )) && (error = project.title);
    });
    if (error) {
      window.showErrorMessage(`❗️ Failed to start ${error} server`);
      stop();
    } else {
      if (Config.notifyOnStarted) {
        window.showInformationMessage(
          mode === "build"
            ? `📦 ${getName(ctx.vite.command)} build served at ${ctx.vite.url}`
            : `⚡️ ${getName(ctx.laravel.command)} spa started at ${
                ctx.laravel.url
              }`
        );
      }
    }
  }
  ctx.active = true;
  updateStatusBar();

  async function startLaravel() {
    const laravel = ctx.laravel;
    if (!laravel.port || searchPort)
      laravel.port = await tryPort(Config.laravelPort);
    laravel.url = composeUrl(laravel.port);
    const terminal = laravelTerminal();
    ctx.ext.globalState.update(terminal.stateKey("port"), laravel.port);
    if (mode == "dev") {
      let command = "php artisan serve";
      command += ` --port=${laravel.port}`;

      terminal.executeCommand(command);
    }
  }
  async function startVite() {
    const vite = ctx.vite;
    if (!vite.port || searchPort) vite.port = await tryPort(Config.vitePort);
    vite.url = composeUrl(vite.port);
    const terminal = viteTerminal();
    ctx.ext.globalState.update(terminal.stateKey("port"), vite.port);
    if (mode == "dev") {
      let command = Config.devCommand;
      if (!command) {
        command =
          vite.command === "vite"
            ? "npm run dev"
            : Config.vitepressBase
            ? `npx vitepress dev ${Config.vitepressBase}`
            : "npx vitepress";
      }

      command += ` --port=${vite.port}`;

      terminal.executeCommand(command);
    } else {
      if (Config.buildCommand) terminal.executeCommand(Config.buildCommand);

      // if (vite.command === "vitepress") {
      //   let path = ".vitepress/dist";
      //   if (Config.vitepressBase) path = `${Config.vitepressBase}/${path}`;

      //   terminal.executeCommand(
      //     `npx live-server ${path} --port=${vite.port} --no-browser`
      //   );
      // } else {
      terminal.executeCommand(
        `npx live-server dist --port=${vite.port} --no-browser`
      );
      // }
    }
  }
}

export function stop() {
  ctx.active = ctx.laravel.active = ctx.vite.active = false;
  laravelTerminal().endProcess();
  viteTerminal().endProcess();
  updateStatusBar();
}
