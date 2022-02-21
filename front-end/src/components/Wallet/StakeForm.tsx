import { useEthers, useTokenBalance } from '@usedapp/core';
import React, { useState } from 'react';
import { Token } from '../Main';
import { formatUnits } from '@ethersproject/units';
import { Button, Input } from '@material-ui/core';

type StakeFormProps = {
  token: Token;
};

const StakeForm = ({ token }: StakeFormProps) => {
  const [amount, setAmount] = useState<number>(0);

  const { address, name } = token;
  const { account } = useEthers();
  const tokenBalance = useTokenBalance(address, account);
  const formattedTokenBalance = tokenBalance
    ? parseFloat(formatUnits(tokenBalance.toString()))
    : 0;

  console.log(amount);
  return (
    <>
      <Input
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value === '' ? null : setAmount(parseFloat(e.target.value))
        }
      />
      <Button color='primary'>Stake!</Button>
    </>
  );
};

export default StakeForm;
