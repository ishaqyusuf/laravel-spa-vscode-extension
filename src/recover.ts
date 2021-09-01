import { window } from "vscode";
import { composeUrl } from "./config";
import { ctx } from "./Context";
import {
  laravelTerminal,
  terminal as _terminal,
  viteTerminal,
} from "./terminal";
import { ping } from "./utils";
export async function tryRecoverTerminal() {
  const { laravel, vite } = ctx;
  let recovered = 0;
  [laravel, vite].map(async (project) => {
    if (laravel.terminal && vite.terminal) return;
    const projTerminal = _terminal(project);
    const pid = ctx.ext.globalState.get(projTerminal.stateKey("pid"));
    if (!pid) return;

    const terminals = await Promise.all(
      window.terminals.map(async (i) => {
        return pid === (await i.processId) ? i : undefined;
      })
    );

    const terminal = terminals.find((i) => i);

    // console.log('terminal!!')
    if (terminal) {
      project.terminal = terminal;
      recovered++;
    }
  });
  return recovered == 2;
}

export async function tryRecoverState() {
  if (!(await tryRecoverTerminal())) return;
  const [port1, port2] = [
    laravelTerminal().stateKey("port"),
    viteTerminal().stateKey("port"),
  ].map((p) => +(p || 0));
  //   const port = +(ctx.ext.globalState.get<number>("port") || 0);
  if (!port1 || !port2) return;

  const url1 = composeUrl(port1);
  const url2 = composeUrl(port2);
  if (!(await ping(url1)) || !(await ping(url2))) return;

  ctx.active = true;
  ctx.vite.url = url2;
  ctx.laravel.url = url1;
  ctx.currentMode = ctx.ext.globalState.get("mode") || "dev";
  return true;
}
