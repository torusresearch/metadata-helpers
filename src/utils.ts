import createKeccakHash from "keccak";

export function keccak256(a: Buffer): Buffer {
  return createKeccakHash("keccak256").update(a).digest();
}
