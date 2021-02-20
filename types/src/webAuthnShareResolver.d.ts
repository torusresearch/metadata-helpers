import { Ecies } from "@toruslabs/eccrypto";
import MetadataStorageLayer from "./MetadataStorageLayer";
import { Json } from "./utils";
declare type EciesHex = {
    iv: string;
    ephemPublicKey: string;
    ciphertext: string;
    mac: string;
};
export declare function encParamsHexToBuf(encParamsHex: EciesHex): Ecies;
export declare function encParamsBufToHex(encParams: Ecies): EciesHex;
export declare function setTorusShare(m: MetadataStorageLayer, webAuthnKeyHex: string, verifier: string, data: Json): Promise<void>;
export declare function setDeviceShare(m: MetadataStorageLayer, webAuthnRefHex: string, verifier: string, data: Json): Promise<void>;
export declare function getTorusShare<T>(m: MetadataStorageLayer, webAuthnKeyHex: string, verifier: string): Promise<T>;
export declare function getDeviceShare<T>(m: MetadataStorageLayer, webAuthnRefHex: string, verifier: string): Promise<T>;
export {};
