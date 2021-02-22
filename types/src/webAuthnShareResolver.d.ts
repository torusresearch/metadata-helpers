import { Ecies } from "@toruslabs/eccrypto";
import MetadataStorageLayer from "./MetadataStorageLayer";
declare type EciesHex = {
    iv: string;
    ephemPublicKey: string;
    ciphertext: string;
    mac: string;
};
export declare function encParamsHexToBuf(encParamsHex: EciesHex): Ecies;
export declare function encParamsBufToHex(encParams: Ecies): EciesHex;
export declare function setTorusShare(m: MetadataStorageLayer, webAuthnKeyHex: string, verifier: string, verifierData: unknown): Promise<void>;
export declare function setDeviceShare(m: MetadataStorageLayer, webAuthnRefHex: string, verifier: string, verifierData: unknown): Promise<void>;
export declare function getTorusShare<T>(m: MetadataStorageLayer, webAuthnKeyHex: string, verifier: string): Promise<T | null>;
export declare function getDeviceShare<T>(m: MetadataStorageLayer, webAuthnRefHex: string, verifier: string): Promise<T | null>;
export {};
