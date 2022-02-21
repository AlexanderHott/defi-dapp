import { useEthers } from '@usedapp/core';
import React from 'react';
import { Button, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4),
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
  },
}));

const Header = () => {
  const classes = useStyles();

  const { account, activateBrowserWallet, deactivate } = useEthers();
  const isConnected = account !== undefined;

  return (
    <div className={classes.container}>
      <div>
        {isConnected ? (
          <Button color='default' onClick={deactivate} variant='contained'>
            Disconnect
          </Button>
        ) : (
          <Button
            color='primary'
            onClick={activateBrowserWallet}
            variant='contained'
          >
            Connect
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;
