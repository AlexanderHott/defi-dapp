import { Box, makeStyles, Tab } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import React, { useState } from 'react';
import { StakeForm, WalletBalance } from '..';
import { Token } from '../Main';

const useStyles = makeStyles((theme) => ({
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(4),
  },
  box: {
    backgroundColor: 'white',
    borderRadius: '25px',
  },
  header: {
    color: 'white',
  },
}));

type WalletProps = {
  supportedTokens: Array<Token>;
};

const Wallet = ({ supportedTokens }: WalletProps) => {
  const classes = useStyles();

  const [tknIdx, setTknIdx] = useState<number>(0);
  return (
    <Box>
      <h1 className={classes.header}>Your Wallet!</h1>
      <Box className={classes.box}>
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
              <TabPanel value={idx.toString()} key={idx}>
                <div className={classes.tabContent}>
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
