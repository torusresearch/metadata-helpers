import { generatePrivate } from "@toruslabs/eccrypto";
import assert from "assert";
import { ec as EC } from "elliptic";

import { MetadataStorageLayer } from "../src/MetadataStorageLayer";
import { keccak256 } from "../src/utils";
import { getDeviceShare, getTorusShare, setDeviceShare, setTorusShare } from "../src/webAuthnShareResolver";

const ec = new EC("secp256k1");
const storage = new MetadataStorageLayer();
const privKey = generatePrivate();
const keyPair = ec.keyFromPrivate(privKey);
const pubKey = keyPair.getPublic();

const privKey2 = generatePrivate();
const keyPair2 = ec.keyFromPrivate(privKey2);
const pubKey2 = keyPair2.getPublic();

describe("Metadata", function () {
  let randomMessage: string;

  it("should get nothing by default", async function () {
    const res = await storage.getMetadata({ pub_key_X: pubKey.getX().toString(16), pub_key_Y: pubKey.getY().toString(16) }, null);
    assert.strictEqual(res, "");
  });

  it("should set", async function () {
    randomMessage = JSON.stringify({ message: keccak256(Buffer.from(Date.now().toString(), "utf-8")).toString("hex") });
    const params = storage.generateMetadataParams(randomMessage, privKey.toString("hex"));
    await storage.setMetadata(params, "metadata-test");
  });

  it("should get", async function () {
    const message = await storage.getMetadata(storage.generatePubKeyParams(privKey.toString("hex")), "metadata-test");
    assert.strictEqual(message, randomMessage);
  });

  it("should set and get WebAuthn Torus Share", async function () {
    await setTorusShare(
      storage,
      { pub_key_X: pubKey2.getX().toString(16), pub_key_Y: pubKey2.getY().toString(16) },
      privKey.toString("hex"),
      "google",
      "customTorusShare"
    );
    const googleShare = await getTorusShare<string>(storage, privKey2.toString("hex"), privKey.toString("hex"), "google");
    assert.strictEqual(googleShare, "customTorusShare");
  });

  it("should set and get WebAuthn Device Share", async function () {
    let googleShare = await getDeviceShare<string>(storage, privKey.toString("hex"), "google");
    if (googleShare) {
      throw new Error("get Torus share should have nothing");
    }
    await setDeviceShare(storage, privKey.toString("hex"), "google", "customDeviceShare");
    googleShare = await getDeviceShare<string>(storage, privKey.toString("hex"), "google");
    assert.strictEqual(googleShare, "customDeviceShare");
  });

  it("should set and get multiple WebAuthn Torus Shares", async function () {
    const subspaces = ["facebook", "twitter", "github"];
    const shares = ["fbShare", "twitterShare", "githubShare"];

    // Set shares for multiple subspaces
    for (let i = 0; i < subspaces.length; i++) {
      await setTorusShare(
        storage,
        { pub_key_X: pubKey2.getX().toString(16), pub_key_Y: pubKey2.getY().toString(16) },
        privKey.toString("hex"),
        subspaces[i],
        shares[i]
      );
    }

    // Get and verify shares for each subspace
    for (let i = 0; i < subspaces.length; i++) {
      const retrievedShare = await getTorusShare<string>(storage, privKey2.toString("hex"), privKey.toString("hex"), subspaces[i]);
      assert.strictEqual(retrievedShare, shares[i], `Share for ${subspaces[i]} should match`);
    }
  });

  it("should handle non-existent WebAuthn Torus Share", async function () {
    const nonExistentShare = await getTorusShare<string>(storage, privKey2.toString("hex"), privKey.toString("hex"), "nonexistent");
    assert.strictEqual(nonExistentShare, null, "Non-existent share should return null");
  });

  it("should update existing WebAuthn Torus Share", async function () {
    const initialShare = "initialShare";
    const updatedShare = "updatedShare";
    const subspace = "updateTest";

    await setTorusShare(
      storage,
      { pub_key_X: pubKey2.getX().toString(16), pub_key_Y: pubKey2.getY().toString(16) },
      privKey.toString("hex"),
      subspace,
      initialShare
    );

    let retrievedShare = await getTorusShare<string>(storage, privKey2.toString("hex"), privKey.toString("hex"), subspace);
    assert.strictEqual(retrievedShare, initialShare, "Initial share should be set correctly");

    await setTorusShare(
      storage,
      { pub_key_X: pubKey2.getX().toString(16), pub_key_Y: pubKey2.getY().toString(16) },
      privKey.toString("hex"),
      subspace,
      updatedShare
    );

    retrievedShare = await getTorusShare<string>(storage, privKey2.toString("hex"), privKey.toString("hex"), subspace);
    assert.strictEqual(retrievedShare, updatedShare, "Share should be updated");
  });

  it("should handle multiple subspaces with different data types", async function () {
    const subspaces = ["stringSpace", "numberSpace", "objectSpace"];
    const shares = ["testString", 42, { key: "value" }];

    for (let i = 0; i < subspaces.length; i++) {
      await setTorusShare(
        storage,
        { pub_key_X: pubKey2.getX().toString(16), pub_key_Y: pubKey2.getY().toString(16) },
        privKey.toString("hex"),
        subspaces[i],
        shares[i]
      );
    }

    for (let i = 0; i < subspaces.length; i++) {
      const retrievedShare = await getTorusShare(storage, privKey2.toString("hex"), privKey.toString("hex"), subspaces[i]);
      assert.deepStrictEqual(retrievedShare, shares[i], `Share for ${subspaces[i]} should match and maintain its data type`);
    }
  });

  it("should handle empty string as share data", async function () {
    const emptyShare = "";
    const subspace = "emptySpace";

    await setTorusShare(
      storage,
      { pub_key_X: pubKey2.getX().toString(16), pub_key_Y: pubKey2.getY().toString(16) },
      privKey.toString("hex"),
      subspace,
      emptyShare
    );

    const retrievedShare = await getTorusShare<string>(storage, privKey2.toString("hex"), privKey.toString("hex"), subspace);
    assert.strictEqual(retrievedShare, emptyShare, "Empty string share should be retrieved correctly");
  });

  it("should handle large data in WebAuthn Torus Share", async function () {
    const largeData = "x".repeat(1000000); // 1MB of data
    const subspace = "largeDataSpace";

    await setTorusShare(
      storage,
      { pub_key_X: pubKey2.getX().toString(16), pub_key_Y: pubKey2.getY().toString(16) },
      privKey.toString("hex"),
      subspace,
      largeData
    );

    const retrievedShare = await getTorusShare<string>(storage, privKey2.toString("hex"), privKey.toString("hex"), subspace);
    assert.strictEqual(retrievedShare, largeData, "Large data should be retrieved correctly");
    assert.strictEqual(retrievedShare?.length, 1000000, "Retrieved data should maintain its size");
  });
});
