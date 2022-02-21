import { Box, Tab } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import React, { useState } from 'react';
import { StakeForm, WalletBalance } from '..';
import { Token } from '../Main';

type WalletProps = {
  supportedTokens: Array<Token>;
};

const Wallet = ({ supportedTokens }: WalletProps) => {
  const [tknIdx, setTknIdx] = useState<number>(0);
  return (
    <Box>
      <div>Your Wallet!</div>
      <Box>
        <TabContext value={tknIdx.toString()}>
          <TabList
            onChange={(e: React.ChangeEvent<{}>, newVal: string) =>
              setTknIdx(parseInt(newVal))
            }
            aria-label='stake form tabs'
          >
            {supportedTokens.map((tkn, idx) => {
              return <Tab label={tkn.name} value={idx.toString()} key={idx} />;
            })}
          </TabList>
          {supportedTokens.map((tkn, idx) => {
            return (
              <TabPanel value={idx.toString()}>
                <div>
                  <WalletBalance token={tkn} />
                  <StakeForm token={tkn} />
                </div>
              </TabPanel>
            );
          })}
        </TabContext>
      </Box>
    </Box>
  );
};

export default Wallet;
