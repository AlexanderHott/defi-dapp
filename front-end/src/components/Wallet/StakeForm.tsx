import { useEthers, useTokenBalance, useNotifications } from '@usedapp/core';
import React, { useEffect, useState } from 'react';
import { Token } from '../Main';
import { formatUnits } from '@ethersproject/units';
import { Button, CircularProgress, Input } from '@material-ui/core';
import { useStakeTokens } from '../../hooks';
import { utils } from 'ethers';
import { TransactionNames } from '../../utils';

type StakeFormProps = {
  token: Token;
};

const StakeForm = ({ token }: StakeFormProps) => {
  const [amount, setAmount] = useState<number>(0);
  const { notifications } = useNotifications();

  const { address, name } = token;
  const { account } = useEthers();
  const tokenBalance = useTokenBalance(address, account);
  const formattedTokenBalance = tokenBalance
    ? parseFloat(formatUnits(tokenBalance.toString()))
    : 0;

  const { approveAndStake, state: approveAndStakeErc20State } =
    useStakeTokens(address);

  const handleStakeSubmit = () => {
    const amountAsWei = utils.parseEther(amount.toString());
    return approveAndStake(amountAsWei.toString());
  };

  const isMining = approveAndStakeErc20State.status === 'Mining';

  useEffect(() => {
    // check if any succeed notifications with name "Approve ERC20 transfer" exist
    if (
      notifications.filter(
        (notif) =>
          notif.type === 'transactionSucceed' &&
          notif.transactionName === TransactionNames.APPROVE_ERC20_TRANSFER
      ).length > 0
    ) {
      console.log('approved');
    }

    if (
      notifications.filter(
        (notif) =>
          notif.type === 'transactionSucceed' &&
          notif.transactionName === TransactionNames.STAKE_TOKENS
      ).length > 0
    ) {
      console.log('staked');
    }
  }, [notifications]);

  return (
    <>
      <Input
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value === '' ? null : setAmount(parseFloat(e.target.value))
        }
      />
      <Button
        onClick={handleStakeSubmit}
        color='primary'
        size='large'
        disabled={isMining}
      >
        {isMining ? <CircularProgress size={26} /> : 'Stake!'}
      </Button>
    </>
  );
};

export default StakeForm;
