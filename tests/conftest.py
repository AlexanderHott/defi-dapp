import pytest
from web3 import Web3


@pytest.fixture
def amount_staked() -> int:
    return Web3.toWei(1, "ether")
