import { generatePrivate } from "@toruslabs/eccrypto";
import { ec as EC } from "elliptic";
import { describe, expect, it } from "vitest";

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

describe("Metadata", () => {
  let randomMessage: string;

  it("should get nothing by default", async () => {
    const res = await storage.getMetadata({ pub_key_X: pubKey.getX().toString(16), pub_key_Y: pubKey.getY().toString(16) }, null);
    expect(res).toBe("");
  });

  it("should set and get", async () => {
    // Set metadata
    randomMessage = JSON.stringify({ message: keccak256(Buffer.from(Date.now().toString(), "utf-8")).toString("hex") });
    const params = storage.generateMetadataParams(randomMessage, privKey.toString("hex"));
    await storage.setMetadata(params, "metadata-test");

    // Get and verify metadata
    const message = await storage.getMetadata(storage.generatePubKeyParams(privKey.toString("hex")), "metadata-test");
    expect(message).toBe(randomMessage);
  });

  it("should set and get WebAuthn Torus Share", async () => {
    await setTorusShare(
      storage,
      { pub_key_X: pubKey2.getX().toString(16), pub_key_Y: pubKey2.getY().toString(16) },
      privKey.toString("hex"),
      "google",
      "customTorusShare"
    );
    const googleShare = await getTorusShare<string>(storage, privKey2.toString("hex"), privKey.toString("hex"), "google");
    expect(googleShare).toBe("customTorusShare");
  });

  it("should set and get WebAuthn Device Share", async () => {
    let googleShare = await getDeviceShare<string>(storage, privKey.toString("hex"), "google");
    expect(googleShare).toBeNull();

    await setDeviceShare(storage, privKey.toString("hex"), "google", "customDeviceShare");
    googleShare = await getDeviceShare<string>(storage, privKey.toString("hex"), "google");
    expect(googleShare).toBe("customDeviceShare");
  });

  it("should set and get multiple WebAuthn Torus Shares", async () => {
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
      expect(retrievedShare).toBe(shares[i]);
    }
  });

  it("should handle non-existent WebAuthn Torus Share", async () => {
    const nonExistentShare = await getTorusShare<string>(storage, privKey2.toString("hex"), privKey.toString("hex"), "nonexistent");
    expect(nonExistentShare).toBeNull();
  });

  it("should update existing WebAuthn Torus Share", async () => {
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
    expect(retrievedShare).toBe(initialShare);

    await setTorusShare(
      storage,
      { pub_key_X: pubKey2.getX().toString(16), pub_key_Y: pubKey2.getY().toString(16) },
      privKey.toString("hex"),
      subspace,
      updatedShare
    );

    retrievedShare = await getTorusShare<string>(storage, privKey2.toString("hex"), privKey.toString("hex"), subspace);
    expect(retrievedShare).toBe(updatedShare);
  });

  it("should handle multiple subspaces with different data types", { timeout: 60000 }, async () => {
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
      expect(retrievedShare).toEqual(shares[i]);
    }
  });

  it("should handle empty string as share data", async () => {
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
    expect(retrievedShare).toBe(emptyShare);
  });

  it("should handle large data in WebAuthn Torus Share", { timeout: 60000 }, async () => {
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
    expect(retrievedShare).toBe(largeData);
    expect(retrievedShare?.length).toBe(1000000);
  });
});
