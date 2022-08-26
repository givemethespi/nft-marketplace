// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarket is ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;

    struct NFTItem {
        uint tokenId;
        uint price;
        address creator;
        bool isListed;
    }

    uint public listingPrice = 0.025 ether;

    Counters.Counter private _listedItems;
    Counters.Counter private _tokenIds;

    mapping (string => bool) private _usedTokenURIS;
    mapping (uint => NFTItem) private _idToNFTItem;

    mapping(address => mapping(uint => uint)) private _ownedTokens;
    mapping(uint => uint) private _idToOwnedIndex;

    uint256[] private _allNFTs;
    mapping (uint => uint) private _idToNFTIndex;

    event NFTItemCreated(uint tokenId, uint price, address creator, bool isListed);


    constructor() ERC721("CreaturesNFT", "CNFT") {}

    function setListingPrice(uint newPrice) external onlyOwner {
        require(newPrice > 0, "Price listing must be > 0");
        listingPrice = newPrice;
    }

    function getNFTItem(uint tokenId) public view returns (NFTItem memory) {
        return _idToNFTItem[tokenId];
    }

    function getListedItems() public view returns (uint){
        return _listedItems.current();
    }

    function tokenURIExists(string memory tokenURI) public view returns(bool){
        return _usedTokenURIS[tokenURI] == true;
    }

    function totalSupply() public view returns(uint){
        return _allNFTs.length;
    }

    function tokenByIndex(uint index) public view returns (uint){
        require(index < totalSupply(), "Index out of the bounds");
        return _allNFTs[index];
    }

    function tokenOfOwnerByIndex(address owner, uint index) public view returns (uint){
        require(index < ERC721.balanceOf(owner), "Index out of the bounds");
        return _ownedTokens[owner][index];
    }

    function getAllNFTsOnSale() public view returns(NFTItem[] memory){
        uint allItemsCount = totalSupply();
        uint currentIndex = 0;
        NFTItem[] memory items = new NFTItem[](_listedItems.current());

        for(uint i=0; i<allItemsCount; i++){
            uint tokenId = tokenByIndex(i);
            NFTItem storage item = _idToNFTItem[tokenId];
            if(item.isListed) {
                items[currentIndex] = item;
                currentIndex++;
            }
        }

        return items;
    }

    function placeNFTOnSale(uint tokenId, uint newPrice) public payable {
        require(msg.sender == ERC721.ownerOf(tokenId), "Not the owner");
        require(_idToNFTItem[tokenId].tokenId != 0, "tokenId is not here");
        require(_idToNFTItem[tokenId].isListed != true, "tokenId is already on sale");
        require(newPrice > 0, "price should be > 0");
        require(msg.value == listingPrice, "Not enough found to list");

        _idToNFTItem[tokenId].isListed = true;
        _idToNFTItem[tokenId].price = newPrice;
        _listedItems.increment();
    }

    function getOwnedNfts() public view returns(NFTItem[] memory) {
        uint ownedItemsCount = ERC721.balanceOf(msg.sender);

        NFTItem[] memory items = new NFTItem[](ownedItemsCount);

        for(uint i = 0; i<ownedItemsCount; i++){
            uint tokenId = tokenOfOwnerByIndex(msg.sender, i);
            NFTItem storage item = _idToNFTItem[tokenId];
            items[i] = item;
        }

        return items;
    }

    function mintToken(string memory tokenURI, uint price) public payable returns(uint) {
        require(!tokenURIExists(tokenURI), "Token URI already exists !");
        require(msg.value >= listingPrice, "Not enough funds");

        _tokenIds.increment();
        _listedItems.increment();

        uint newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        _usedTokenURIS[tokenURI] = true;

        _createNFTItem(newTokenId, price);

        return newTokenId;
    }

    function buyNFT(uint tokenId) public payable {
        uint price = _idToNFTItem[tokenId].price;
        address owner = ERC721.ownerOf(tokenId);

        require(msg.sender != owner, "You already own this NFT");
        require(msg.value >= price, "Not enough funds");

        _idToNFTItem[tokenId].isListed = false;
        _listedItems.decrement();

        _transfer(owner, msg.sender, tokenId);
        payable(owner).transfer(msg.value);
    }

    function _createNFTItem(uint tokenId, uint price) private {
        require(price > 0, "Price must be at least 1 wei");

        _idToNFTItem[tokenId] = NFTItem(tokenId, price, msg.sender, true);

        emit NFTItemCreated(tokenId, price, msg.sender, true);
    }

    function _beforeTokenTransfer(address from, address to, uint tokenId) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        // minting token
        if(from == address(0)) {
            _addTokenToAllTokensEnumeration(tokenId);
        } else if(from != to){
            _removeTokenFromOwnerEnumeration(from, tokenId);

            // If burn token
            if(to == address(0)){
                _removeTokenFromAllEnumeration(tokenId);
            }

        }

        if(to != from && to != address(0)) {
            _addTokenToOwnerEnumeration(to, tokenId);
        }
    }

    function _addTokenToAllTokensEnumeration(uint tokenId) private {
        _idToNFTIndex[tokenId] = _allNFTs.length;
        _allNFTs.push(tokenId);
    }

    function _addTokenToOwnerEnumeration(address to, uint tokenId) private {
        uint length = ERC721.balanceOf(to);

        _ownedTokens[to][length] = tokenId;
        _idToOwnedIndex[tokenId] = length;
    }

    function _removeTokenFromOwnerEnumeration(address from, uint tokenId) private {
        uint lastTokenIndex = ERC721.balanceOf(from) - 1;
        uint tokenIndex = _idToOwnedIndex[tokenId];

        if(tokenIndex != lastTokenIndex){
            uint lastTokenId = _ownedTokens[from][lastTokenIndex];

            _ownedTokens[from][tokenIndex] = lastTokenId;
            _idToOwnedIndex[lastTokenId] = tokenIndex;

        }

        delete _idToOwnedIndex[tokenId];
        delete _ownedTokens[from][lastTokenIndex];
    }

    function _removeTokenFromAllEnumeration(uint tokenId) private {
        uint lastTokenIndex = _allNFTs.length - 1;
        uint tokenIndex = _idToNFTIndex[tokenId];

        if(tokenIndex != lastTokenIndex){
            uint lastTokenId = _allNFTs[lastTokenIndex];

            _allNFTs[tokenIndex] = lastTokenId;
            _idToNFTIndex[lastTokenId] = tokenIndex;

        }


        delete _idToNFTIndex[tokenId];
        _allNFTs.pop();
    }


}