import { decrypt, Ecies, encrypt, getPublic } from "@toruslabs/eccrypto";

import MetadataStorageLayer from "./MetadataStorageLayer";
import { ec } from "./utils";

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

async function getData<T>(m: MetadataStorageLayer, webAuthnKeyHex: string, namespace: string): Promise<Record<string, T> | null> {
  const keyPair = ec.keyFromPrivate(webAuthnKeyHex);
  const privKey = keyPair.getPrivate();
  const pubKey = keyPair.getPublic();
  const serializedData = await m.getMetadata<string>({ pub_key_X: pubKey.getX().toString(16), pub_key_Y: pubKey.getY().toString(16) }, namespace);
  if (!serializedData) {
    return null;
  }
  const encParamsHex: EciesHex = JSON.parse(serializedData);
  const encParams = encParamsHexToBuf(encParamsHex);
  const serializedBuf = await decrypt(Buffer.from(privKey.toString("hex", 64), "hex"), encParams);
  const serializedDec = serializedBuf.toString("utf-8");
  const data: Record<string, T> = JSON.parse(serializedDec);
  return data;
}

export async function setTorusShare(m: MetadataStorageLayer, webAuthnKeyHex: string, subspace: string, subspaceData: unknown): Promise<void> {
  const keyPair = ec.keyFromPrivate(webAuthnKeyHex);
  const privKey = keyPair.getPrivate();
  const data = await getData(m, webAuthnKeyHex, WEBAUTHN_TORUS_SHARE);
  let d: Record<string, unknown> = {};
  if (data) d = data;
  d[subspace] = subspaceData;
  const serializedDec = JSON.stringify(d);
  const serializedBuf = Buffer.from(serializedDec, "utf-8");
  const encParams = await encrypt(getPublic(Buffer.from(privKey.toString("hex", 64), "hex")), serializedBuf);
  const encParamsHex = encParamsBufToHex(encParams);
  const sData = JSON.stringify(encParamsHex);
  const metadataParams = m.generateMetadataParams(sData, privKey.toString(16));
  await m.setMetadata(metadataParams, WEBAUTHN_TORUS_SHARE);
}

export async function setDeviceShare(m: MetadataStorageLayer, webAuthnRefHex: string, subspace: string, subspaceData: unknown): Promise<void> {
  const keyPair = ec.keyFromPrivate(webAuthnRefHex);
  const privKey = keyPair.getPrivate();
  const data = await getData(m, webAuthnRefHex, WEBAUTHN_DEVICE_SHARE);
  let d: Record<string, unknown> = {};
  if (data) d = data;
  d[subspace] = subspaceData;
  const serializedDec = JSON.stringify(d);
  const serializedBuf = Buffer.from(serializedDec, "utf-8");
  const encParams = await encrypt(getPublic(Buffer.from(privKey.toString("hex", 64), "hex")), serializedBuf);
  const encParamsHex = encParamsBufToHex(encParams);
  const sData = JSON.stringify(encParamsHex);
  const metadataParams = m.generateMetadataParams(sData, privKey.toString(16));
  await m.setMetadata(metadataParams, WEBAUTHN_DEVICE_SHARE);
}

export async function getTorusShare<T>(m: MetadataStorageLayer, webAuthnKeyHex: string, subspace: string): Promise<T | null> {
  const data = await getData<T>(m, webAuthnKeyHex, WEBAUTHN_TORUS_SHARE);
  if (data) return data[subspace];
  return null;
}

export async function getDeviceShare<T>(m: MetadataStorageLayer, webAuthnRefHex: string, subspace: string): Promise<T | null> {
  const data = await getData<T>(m, webAuthnRefHex, WEBAUTHN_DEVICE_SHARE);
  if (data) return data[subspace];
  return null;
}
