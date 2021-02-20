/// <reference types="node" />
export declare function keccak256(a: Buffer): Buffer;
export declare type Json = boolean | number | string | null | {
    [property: string]: Json;
} | Json[];
