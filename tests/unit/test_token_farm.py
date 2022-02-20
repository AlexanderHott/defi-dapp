import pytest
from brownie import network, exceptions
from scripts.deploy import KEEP_BALANCE, deploy_token_farm_and_dapp_token
from scripts.utils import (
    DECIMALS,
    INITIAL_VALUE,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
    get_account,
    get_contract,
)


def test_set_price_feed_contract():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")

    # Setup
    account = get_account()
    non_owner = get_account(1)
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()

    # Test if owners can set a price feed
    token_farm.setPriceFeedContract(
        dapp_token.address,
        price_feed_address := get_contract("eth_usd_price_feed").address,
        {"from": account},
    )

    assert token_farm.tokenToPriceFeed(dapp_token.address) == price_feed_address

    # Test if non owners can set a price feed
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.setPriceFeedContract(
            dapp_token.address,
            price_feed_address := get_contract("eth_usd_price_feed").address,
            {"from": non_owner},
        )


def test_stake_tokens(amount_staked: int):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")

    # Setup
    account = get_account()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()

    dapp_token.approve(token_farm.address, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, dapp_token.address, {"from": account})

    assert (
        token_farm.stakingBalance(dapp_token.address, account.address) == amount_staked
    )
    assert token_farm.stakers(0) == account
    return token_farm, dapp_token


def test_issue_tokens(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")

    # Setup
    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)
    starting_balance = dapp_token.balanceOf(account.address)

    token_farm.issueTokens({"from": account})

    assert dapp_token.balanceOf(account.address) == starting_balance + INITIAL_VALUE


def test_get_user_total_value_with_different_tokens(amount_staked, random_erc20):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")

    # Setup
    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)

    token_farm.addAllowedToken(random_erc20.address, {"from": account})
    token_farm.setPriceFeedContract(
        random_erc20.address,
        get_contract("eth_usd_price_feed").address,
        {"from": account},
    )
    random_erc20_stake_amount = amount_staked * 2
    random_erc20.approve(
        token_farm.address, random_erc20_stake_amount, {"from": account}
    )
    token_farm.stakeTokens(
        random_erc20_stake_amount, random_erc20.address, {"from": account}
    )

    total_value = token_farm.getUserTotalValue(account.address)
    assert total_value == INITIAL_VALUE * 3


def test_get_token_value(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")

    # Setup
    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)

    assert token_farm.getTokenValue(dapp_token.address) == (INITIAL_VALUE, DECIMALS)


def test_unstake_tokens(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")

    # Setup
    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)

    token_farm.unstakeTokens(dapp_token.address, {"from": account})

    assert dapp_token.balanceOf(account.address) == KEEP_BALANCE
    assert token_farm.stakingBalance(dapp_token.address, account.address) == 0
    assert token_farm.uniqueTokensStaked(account.address) == 0


def test_add_allowed_tokens(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")

    # Setup
    account = get_account()
    non_owner = get_account(1)
    token_farm, dapp_token = test_stake_tokens(amount_staked)

    assert token_farm.allowedTokens(0) == dapp_token.address
    with pytest.raises(exceptions.VirtualMachineError):
        # dapp token already allowed, this should fail
        token_farm.addAllowedToken(dapp_token.address, {"from": account})
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.addAllowedToken(dapp_token.address, {"from": non_owner})


def test_get_user_single_token_value_returns_0_for_no_staked_tokens(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")

    # Setup
    account = get_account()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    dapp_token.approve(token_farm.address, amount_staked, {"from": account})

    assert token_farm.getUserSingleTokenValue(account.address, dapp_token.address) == 0


def test_add_invalid_token_address(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")

    # Setup
    account = get_account()
    non_owner = get_account(1)
    token_farm, dapp_token = test_stake_tokens(amount_staked)

    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.addAllowedToken("0x0000000000000000000000000000000000000000", {"from": account})


def test_try_unstake_with_0_tokens(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")

    # Setup
    account = get_account()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()

    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.unstakeTokens(dapp_token.address, {"from": account})
