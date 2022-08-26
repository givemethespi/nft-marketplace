const instance = await NFTMarket.deployed();
instance.mintToken(
    'https://gateway.pinata.cloud/ipfs/Qmb4aom5xNRE5CBRHZsxCsYSdcmX8zfHXgM7ovZxLp3CqL',
    String(0.5 * 10 ** 18),
    { value: String(0.025 * 10 ** 18), from: accounts[0] }
);

instance.mintToken(
    'https://gateway.pinata.cloud/ipfs/QmWwMtiPU534bJ8jr9Jjf1EjtSknt1aJm2XYVoUDJTh4H7',
    String(0.3 * 10 ** 18),
    { value: String(0.025 * 10 ** 18), from: accounts[0] }
);
