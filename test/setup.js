/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const fetch = require("node-fetch");
const atob = require("atob");
const btoa = require("btoa");
require("ts-node").register({ project: path.resolve("tsconfig.json") });

const register = require("@babel/register").default;

register({
  extensions: [".ts", ".js"],
});

global.fetch = fetch;
global.atob = atob;
global.btoa = btoa;
