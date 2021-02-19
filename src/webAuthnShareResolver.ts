import { decrypt, Ecies, encrypt, getPublic } from "@toruslabs/eccrypto";
import { ec as EC } from "elliptic";

import MetadataStorageLayer from "./MetadataStorageLayer";
import { Json } from "./utils";

const ec = new EC("secp256k1");

const WEBAUTHN_TORUS_SHARE = "webauthn-torus-share";
const WEBAUTHN_DEVICE_SHARE = "webauthn-device-share";

type EciesHex = {
  iv: string;
  ephemPublicKey: string;
  ciphertext: string;
  mac: string;
};

export function encParamsHexToBuf(encParamsHex: EciesHex): Ecies {
  return {
    iv: Buffer.from(encParamsHex.iv, "hex"),
    ephemPublicKey: Buffer.from(encParamsHex.ephemPublicKey, "hex"),
    ciphertext: Buffer.from(encParamsHex.ciphertext, "hex"),
    mac: Buffer.from(encParamsHex.mac, "hex"),
  };
}

export function encParamsBufToHex(encParams: Ecies): EciesHex {
  return {
    iv: Buffer.from(encParams.iv).toString("hex"),
    ephemPublicKey: Buffer.from(encParams.ephemPublicKey).toString("hex"),
    ciphertext: Buffer.from(encParams.ciphertext).toString("hex"),
    mac: Buffer.from(encParams.mac).toString("hex"),
  };
}

export async function setTorusShare(m: MetadataStorageLayer, webAuthnKeyHex: string, verifier: string, data: Json): Promise<void> {
  const keyPair = ec.keyFromPrivate(webAuthnKeyHex);
  const privKey = keyPair.getPrivate();
  const pubKey = keyPair.getPublic();

  // read encrypted store and append to it
  const serializedData = await m.getMetadata<string>(
    { pub_key_X: pubKey.getX().toString(16), pub_key_Y: pubKey.getY().toString(16) },
    WEBAUTHN_TORUS_SHARE
  );
  let d: Record<string, unknown>;
  if (!serializedData) {
    // empty
    d = {};
  } else {
    const encParamsHex: EciesHex = JSON.parse(serializedData);
    const encParams = encParamsHexToBuf(encParamsHex);
    const serializedBuf = await decrypt(privKey.toBuffer(), encParams);
    const serializedDec = serializedBuf.toString("utf-8");
    d = JSON.parse(serializedDec);
  }
  d[verifier] = data;
  const serializedDec = JSON.stringify(d);
  const serializedBuf = Buffer.from(serializedDec, "utf-8");
  const encParams = await encrypt(getPublic(privKey.toBuffer()), serializedBuf);
  const encParamsHex = encParamsBufToHex(encParams);
  const sData = JSON.stringify(encParamsHex);
  const metadataParams = m.generateMetadataParams(sData, privKey.toString(16));
  await m.setMetadata(metadataParams, WEBAUTHN_TORUS_SHARE);
}

export async function setDeviceShare(m: MetadataStorageLayer, webAuthnRefHex: string, verifier: string, data: Json): Promise<void> {
  const keyPair = ec.keyFromPrivate(webAuthnRefHex);
  const privKey = keyPair.getPrivate();
  const pubKey = keyPair.getPublic();

  // read encrypted store and append to it
  const serializedData = await m.getMetadata<string>(
    { pub_key_X: pubKey.getX().toString(16), pub_key_Y: pubKey.getY().toString(16) },
    WEBAUTHN_DEVICE_SHARE
  );
  let d: Record<string, unknown>;
  if (!serializedData) {
    // empty
    d = {};
  } else {
    const encParamsHex: EciesHex = JSON.parse(serializedData);
    const encParams = encParamsHexToBuf(encParamsHex);
    const serializedBuf = await decrypt(privKey.toBuffer(), encParams);
    const serializedDec = serializedBuf.toString("utf-8");
    d = JSON.parse(serializedDec);
  }
  d[verifier] = data;
  const serializedDec = JSON.stringify(d);
  const serializedBuf = Buffer.from(serializedDec, "utf-8");
  const encParams = await encrypt(getPublic(privKey.toBuffer()), serializedBuf);
  const encParamsHex = encParamsBufToHex(encParams);
  const sData = JSON.stringify(encParamsHex);
  const metadataParams = m.generateMetadataParams(sData, privKey.toString(16));
  await m.setMetadata(metadataParams, WEBAUTHN_DEVICE_SHARE);
}

export async function getTorusShare<T>(m: MetadataStorageLayer, webAuthnKeyHex: string, verifier: string): Promise<T | null> {
  const keyPair = ec.keyFromPrivate(webAuthnKeyHex);
  const privKey = keyPair.getPrivate();
  const pubKey = keyPair.getPublic();
  const serializedData = await m.getMetadata<string>(
    { pub_key_X: pubKey.getX().toString(16), pub_key_Y: pubKey.getY().toString(16) },
    WEBAUTHN_TORUS_SHARE
  );
  if (!serializedData) {
    return null;
  }
  const encParamsHex: EciesHex = JSON.parse(serializedData);
  const encParams = encParamsHexToBuf(encParamsHex);
  const serializedBuf = await decrypt(privKey.toBuffer(), encParams);
  const serializedDec = serializedBuf.toString("utf-8");
  const data: Record<string, T> = JSON.parse(serializedDec);
  return data[verifier];
}

export async function getDeviceShare<T>(m: MetadataStorageLayer, webAuthnRefHex: string, verifier: string): Promise<T | null> {
  const keyPair = ec.keyFromPrivate(webAuthnRefHex);
  const privKey = keyPair.getPrivate();
  const pubKey = keyPair.getPublic();
  const serializedData = await m.getMetadata<string>(
    { pub_key_X: pubKey.getX().toString(16), pub_key_Y: pubKey.getY().toString(16) },
    WEBAUTHN_DEVICE_SHARE
  );
  if (!serializedData) {
    return null;
  }
  const encParamsHex: EciesHex = JSON.parse(serializedData);
  const encParams = encParamsHexToBuf(encParamsHex);
  const serializedBuf = await decrypt(privKey.toBuffer(), encParams);
  const serializedDec = serializedBuf.toString("utf-8");
  const data: Record<string, T> = JSON.parse(serializedDec);
  return data[verifier];
}
