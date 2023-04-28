import register from "@babel/register";
import atob from "atob";
import btoa from "btoa";
import fetch from "node-fetch";
import path from "path";
import { register as tsRegister } from "ts-node";

tsRegister({ project: path.resolve("tsconfig.json") });

register({
  extensions: [".ts", ".js"],
});

global.fetch = fetch;
global.atob = atob;
global.btoa = btoa;
