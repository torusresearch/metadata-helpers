/// <reference types="node" />
import { ec as EC } from "elliptic";
export declare function keccak256(a: string | Buffer): Buffer;
export declare type Json = boolean | number | string | null | {
    [property: string]: Json;
} | Json[];
export declare const ec: EC;
