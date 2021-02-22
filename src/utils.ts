import { ec as EC } from "elliptic";
import createKeccakHash from "keccak";

export function keccak256(a: string | Buffer): Buffer {
  return createKeccakHash("keccak256").update(a).digest();
}

export type Json = boolean | number | string | null | { [property: string]: Json } | Json[];

export const ec = new EC("secp256k1");
