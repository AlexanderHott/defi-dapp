import { useEthers, useTokenBalance, useNotifications } from '@usedapp/core';
import React, { useEffect, useState } from 'react';
import { Token } from '../Main';
import { formatUnits } from '@ethersproject/units';
import { Button, CircularProgress, Input, Snackbar } from '@material-ui/core';
import { useStakeTokens } from '../../hooks';
import { utils } from 'ethers';
import { TransactionNames } from '../../utils';
import { Alert } from '@material-ui/lab';

type StakeFormProps = {
  token: Token;
};

const StakeForm = ({ token }: StakeFormProps) => {
  const [amount, setAmount] = useState<number>(0);
  const { notifications } = useNotifications();

  const { address } = token;

  const { approveAndStake, state: approveAndStakeErc20State } =
    useStakeTokens(address);

  const handleStakeSubmit = () => {
    const amountAsWei = utils.parseEther(amount.toString());
    return approveAndStake(amountAsWei.toString());
  };

  // button text / spinner
  const isMining = approveAndStakeErc20State.status === 'Mining';
  // Notifications
  const [showErc20Approval, setShowErc20Approval] = useState(false);
  const [showStakeTokenSuccess, setShowStakeTokenSuccess] = useState(false);
  const handleCloseSnack = () => {
    setShowErc20Approval(false);
    setShowStakeTokenSuccess(false);
  };

  useEffect(() => {
    // check if any succeed notifications with name "Approve ERC20 transfer" exist
    if (
      notifications.filter(
        (notif) =>
          notif.type === 'transactionSucceed' &&
          notif.transactionName === TransactionNames.APPROVE_ERC20_TRANSFER
      ).length > 0
    ) {
      setShowErc20Approval(true);
      setShowStakeTokenSuccess(false);
    }

    if (
      notifications.filter(
        (notif) =>
          notif.type === 'transactionSucceed' &&
          notif.transactionName === TransactionNames.STAKE_TOKENS
      ).length > 0
    ) {
      setShowErc20Approval(false);
      setShowStakeTokenSuccess(true);
    }
  }, [notifications, showErc20Approval, showStakeTokenSuccess]);

  return (
    <>
      <div>
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
      </div>
      <Snackbar
        open={showErc20Approval}
        autoHideDuration={5000}
        onClose={handleCloseSnack}
      >
        <Alert onClose={handleCloseSnack} severity='success'>
          ERC20 Token transfer approved! Now approve the transaction to stake!
        </Alert>
      </Snackbar>
      <Snackbar
        open={showStakeTokenSuccess}
        autoHideDuration={5000}
        onClose={handleCloseSnack}
      >
        <Alert onClose={handleCloseSnack} severity='success'>
          Token Staked!
        </Alert>
      </Snackbar>
    </>
  );
};

export default StakeForm;
