import React from "react";
import { create } from "zustand";
import { immer } from 'zustand/middleware/immer';
import { useState } from "react";
import styled from "@emotion/styled";
import _, { first } from 'lodash';
import GamePanel from "./GamePanel";
import { GameResult, getGameResult, getWinner, getWinnerName, hasWinner } from "../utils";

type TileProps = {
    bgColor?: string;
};

const Tile = styled.div`
    width: 35px;
    height: 35px;
    padding: 20px;
    margin: 20px;
    background-color: ${(props: TileProps) => props.bgColor || 'red'};
`;

const Break = styled.div`
  flex-basis: 100%;
  height: 0;
`

type GameItem = {
    id: string;
    sign: string,
    isOpened: boolean,
    color: string,
    x: number;
    y: number;
};

type TileStateProps = {
    tiles: number;
    sign: string;
    makeB: any;
    gameIndex: number;
    isOver: boolean;
    firstPlayerName: string;
    secondPlayerName: string;
    winner: string;
    items: Array<GameItem>;
    openTile: any;
    checkOver: any;
};

type GameTileProps = {
    onClick: React.MouseEventHandler;
};

const hop = _.flatten(_.times(5, (i) => {
    return _.times(5, (j) => {
        return {
            id: _.uniqueId(), sign: 'a', color: 'grey', isOpened: false, x: i, y: j
        }
    })
}));

const useTileStore = create<TileStateProps, any>(immer((set) => ({
    tiles: 0,
    sign: 'a',
    firstPlayerName: 'Player 1',
    secondPlayerName: 'Player 2',
    winner: '',
    gameIndex: 0,
    isOver: false,
    items: hop, //_.times(9, () => ({ id: _.uniqueId(), sign: 'a', color: 'orange', isOpened: false, x: 0, y: 0 })),
    // [
    //     { id: _.uniqueId(), x: 0, y: 0, sign: 'a', isOpened: false },
    //     {id: _.uniqueId(), x: 1, y: 0, sign: 'a', isOpened: false},
    //     {id: _.uniqueId(), x: 1, y: 0, sign: 'a', isOpened: false},
    //     {id: _.uniqueId(), x: 1, y: 1, sign: 'a', isOpened: false},
    //     { id: _.uniqueId(), x: 0, y: 0, sign: 'a', isOpened: false },
    //     {id: _.uniqueId(), x: 1, y: 0, sign: 'a', isOpened: false},
    //     {id: _.uniqueId(), x: 1, y: 0, sign: 'a', isOpened: false},
    //     {id: _.uniqueId(), x: 1, y: 1, sign: 'a', isOpened: false},
    // ],
    checkOver: () => set((state: TileStateProps) => {
        const w = getGameResult(state.items);
        console.log(`SOOOO : ${w}`);
        if (w !== GameResult.none) {
            state.isOver = true;
            state.winner = w + ' - ' + getWinnerName(state.items);
            console.log('baa ', state.winner);
        }
    }),
    openTile: (id: string) => set((state: TileStateProps) => {
        state.items = _.map(state.items, (elem) => elem.id === id && !elem.isOpened ? {...elem, isOpened: true, color: state.gameIndex % 2 === 0 ? 'red' : 'cyan', sign: elem.sign === 'a' ? 'b' : 'a'} as GameItem : elem);
        // const firstPlayerTiles = _.filter(state.items, item => item.color === 'red');
        // let firstWin = false;
        // let secondWin = false;
        // _.map(firstPlayerTiles, item => {
        //     const directional = _.filter(firstPlayerTiles, item2 => item.id !== item2.id && item.x === item2.x);
        //     if (directional.length === 2) {
        //         firstWin = true;
        //         return;
        //     }
        // });
        // const secondPlayerTiles = _.filter(state.items, item => item.color === 'cyan');
        // _.map(secondPlayerTiles, item => {
        //     let directional = _.filter(secondPlayerTiles, item2 => item.id !== item2.id && item.x === item2.x);
        //     if (directional.length === 2) {
        //         secondWin = true;
        //         return;
        //     } else {
        //         directional = _.filter(secondPlayerTiles, item2 => item.id !== item2.id && item.y === item2.y);
        //     }
        // });
        // if (firstWin || secondWin) {
        //     state.winner = firstWin ? 'first' : 'second';
        //     state.gameIndex++;
        // }

        if (hasWinner(state.items)) {
            state.winner = getWinnerName(state.items);
        } else {
            state.gameIndex++;
        }
    }),
    // (state: TileStateProps) => state ({...state, gameIndex: state.gameIndex + 1, items: _.map(state.items, (elem) => elem.id === id && !elem.isOpened ? {...elem, isOpened: true, color: state.gameIndex % 2 === 0 ? 'red' : 'cyan', sign: elem.sign === 'a' ? 'b' : 'a'} as GameItem : elem)})),
    setColor: (id: string, color: string) => set((state: TileStateProps) => {
        state.gameIndex = 3;
    }),
    //     (set(state: TileStateProps) => {
    //     return {...state, items: _.map(state.items, (b) => b.id === id ? b : {...b, color: color})}
    // }))),
    makeB: () => set((state: TileStateProps) => ({ sign: state.sign === 'a' ? 'b' : state.sign === 'b' ? 'c' : 'a'})),
})));

const GameTile = () => {
    const makeB = useTileStore((state: TileStateProps) => state.makeB);
    const sign = useTileStore((state: TileStateProps) => state.sign);
    const gameIndex = useTileStore((state: TileStateProps) => state.gameIndex);
    const firstPlayerName = useTileStore((state: TileStateProps) => state.firstPlayerName);
    const secondPlayerName = useTileStore((state: TileStateProps) => state.secondPlayerName);
    const items = useTileStore((state: TileStateProps) => state.items);
    const isOver = useTileStore((state: TileStateProps) => state.isOver);
    const winner = useTileStore((state: TileStateProps) => state.winner);
    const openTile = useTileStore((state: TileStateProps) => state.openTile);
    const checkOver = useTileStore((state: TileStateProps) => state.checkOver);

    return <>
            <div>
                <p>
                    {
                        isOver
                            ? 'Game is over'
                            : (gameIndex % 2 === 0 ? firstPlayerName : secondPlayerName) + "'s turn"
                    }
                </p>
                <p>{winner}</p>
                <p>{gameIndex}</p>
            </div>
            <GamePanel>
                {items.map((item, ind) => {
                    return ind % 5 === 0 ? 
                            <>
                                <Break />
                                <Tile key={ind} bgColor={item.color} onClick={() => {
                                    if (!item.isOpened && !isOver) {
                                        openTile(item.id);
                                        checkOver();
                                    }
                                }}>
                                    {item.x === 1 ? <p>{item.x}x{item.y}</p> : <p>{item.x}x{item.y}</p>}
                                </Tile>
                            </> : 
                            <Tile key={ind} bgColor={item.color} onClick={() => {
                                if (!item.isOpened && !isOver) {
                                    openTile(item.id);
                                    checkOver();
                                }
                            }}>
                                {item.x === 1 ? <p>{item.x}x{item.y}</p> : <p>{item.x}y{item.y}</p>}
                            </Tile>
                    }
                )}
            </GamePanel>
        </>;
};

export default GameTile;

export type {
    GameItem,
}
