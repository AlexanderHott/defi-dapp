from scripts.utils import get_account, get_contract
from brownie import DappToken, TokenFarm, config, network
from web3 import Web3


KEEP_BALANCE = Web3.toWei(100, "ether")


def main():
    deploy_token_farm_and_dapp_token()


def deploy_token_farm_and_dapp_token():
    account = get_account()
    dapp_token = DappToken.deploy({"from": account})
    token_farm = TokenFarm.deploy(
        dapp_token.address,
        {"from": account},
        publish_source=config["networks"][network.show_active()]["verify"],
    )
    tx = dapp_token.transfer(
        token_farm.address, dapp_token.totalSupply() - KEEP_BALANCE, {"from": account}
    )
    tx.wait(1)

    weth_token = get_contract("weth_token")
    fau_token = get_contract("fau_token")
    add_allowed_tokens(
        token_farm,
        {
            dapp_token: get_contract("dai_usd_price_feed"),
            fau_token: get_contract("dai_usd_price_feed"),
            weth_token: get_contract("eth_usd_price_feed"),
        },
        account,
    )
    return token_farm, dapp_token


def add_allowed_tokens(token_farm, allowed_tokens_map, account):
    for token, address in allowed_tokens_map.items():
        tx = token_farm.addAllowedToken(token.address, {"from": account})
        tx.wait(1)
        tx = token_farm.setPriceFeedContract(token.address, address, {"from": account})
        tx.wait(1)
    return token_farm
