import { Container } from '@material-ui/core';
import React from 'react';
import { Header } from './components';

function App() {
  return (
    <div className='App'>
      <Header />
      <Container maxWidth='md'></Container>
    </div>
  );
}

export default App;
