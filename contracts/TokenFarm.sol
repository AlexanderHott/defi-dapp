// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract TokenFarm is Ownable {
    // Token address => (staker address => amount)
    mapping(address => mapping(address => uint256)) public stakingBalance;
    mapping(address => uint256) public uniqueTokensStaked;
    mapping(address => address) public tokenToPriceFeed;
    address[] public stakers;
    address[] public allowedTokens;
    IERC20 public dappToken;

    constructor(address _dappTokenAddress) {
        dappToken = IERC20(_dappTokenAddress);
    }

    /// @dev Set a price feed address for a token.
    /// @param _token The address of the token.
    /// @param _priceFeed The address of the price feed.
    function setPriceFeedContract(address _token, address _priceFeed)
        public
        onlyOwner
    {
        tokenToPriceFeed[_token] = _priceFeed;
    }

    /// @dev Give out DAPP tokens based on the amount of staked tokens to all users.
    function issueTokens() public onlyOwner {
        for (uint256 i = 0; i < stakers.length; i++) {
            address staker = stakers[i];
            uint256 staked = getUserTotalValue(staker);
            dappToken.transfer(staker, staked);
        }
    }

    /// @dev Add tokens to stake in this contract.
    /// @param _amount Amount of tokens to stake.
    /// @param _token Address of the token to stake.
    function stakeTokens(uint256 _amount, address _token) public payable {
        require(_amount > 0, "Amount must be more than 0.");
        require(tokenIsAllowed(_token), "Token is not allowed.");
        require(
            msg.value == _amount,
            "Amount must match the value of the transaction."
        );

        // Transfer funds
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);

        // Update internal state
        stakingBalance[_token][msg.sender] =
            stakingBalance[_token][msg.sender] +
            _amount;
        updateUniqueTokensStaked(msg.sender, _token);
        // Update uniqueTokensStaked if this is a new uers
        if (uniqueTokensStaked[msg.sender] == 1) {
            stakers.push(msg.sender);
        }
    }

    /// @dev Remove tokens from staking and transfer them to the caller.
    /// @param _token Address of the token to unstake.
    function unstakeTokens(address _token) public {
        uint256 balance = stakingBalance[_token][msg.sender];
        require(balance > 0, "No tokens to unstake.");
        IERC20(_token).transfer(msg.sender, balance);
        stakingBalance[_token][msg.sender] = 0;
        uniqueTokensStaked[msg.sender] = uniqueTokensStaked[msg.sender] - 1;
    }

    /// @dev Checks whether a token is allowed to be staked.
    /// @param _token The token to check.
    /// @return Whether the token is allowed to be staked.
    function tokenIsAllowed(address _token) public returns (bool) {
        for (uint256 i = 0; i < allowedTokens.length; i++) {
            if (allowedTokens[i] == _token) {
                return true;
            }
        }
        return false;
    }

    /// @dev Get the total in USD of tokens staked by a user.
    /// @param _user The user to check.
    /// @return The total in USD of tokens staked by a user.
    function getUserTotalValue(address _user) public view returns (uint256) {
        require(uniqueTokensStaked[_user] > 0, "User has no staked tokens.");
        uint256 totalValue = 0;
        for (uint256 i = 0; i < allowedTokens.length; i++) {
            totalValue = totalValue + stakingBalance[allowedTokens[i]][_user];
        }
        return totalValue;
    }

    /// @dev Get the value in USD of a token staked by a user.
    /// @param _user The user to check.
    /// @param _token The token to check.
    /// @return The value in USD of a token staked by a user.
    function getUserSingleTokenValue(address _user, address _token)
        public
        view
        returns (uint256)
    {
        if (uniqueTokensStaked[_user] <= 0) {
            return 0;
        }
        // get price of token
        (uint256 price, uint256 decimals) = getTokenValue(_token);
        return (stakingBalance[_token][_user] * price) / (10**decimals);
    }

    /// @dev Get the USD value of a token.
    /// @param _token The token to check.
    /// @return The USD value of a token and the number of decimals the USD value has.
    function getTokenValue(address _token)
        public
        view
        returns (uint256, uint256)
    {
        address priceFeedAddress = tokenToPriceFeed[_token];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            priceFeedAddress
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        uint256 decimals = priceFeed.decimals();
        return (uint256(price), uint256(decimals));
    }

    /// @dev Add a token to the list of allowed tokens.
    /// @param _token The token to add.
    function addToken(address _token) public onlyOwner {
        require(_token != address(0));
        require(tokenIsAllowed(_token) == false);
        allowedTokens.push(_token);
    }

    /// @dev Add a user to the uniqueTokensStaked mapping if they are new.
    /// @param _user Address of the staker.
    /// @param _token Address of the token.
    function updateUniqueTokensStaked(address _user, address _token) internal {
        if (stakingBalance[_token][_user] <= 0) {
            uniqueTokensStaked[_user] = uniqueTokensStaked[_user] + 1;
        }
    }

    // get eth value
}
