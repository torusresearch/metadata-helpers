import { post, setAPIKey, setEmbedHost } from "@toruslabs/http-helpers";
import { ec as EC } from "elliptic";
import stringify from "json-stable-stringify";

import { keccak256 } from "./utils";

type PubKeyParams = {
  pub_key_X: string;
  pub_key_Y: string;
};

type MetadataParams = PubKeyParams & {
  set_data: {
    data: unknown;
    timestamp: string;
  };
  signature: string;
};

class MetadataStorageLayer {
  public metadataHost: string;

  public ec: EC;

  constructor(metadataHost = "https://metadata.tor.us") {
    this.metadataHost = metadataHost;
    this.ec = new EC("secp256k1");
  }

  static setAPIKey(apiKey: string): void {
    setAPIKey(apiKey);
  }

  static setEmbedHost(embedHost: string): void {
    setEmbedHost(embedHost);
  }

  generateMetadataParams(message: string, privateKeyHex: string): MetadataParams {
    const key = this.ec.keyFromPrivate(privateKeyHex);
    const setData = {
      data: message,
      timestamp: Math.floor(Date.now() / 1000).toString(16),
    };
    const sig = key.sign(keccak256(stringify(setData)));
    return {
      pub_key_X: key.getPublic().getX().toString("hex"),
      pub_key_Y: key.getPublic().getY().toString("hex"),
      set_data: setData,
      signature: Buffer.from(
        sig.r.toString(16, 64) + sig.s.toString(16, 64) + sig.recoveryParam.toString(16).padStart(2, "0").slice(-2),
        "hex"
      ).toString("base64"),
    };
  }

  async setMetadata(data: MetadataParams, namespace: string | null, options?: RequestInit): Promise<string> {
    if (namespace === null) {
      const metadataResponse = await post<{ message: string }>(`${this.metadataHost}/set`, { ...data }, options, { useAPIKey: true });
      return metadataResponse.message;
    }
    const metadataResponse = await post<{ message: string }>(`${this.metadataHost}/set`, { ...data, namespace }, options, { useAPIKey: true });
    return metadataResponse.message;
  }

  async getMetadata<T>(pubKey: PubKeyParams, namespace: string | null, options?: RequestInit): Promise<T> {
    if (namespace === null) {
      const metadataResponse = await post<{ message: T }>(`${this.metadataHost}/get`, pubKey, options, { useAPIKey: true });
      return metadataResponse.message;
    }
    const metadataResponse = await post<{ message: T }>(`${this.metadataHost}/get`, { ...pubKey, namespace }, options, { useAPIKey: true });
    return metadataResponse.message;
  }
}

export default MetadataStorageLayer;
