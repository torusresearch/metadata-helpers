import { generatePrivate } from "@toruslabs/eccrypto";
// import Torus from "@toruslabs/torus.js";
import assert from "assert";
import elliptic from "elliptic";

import MetadataStorageLayer from "../src/MetadataStorageLayer";
import { keccak256 } from "../src/utils";
import { getDeviceShare, getTorusShare, setDeviceShare, setTorusShare } from "../src/webAuthnShareResolver";

describe("Metadata", () => {
  const EC = elliptic.ec;
  const ec = new EC("secp256k1");
  const storage = new MetadataStorageLayer();
  const privKey = generatePrivate();
  const keyPair = ec.keyFromPrivate(privKey);
  const pubKey = keyPair.getPublic();
  let randomMessage: string;
  it("should get nothing by default", async () => {
    const res = await storage.getMetadata({ pub_key_X: pubKey.getX().toString(16), pub_key_Y: pubKey.getY().toString(16) }, null);
    assert.strictEqual(res, "");
  });
  it("should set", async () => {
    randomMessage = JSON.stringify({ message: keccak256(Buffer.from(Date.now().toString(), "utf-8")).toString("hex") });
    const params = storage.generateMetadataParams(randomMessage, privKey.toString("hex"));
    await storage.setMetadata(params, "metadata-test");
  });
  it("should get", async () => {
    const message = await storage.getMetadata<string>(
      { pub_key_X: pubKey.getX().toString(16), pub_key_Y: pubKey.getY().toString(16) },
      "metadata-test"
    );
    assert.strictEqual(message, randomMessage);
  });
  it("should set and get WebAuthn Torus Share", async () => {
    let googleShare = await getTorusShare<string>(storage, privKey.toString("hex"), "google");
    if (googleShare) {
      throw new Error("get Torus share should have nothing");
    }
    await setTorusShare(storage, privKey.toString("hex"), "google", "customTorusShare");
    googleShare = await getTorusShare<string>(storage, privKey.toString("hex"), "google");
    assert.strictEqual(googleShare, "customTorusShare");
  });

  it("should set and get WebAuthn Device Share", async () => {
    let googleShare = await getDeviceShare<string>(storage, privKey.toString("hex"), "google");
    if (googleShare) {
      throw new Error("get Torus share should have nothing");
    }
    await setDeviceShare(storage, privKey.toString("hex"), "google", "customDeviceShare");
    googleShare = await getDeviceShare<string>(storage, privKey.toString("hex"), "google");
    assert.strictEqual(googleShare, "customDeviceShare");
  });
});
