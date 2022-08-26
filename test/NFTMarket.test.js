const NFTMarket = artifacts.require('NFTMarket');
const { ethers } = require('ethers');

contract('NFTMarket', accounts => {
    let _contract = null;
    let _nftPrice = ethers.utils.parseEther('0.3').toString();
    let _listingPrice = ethers.utils.parseEther('0.025').toString();

    before(async () => {
        _contract = await NFTMarket.deployed();
    });

    describe('Mint token', () => {
        const tokenURI = 'https://maespirit.fr';

        before(async () => {
            await _contract.mintToken(tokenURI, _nftPrice, {
                from: accounts[0],
                value: _listingPrice
            });
        });

        it('owner of first token should be accounts[0]', async () => {
            const owner = await _contract.ownerOf(1);
            assert.equal(owner, accounts[0], 'Owner is not the first');
        });

        it('tokenURI of first token should be the right', async () => {
            const actualTokenURI = await _contract.tokenURI(1);
            assert.equal(
                actualTokenURI,
                'https://maespirit.fr',
                'tokenURI is not good'
            );
        });

        it('should not be possible to create nft with already used URI', async () => {
            try {
                await _contract.mintToken(tokenURI, _nftPrice, {
                    from: accounts[0],
                    value: _listingPrice
                });
            } catch (e) {
                assert(e, 'Token URI is already used');
            }
        });

        it('should have 1 listed item', async () => {
            const listedItems = await _contract.getListedItems();
            assert.equal(
                listedItems.toNumber(),
                1,
                'listedItems count is not 1'
            );
        });

        it('should have create NFT Item', async () => {
            const item = await _contract.getNFTItem(1);
            assert.equal(item.tokenId, 1, 'tokenId should be 1');
            assert.equal(
                item.price,
                _nftPrice,
                'nftPrice should be ' + _nftPrice
            );
            assert.equal(
                item.creator,
                accounts[0],
                'creator should be ' + accounts[0]
            );
            assert.equal(item.isListed, true, 'isListed should be true');
        });
    });

    describe('Buy NFT', () => {
        before(async () => {
            await _contract.buyNFT(1, {
                from: accounts[1],
                value: _nftPrice
            });
        });

        it('should unlist the item', async () => {
            const tokenInfo = await _contract.getNFTItem(1);
            assert.equal(tokenInfo.isListed, false, 'Token is not unlisted');
        });

        it('should decreased the listed item count', async () => {
            const nbListed = await _contract.getListedItems();
            assert.equal(nbListed, 0, 'Not decreased');
        });

        it('should have change the owner', async () => {
            const currentOwner = await _contract.ownerOf(1);
            assert.equal(currentOwner, accounts[1], 'Owner didnt change');
        });
    });

    describe('Token Transfers', () => {
        const tokenURI = 'https://google.fr';

        before(async () => {
            await _contract.mintToken(tokenURI, _nftPrice, {
                from: accounts[0],
                value: _listingPrice
            });
        });

        it('should have 2 NFTs created', async () => {
            const totalSupply = await _contract.totalSupply();
            assert.equal(
                totalSupply.toNumber(),
                2,
                'There is not 2 NFTs created'
            );
        });

        it('should be able to retrieve nft by index', async () => {
            const nftId1 = await _contract.tokenByIndex(0);
            const nftId2 = await _contract.tokenByIndex(1);
            assert.equal(nftId1.toNumber(), 1, 'Not good tokenId for index 1');
            assert.equal(nftId2.toNumber(), 2, 'Not good tokenId for index 2');
        });

        it('should have only 1 NFT listed (tokenId 2) on 2 NFT created', async () => {
            const NFTOnSale = await _contract.getAllNFTsOnSale();
            assert.equal(
                NFTOnSale.length,
                1,
                'There is not exactly 1 NFT listed'
            );
            assert.equal(NFTOnSale[0].tokenId, 2, 'Not the good tokenId');
        });

        it('account[1] should have only 1 owned NFT', async () => {
            const ownedNFTs = await _contract.getOwnedNfts({
                from: accounts[1]
            });
            assert.equal(ownedNFTs[0].tokenId, 1, 'Pb on account 1');
        });

        it('account[0] should have only 1 owned NFT', async () => {
            const ownedNFTs = await _contract.getOwnedNfts({
                from: accounts[0]
            });
            assert.equal(ownedNFTs[0].tokenId, 2, 'Pb on account 0');
        });
    });

    describe('Token transfer to new owner', () => {
        before(async () => {
            await _contract.transferFrom(accounts[0], accounts[1], 2);
        });

        it('accounts[0] should own 0 tokens now', async () => {
            const ownedNFTs = await _contract.getOwnedNfts({
                from: accounts[0]
            });
            assert.equal(ownedNFTs.length, 0, 'Pb on account 0');
        });

        it('accounts[1] should own 2 tokens now', async () => {
            const ownedNFTs = await _contract.getOwnedNfts({
                from: accounts[1]
            });
            assert.equal(ownedNFTs.length, 2, 'Pb on account 1');
        });
    });

    describe('Put NFT on sale', () => {
        before(async () => {
            await _contract.placeNFTOnSale(1, _nftPrice, {
                from: accounts[1],
                value: _listingPrice
            });
        });

        it('should be 2 nfts on sale', async () => {
            const nbNFTsOnSale = await _contract.getAllNFTsOnSale();
            assert.equal(nbNFTsOnSale.length, 2, 'Not 2 NFTs on sale');
        });
    });
});
