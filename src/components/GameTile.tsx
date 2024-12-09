// @ts-nocheck

import React from "react";
import {
    Panel,
    PanelGroup,
    PanelResizeHandle
} from 'react-resizable-panels';
import { Apple, BadgeDollarSign, BadgeEuro, Camera } from 'lucide-react';
import { Affix, Anchor, Button, Card, Col, Divider, Radio, Row, Switch } from 'antd';
import { create } from "zustand";
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { useState } from "react";
import styled from "@emotion/styled";
import _, { first, take } from 'lodash';
import GamePanel from "./GamePanel";
import { couldWinNextStep, filterOpenedTiles, GameResult, getGameResult, getLoserName, getWinner, getWinnerName, hasWinner, isFirstPlayerMove } from "../utils";
import { Merge } from "type-fest";
import { Combos, Conta, ContaItem, Movement } from "../emotis/combos";
import { useInterval } from 'usehooks-ts';
import delay from "delay";
import { makeStep } from "../engine/medium-level-robot";

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
`;

const Gu = styled.div`
    background-color: cyan;
`;

type GameItem = {
    id: string;
    sign: string,
    isOpened: boolean,
    color: string,
    x: number;
    y: number;
};

type RoundStoreProps = {
    startNewRound: any;
    addRoundItem: any;
    roundSteps: Array<any>;
    appendMovement: any;
};

type BoardStateProps = {
    tiles: number;
    sign: string;
    makeB: any;
    gameIndex: number;
    gameDelay: number;
    isOver: boolean;
    isAutoPlay: boolean;
    isAgainsRobot: boolean;
    firstPlayerName: string;
    secondPlayerName: string;
    winner: string;
    hasNextWinner: boolean;
    nextStepWinner: boolean;
    items: Array<GameItem>;
    openTile: (id: string) => any;
    reset: () => any,
    setColor: any;
    automaticRun: any;
    checkOver: any;
    checkNextStep: any;
    willWinnerNextStep: any;
    appendMovement: any;
    roundSteps: Array<any>;
    takenCombinations: Array<any>;
    addRoundItem: any;
    startNewRound: any;
    toggleAgainstRobot: any;
    makeRobotMove: any;
    gameIntervalId?: ReturnType<typeof setInterval>;
    toggleInterval?: any;
}

type TileStateProps = BoardStateProps;

const asyncTimeout = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

const canvas = document.createElement(`canvas`);
const context = canvas.getContext(`2d`);

// const camera = new Deakins(context);

// function loop() {
//   camera.begin();

//   // Look at point in space,
//   camera.lookA([20, 90]);

//   // Zoom
//   camera.zoomTo(500);

//   camera.end();
//   requestAnimationFrame(loop);
// }

// loop();

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

// const gameRoundsStore = create<RoundStoreProps, any>(immer((set) => ({
//     roundSteps: [],
//     starteNewRound: () => set((state: RoundStoreProps) => {
//         state.roundSteps.push([]);
//     }),
//     addRoundItem: () => set((state: RoundStoreProps) => {
//         state.roundSteps[state.roundSteps.length - 1].push()
//     }),
// }));

const useTileStore = create<BoardStateProps, any>(subscribeWithSelector(immer((set) => ({
    tiles: 0,
    sign: 'a',
    hasNextWinner: false,
    firstPlayerName: 'Player 1',
    secondPlayerName: 'Player 2',
    winner: '',
    nextStepWinner: true,
    gameIndex: 0,
    isOver: false,
    isAutoPlay: false,
    isAgainsRobot: false,
    takenCombinations: [],
    gameDelay: 1000,
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
    checkOver: () => set((state: BoardStateProps) => {
        const w = getGameResult(state.items);

        if (w !== GameResult.none) {
            state.isOver = true;
            state.winner = w + ' - ' + getLoserName(state.items);
            state.isAutoPlay = false;
        }

        if (hasWinner(state.items)) {
            state.winner = getWinnerName(state.items);
        } else {
            state.gameIndex++;
        }
    }),
    checkNextStep: () => set((state: BoardStateProps) => {

    }),
    toggleAgainstRobot: () => set((state: BoardStateProps) => {
        state.isAgainsRobot = !state.isAgainsRobot;
    }),
    reset: () => set((state: BoardStateProps) => {
        state.items = hop;
        state.gameIndex = 0;
        state.isOver = false;
        state.isAutoPlay = false;
    }),
    openTile: (id: string) => set((state: BoardStateProps) => {
        console.log('dsdsvd', id);
        state.items = _.map(state.items, (elem) => elem.id === id && !elem.isOpened ? { ...elem, isOpened: true, color: isFirstPlayerMove(state.items) ? 'red' : 'cyan', sign: elem.sign === 'a' ? 'b' : 'a' } as GameItem : elem);
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

        // if (hasWinner(state.items)) {
        //     state.winner = getWinnerName(state.items);
        // } else {
        //     state.gameIndex++;
        // }
    }),
    makeRobotMove: () => set((state: BoardStateProps) => {
        if (_.reject(state.items, item => item.isOpened).length === 0) {
            return;
        }
        const allowedTiles = _.reject(state.items, (el) => el.isOpened === true);
        // const hasWi = couldWinNextStep(state.items);
        // if (hasWi) {
        //     _.find(state.items, (el) => {
        //         const nop = _.reject(state.items, _.property('isOpened'));
        //         _.filter(nop, (ele) => {
        //             return ele.isOpened ? { ...ele, isOpened: true } : ele;
        //         });
        //     });
        // }

        
        let calculatedTile = makeStep(state.items, 'cyan');

        if (!calculatedTile) {
            calculatedTile = _.sample(allowedTiles);
        }
        // else {
        //     calculatedTile = 
        // }
        // console.log('________________________L<AKKKKKKKKKKKKKKKKKKKKKKKKKKKK____________________________');

        if (calculatedTile) {
            console.log('DSY');
            state.items = _.map(state.items, (elem) => elem.id === calculatedTile.id && !elem.isOpened ? { ...elem, isOpened: true, color: isFirstPlayerMove(state.items) ? 'red' : 'cyan', sign: elem.sign === 'a' ? 'b' : 'a' } as GameItem : elem);
            // state.openTile(rndTile!.id);
            // state.items = _.map(state.items, (elem) => elem.id === rndTile.id && !elem.isOpened ? { ...elem, isOpened: true, color: state.gameIndex % 2 === 0 ? 'red' : 'cyan', sign: elem.sign === 'a' ? 'b' : 'a' } as GameItem : elem);
            // state.openTile(rndTile.id);
            // state.items = _.map(state.items, item => _.isEqual(item, rndTile) ? _.merge(item, { isOpened: true }) : item);
        }
        
    }),
    // (state: TileStateProps) => state ({...state, gameIndex: state.gameIndex + 1, items: _.map(state.items, (elem) => elem.id === id && !elem.isOpened ? {...elem, isOpened: true, color: state.gameIndex % 2 === 0 ? 'red' : 'cyan', sign: elem.sign === 'a' ? 'b' : 'a'} as GameItem : elem)})),
    setColor: (id: string, color: string) => set((state: BoardStateProps) => {
        state.gameIndex = 3;
    }),
    automaticRun: () => set((state: BoardStateProps) => {
        if (!state.isAutoPlay || state.isOver) {
            return;
        }

        const notOpened = _.filter(state.items, obj => !obj.isOpened);
        const randomItem = _.sample(notOpened);

        // await asyncTimeout(1500);

        if (randomItem) {
            state.items = _.map(state.items, (elem) => elem.id === randomItem.id && !elem.isOpened ? { ...elem, isOpened: true, color: state.gameIndex % 2 === 0 ? 'red' : 'cyan', sign: elem.sign === 'a' ? 'b' : 'a' } as GameItem : elem);
            state.gameIndex++;
            state.appendMovement(`${randomItem.x}x${randomItem.y}`);
            state.takenCombinations.push(`${randomItem.x}x${randomItem.y}`);
            // state.checkOver();
        }
    }),
    roundSteps: [[]],
    appendMovement: (move: string) => set((state: BoardStateProps) => {
        state.roundSteps[state.roundSteps.length - 1].push(move);
    }),
    //     (set(state: TileStateProps) => {
    //     return {...state, items: _.map(state.items, (b) => b.id === id ? b : {...b, color: color})}
    // }))),
    makeB: () => set((state: BoardStateProps) => ({ sign: state.sign === 'a' ? 'b' : state.sign === 'b' ? 'c' : 'a' })),
    willWinnerNextStep: () => set((state: BoardStateProps) => {
        state.hasNextWinner = couldWinNextStep(state.items);
    }),
    addRoundItem: () => set((state: BoardStateProps) => {
        state.roundSteps.push([]);
    }),
    startNewRound: () => set((state: BoardStateProps) => {
        state.roundSteps = [[]];
        state.hasNextWinner = false;
        state.items = hop;
        state.isOver = false;
        state.winner = '';
    }),
    toggleInterval: () => set((state: BoardStateProps) => {
        if (!state.isAutoPlay) {
            state.isAutoPlay = true;
            // state.gameDelay = undefined;
        } else {
            state.isAutoPlay = false;
            // state.gameDelay = 1500;
        }
        // if (state.gameIntervalId) {
        //     clearInterval(state.gameIntervalId);
        // } else {
        //     state.gameIntervalId = setInterval(() => {
        //         console.log('Runnng ', state.gameIndex);
        //         state.automaticRun();
        //         state.checkOver();
        //         state.willWinnerNextStep();
        //     }, 1500);
        // }
    }),
}))));

const GameTile = () => {
    const makeB = useTileStore((state: TileStateProps) => state.makeB);
    const sign = useTileStore((state: TileStateProps) => state.sign);
    const gameIndex = useTileStore((state: TileStateProps) => state.gameIndex);
    const gameDelay = useTileStore((state: TileStateProps) => state.gameDelay);
    const firstPlayerName = useTileStore((state: TileStateProps) => state.firstPlayerName);
    const secondPlayerName = useTileStore((state: TileStateProps) => state.secondPlayerName);
    const items = useTileStore((state: TileStateProps) => state.items);
    const isOver = useTileStore((state: TileStateProps) => state.isOver);
    const isAgainsRobot = useTileStore((state: TileStateProps) => state.isAgainsRobot);
    const isAutoPlay = useTileStore((state: TileStateProps) => state.isAutoPlay);
    const takenCombinations = useTileStore((state: TileStateProps) => state.takenCombinations);
    const winner = useTileStore((state: TileStateProps) => state.winner);
    const openTile = useTileStore((state: TileStateProps) => state.openTile);
    const checkOver = useTileStore((state: TileStateProps) => state.checkOver);
    const automaticRun = useTileStore((state: TileStateProps) => state.automaticRun);
    const toggleInterval = useTileStore((state: TileStateProps) => state.toggleInterval);
    const startNewRound = useTileStore((state: TileStateProps) => state.startNewRound);
    const willWinnerNextStep = useTileStore((state: TileStateProps) => state.willWinnerNextStep);
    const makeRobotMove = useTileStore((state: TileStateProps) => state.makeRobotMove);
    const toggleAgainstRobot = useTileStore((state: TileStateProps) => state.toggleAgainstRobot);
    const reset = useTileStore((state: TileStateProps) => state.reset);

    const unsub = useTileStore.subscribe((state: TileStateProps) => {     // @ts-ignore
        return state.items;
        console.log('sas======', state);
        // return (a: any) => {
        //     console.log('================', a);
        // }
    }, (va: any) => {
        checkOver();
        // console.log('YYYYYYYYYYYYYYY', va);
    }, { equalityFn: _.isEqual });

    useInterval(() => {
        automaticRun();
        // checkOver();
    }, isAutoPlay ? gameDelay : null);
    const [tp, setTp] = useState<number>(100);
    const [bt, setBt] = useState<number>(100);

    return <PanelGroup direction='horizontal'>
        <>
            <Panel id='sidebar' minSize={10} maxSize={20} order={1}>
                <Conta>
                    <ContaItem>
                        <p>
                            GI: {gameIndex}
                            {
                                isOver
                                    ? 'Game is ove'
                                    : (gameIndex % 2 === 0 ? firstPlayerName : secondPlayerName) + "'s turn"
                            }
                        </p>
                    </ContaItem>
                </Conta>
                <Conta>
                    <ContaItem>
                        <Button
                            onClick={() => {
                                toggleInterval();
                            }}
                        >
                            {
                                isOver ?
                                    'Rnn' :
                                    isAutoPlay ? 'Stop' : 'Start automatic'
                            }
                        </Button>
                        
                        <Button onClick={() => {
                            unsub();
                        }}>
                            Natsas
                        </Button>
                        
                        
                        <Button onClick={() => {
                            startNewRound();
                        }}>
                            Start new round
                        </Button>

                        <Switch defaultChecked={false} checkedChildren='Against robot' unCheckedChildren='Against robot' onChange={() => {
                                toggleAgainstRobot();
                            }}>Ag rob
                        </Switch>
                        <Row>
                            <Button onClick={() => reset()}>
                                Reset
                            </Button>
                        </Row>
                    </ContaItem>
                </Conta>
                <Conta>
                    <ContaItem>
                        <p>{winner}</p>
                    </ContaItem>
                    <ContaItem>
                        <Combos>
                            {
                                _.chunk(takenCombinations, 2).map((el: string[], i: number) => (
                                    <Movement key={i}>
                                        <span>{el[0]}; </span><span>{el[1]}</span>
                                    </Movement>
                                ))
                            }
                        </Combos>
                    </ContaItem>

                </Conta>
            </Panel>
            <PanelResizeHandle />
        </>
        <Panel minSize={25}>
            <GamePanel isOver={isOver}>
                {isOver ? 
                    <>
                        {winner !== '' ?
                            <Row>
                                <p>Winner: {winner}</p>
                            </Row> :
                            <Card>Draw</Card>}
                    </> :
                    <Row>
                        <Card color={gameIndex % 2 === 0 ? 'green' : 'grey'}>
                            <BadgeDollarSign color={gameIndex % 2 === 0 ? 'green' : 'grey'} /> 
                        </Card>
                        <Card color={gameIndex % 2 === 0 ? 'grey' : 'green'}>
                            <BadgeEuro color={gameIndex % 2 === 0 ? 'grey' : 'green'} /> 
                        </Card>
                    </Row>
                }
                {items.map((item, ind) => {
                    return ind % 5 === 0 ?
                        <>
                            <Break />
                            <Tile key={ind} bgColor={item.color} onClick={() => {
                                if (!item.isOpened && !isOver) {
                                    openTile(item.id);
                                    
                                    // checkOver();
                                    console.log('___________HGAHSX');
                                    if (isAgainsRobot) {
                                        console .log('Robot mvm');
                                        makeRobotMove();
                                        console.log('Robot mvm ----END');
                                    }
                                    // willWinnerNextStep();
                                }
                            }}>
                                {item.x === 1 ? <Camera /> : <Apple />}
                            </Tile>
                        </> :
                        <Tile key={ind} bgColor={item.color} onClick={() => {
                            if (!item.isOpened && !isOver) {
                                openTile(item.id);
                                // checkOver();
                                console.log('HGAHSX');
                                if (isAgainsRobot) {
                                    console.log('Robot mvm');
                                    makeRobotMove();
                                    console.log('Robot mvm ----END');
                                }
                                // willWinnerNextStep();
                            }
                        }}>
                            {item.x === 1 ? <Camera /> : <Apple />}
                        </Tile>
                }
                )}
            </GamePanel>
        </Panel>
    </PanelGroup>;
};

export default GameTile;

export type {
    GameItem,
}
