import { generatePrivate } from "@toruslabs/eccrypto";
// import Torus from "@toruslabs/torus.js";
import assert from "assert";
import elliptic from "elliptic";

import Metadata from "../index";
import { keccak256 } from "../src/utils";

describe("Metadata", () => {
  const EC = elliptic.ec;
  const ec = new EC("secp256k1");
  const metadata = new Metadata();
  const privKey = generatePrivate();
  const keyPair = ec.keyFromPrivate(privKey);
  const pubKey = keyPair.getPublic();
  let randomMessage: string;
  describe("get", () => {
    it("should get nothing by default", async () => {
      const res = await metadata.getMetadata({ pub_key_X: pubKey.getX().toString(16), pub_key_Y: pubKey.getY().toString(16) }, null);
      assert.strictEqual(res, "");
    });
    it("should set", async () => {
      randomMessage = JSON.stringify({ message: keccak256(Buffer.from(Date.now().toString(), "utf-8")).toString("hex") });
      const params = metadata.generateMetadataParams(randomMessage, privKey.toString("hex"));
      await metadata.setMetadata(params, "metadata-test");
    });
    it("should get", async () => {
      const message = await metadata.getMetadata<string>(
        { pub_key_X: pubKey.getX().toString(16), pub_key_Y: pubKey.getY().toString(16) },
        "metadata-test"
      );
      assert.strictEqual(message, randomMessage);
    });
  });
});
