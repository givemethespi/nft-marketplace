interface INFTAttribute {
    trait_type: 'attack' | 'health' | 'speed';
    value: string;
}

interface INFTMeta {
    name: string;
    description: string;
    image: string;
    attributes: INFTAttribute[];
}

interface INFTCore {
    tokenId: number;
    price: number;
    creator: string;
    isListed: boolean;
}

interface INFT extends INFTCore {
    meta: INFTMeta;
}

interface FileReq {
    bytes: Uint8Array;
    contentType: string;
    fileName: string;
}

interface PinataFileRes {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
    isDuplicate: boolean;
}
