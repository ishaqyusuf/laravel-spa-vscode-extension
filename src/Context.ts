import { ExtensionContext, StatusBarItem, Terminal } from "vscode";
import type { PackageJson } from "types-package-json";

export interface Context {
  title: String;
  terminal?: Terminal;
  currentMode: "dev" | "serve";
  active: boolean;
  port?: number;
  url: string;
  panel?: any;
  command: "vite" | "artisan";
  packageJSON?: Partial<PackageJson>;
}
export interface ProjectContext {
  active: boolean;
  packageJSON?: Partial<PackageJson>;
  composerJSON?: Partial<any>;
  panel?: any;
  currentMode: "dev" | "serve";
  ext: ExtensionContext;
  statusBar: StatusBarItem;
  laravel: Context;
  vite: Context;
}
const vite = {
  active: false,
  title: "Vite",
  currentMode: "dev",
  command: "vite",
} as Partial<Context>;
const laravel = {
  active: false,
  title: "Laravel",
  currentMode: "dev",
  command: "artisan",
} as Partial<Context>;
export const ctx = {
  vite,
  laravel,
} as ProjectContext;
