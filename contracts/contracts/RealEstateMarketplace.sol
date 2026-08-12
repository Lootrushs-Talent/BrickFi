// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title RealEstateMarketplace
/// @notice Fractional ownership vault for tokenized real-estate listings.
///         Investors buy shares with ETH. Proceeds sit in the contract until
///         the listing seller withdraws them (pull-payment pattern).
contract RealEstateMarketplace {
    struct Property {
        uint256 id;
        address seller;
        string name;
        string location;
        uint256 totalShares;
        uint256 sharePrice;
        uint256 sharesSold;
        uint256 proceeds;
        bool listed;
    }

    address public immutable admin;
    uint256 public propertyCount;

    mapping(uint256 => Property) public properties;
    mapping(uint256 => mapping(address => uint256)) public investorShares;

    uint256 private _locked;

    event PropertyListed(
        uint256 indexed propertyId,
        address indexed seller,
        string name,
        uint256 totalShares,
        uint256 sharePrice
    );
    event SharesPurchased(
        uint256 indexed propertyId,
        address indexed investor,
        uint256 shareAmount,
        uint256 cost
    );
    event ProceedsWithdrawn(
        uint256 indexed propertyId,
        address indexed seller,
        uint256 amount
    );

    error NotAdmin();
    error NotSeller();
    error InvalidParams();
    error NotListed();
    error SoldOut();
    error IncorrectPayment();
    error NothingToWithdraw();
    error TransferFailed();
    error Reentrant();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier nonReentrant() {
        if (_locked != 0) revert Reentrant();
        _locked = 1;
        _;
        _locked = 0;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Create a new fractional property listing. Demo seed uses admin.
    function listProperty(
        string calldata name,
        string calldata location,
        uint256 totalShares,
        uint256 sharePrice
    ) external onlyAdmin returns (uint256) {
        if (bytes(name).length == 0 || totalShares == 0 || sharePrice == 0) {
            revert InvalidParams();
        }

        propertyCount += 1;
        uint256 id = propertyCount;

        properties[id] = Property({
            id: id,
            seller: msg.sender,
            name: name,
            location: location,
            totalShares: totalShares,
            sharePrice: sharePrice,
            sharesSold: 0,
            proceeds: 0,
            listed: true
        });

        emit PropertyListed(id, msg.sender, name, totalShares, sharePrice);
        return id;
    }

    /// @notice Buy `shareAmount` shares of a listed property. Payment must be exact.
    function buyShares(uint256 propertyId, uint256 shareAmount)
        external
        payable
        nonReentrant
    {
        Property storage property = properties[propertyId];
        if (!property.listed) revert NotListed();
        if (shareAmount == 0) revert InvalidParams();
        if (property.sharesSold + shareAmount > property.totalShares) revert SoldOut();

        uint256 cost = shareAmount * property.sharePrice;
        if (msg.value != cost) revert IncorrectPayment();

        property.sharesSold += shareAmount;
        property.proceeds += msg.value;
        investorShares[propertyId][msg.sender] += shareAmount;

        emit SharesPurchased(propertyId, msg.sender, shareAmount, cost);
    }

    /// @notice Buy shares across several listings in one payment. `msg.value` must equal the sum.
    function buyCart(uint256[] calldata propertyIds, uint256[] calldata shareAmounts)
        external
        payable
        nonReentrant
    {
        uint256 length = propertyIds.length;
        if (length == 0 || length != shareAmounts.length) revert InvalidParams();

        uint256 totalCost;
        for (uint256 i = 0; i < length; i++) {
            Property storage property = properties[propertyIds[i]];
            if (!property.listed) revert NotListed();
            if (shareAmounts[i] == 0) revert InvalidParams();
            if (property.sharesSold + shareAmounts[i] > property.totalShares) revert SoldOut();

            uint256 cost = shareAmounts[i] * property.sharePrice;
            totalCost += cost;
            property.sharesSold += shareAmounts[i];
            property.proceeds += cost;
            investorShares[propertyIds[i]][msg.sender] += shareAmounts[i];
            emit SharesPurchased(propertyIds[i], msg.sender, shareAmounts[i], cost);
        }

        if (msg.value != totalCost) revert IncorrectPayment();
    }

    /// @notice Seller pulls accumulated ETH from share sales for one listing.
    function withdrawProceeds(uint256 propertyId) external nonReentrant {
        Property storage property = properties[propertyId];
        if (msg.sender != property.seller) revert NotSeller();

        uint256 amount = property.proceeds;
        if (amount == 0) revert NothingToWithdraw();

        property.proceeds = 0;

        (bool ok, ) = payable(property.seller).call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit ProceedsWithdrawn(propertyId, property.seller, amount);
    }

    function getProperty(uint256 propertyId) external view returns (Property memory) {
        return properties[propertyId];
    }

    function getShares(uint256 propertyId, address investor) external view returns (uint256) {
        return investorShares[propertyId][investor];
    }
}
