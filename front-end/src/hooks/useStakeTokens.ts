import { TransactionNames } from './../utils';
import { constants, utils } from 'ethers';
import { useContractFunction, useEthers } from '@usedapp/core';
import TokenFarm from '../chain-info/contracts/TokenFarm.json';
import ERC20 from '../chain-info/contracts/MockERC20.json';
import networkMapping from '../chain-info/deployments/map.json';
import { Contract } from '@ethersproject/contracts';
import { useEffect, useState } from 'react';

export const useStakeTokens = (tokenAddress: string) => {
  // get contract addresses and create contracts from abi
  const { chainId } = useEthers();
  const tokenFarmAddress = chainId
    ? networkMapping[String(chainId)]['TokenFarm'][0]
    : constants.AddressZero;
  const tokenFarmContract = new Contract(
    tokenFarmAddress,
    new utils.Interface(TokenFarm.abi)
  );

  const erc20Contract = new Contract(
    tokenAddress,
    new utils.Interface(ERC20.abi)
  );

  // approve transaction
  const { send: approveErc20Send, state: approveAndStakeErc20State } =
    useContractFunction(erc20Contract, 'approve', {
      transactionName: TransactionNames.APPROVE_ERC20_TRANSFER,
    });

  const approveAndStake = (amount: string) => {
    setSakeAmount(amount);
    return approveErc20Send(tokenFarmAddress, amount);
  };

  // Stake Tokens
  const { send: stakeSend, state: stakeState } = useContractFunction(
    tokenFarmContract,
    'stakeTokens',
    { transactionName: TransactionNames.STAKE_TOKENS }
  );

  const [stakeAmount, setSakeAmount] = useState<string>('0');

  useEffect(() => {
    if (approveAndStakeErc20State.status === 'Success') {
      stakeSend(stakeAmount, tokenAddress);
    }
    // Causing infinite loop with suggest dependencies
  }, [approveAndStakeErc20State, tokenAddress, stakeAmount]); // eslint-disable-line

  const [state, setState] = useState(approveAndStakeErc20State);

  useEffect(() => {
    if (approveAndStakeErc20State.status === 'Success') {
      setState(stakeState)
    } else {
      setState(approveAndStakeErc20State);
    }
  }, [approveAndStakeErc20State, stakeState]);

  return { approveAndStake, state };
};
