/* eslint-disable import/no-extraneous-dependencies */
import register from "@babel/register";
import atob from "atob";
import btoa from "btoa";
import path from "path";
import { register as tsRegister } from "ts-node";

tsRegister({ project: path.resolve("tsconfig.json") });

register({
  extensions: [".ts", ".js"],
});

global.atob = atob;
global.btoa = btoa;
