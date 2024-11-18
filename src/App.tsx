import React from 'react';
import logo from './logo.svg';
import './App.css';
import Tile from './components/Tile';
import GamePanel from './components/GamePanel';
import GameTile from './components/GameTile';
import styled from '@emotion/styled';

const Row = styled.div`
  width: 400px;
  background-color: cyan;
`;

const Break = styled.div`
  flex-basis: 100%;
  height: 0;
`

function App() {
  return (
    <div className="App">
      {/* <GamePanel> */}
        {/* <Row> */}
          <GameTile />
          {/* <Tile bgColor='cyan' />
          <Tile />
          <Tile bgColor='cyan' /> */}
        {/* </Row> */}
      {/* </GamePanel> */}
    </div>
  );
}

export default App;
