export declare type PubKeyParams = {
    pub_key_X: string;
    pub_key_Y: string;
};
export declare type MetadataParams = PubKeyParams & {
    set_data: {
        data: unknown;
        timestamp: string;
    };
    signature: string;
};
declare class MetadataStorageLayer {
    metadataHost: string;
    constructor(metadataHost?: string);
    static setAPIKey(apiKey: string): void;
    static setEmbedHost(embedHost: string): void;
    generateMetadataParams(message: string, privateKeyHex: string): MetadataParams;
    setMetadata(data: MetadataParams, namespace: string | null, options?: RequestInit): Promise<string>;
    getMetadata<T>(pubKey: PubKeyParams, namespace: string | null, options?: RequestInit): Promise<T>;
}
export default MetadataStorageLayer;
