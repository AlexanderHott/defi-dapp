import pytest
from brownie import MockERC20
from scripts.utils import get_account
from web3 import Web3


@pytest.fixture
def amount_staked() -> int:
    return Web3.toWei(1, "ether")


@pytest.fixture
def random_erc20():
    account = get_account()
    erc20 = MockERC20.deploy({"from": account})
    return erc20
