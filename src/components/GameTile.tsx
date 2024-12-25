// @ts-nocheck

import React from "react";
import {
    Panel,
    PanelGroup,
    PanelResizeHandle
} from 'react-resizable-panels';
import { Apple, BadgeDollarSign, BadgeEuro, Camera } from 'lucide-react';
import { Affix, Anchor, Avatar, Button, Card, Col, Divider, Flex, Input, Radio, Row, Steps, Switch } from 'antd';
import { create } from "zustand";
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { useState } from "react";
import styled from "@emotion/styled";
import _, { first, take } from 'lodash';
import GamePanel, { StatusPanel } from "./GamePanel";
import { couldWinNextStep, filterOpenedTiles, GameResult, getChunkedMovements, getGameResult, getLoserName, getWinner, getWinnerName, hasWinner, includesStep, isFirstPlayerMove } from "../utils";
import { Merge } from "type-fest";
import { Combos, Conta, ContaItem, Movement } from "../emotis/combos";
import { useInterval } from 'usehooks-ts';
import delay from "delay";
import { makeStep } from "../engine/medium-level-robot";
import { Shake } from "reshake";

type TileProps = {
    bgColor?: string;
};

const Tile = styled.div`
    width: 25px;
    height: 25px;
    padding: 5px;
    margin: 10px;
    background-color: ${(props: TileProps) => props.bgColor || 'red'};
`;

const Break = styled.div`
  flex-basis: 100%;
  height: 0;
`;

const Gu = styled.div`
    background-color: cyan;
`;

const BoardWrapper = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${props => props.isOver ? 'cyan' : ''};
`;

const running = 'running';
const over = 'over';

type GameStatus = running | over | 'waiting';

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

type Step = {
    coord: string;
    color: string;
}

type BoardStateProps = {
    tiles: number;
    sign: string;
    makeB: any;
    gameIndex: number;
    gameDelay: number;
    gameStatus: GameStatus;
    isOver: boolean;
    isAutoPlay: boolean;
    isAgainsRobot: boolean;
    firstPlayerName: string;
    secondPlayerName: string;
    winner: string;
    hasNextWinner: boolean;
    nextStepWinner: boolean;
    openedByUserSteps: Array<any>;
    items: Array<GameItem>;
    displayingRoundMovementsNumber: number;
    addToOpenedByUserSteps: Function;
    clearOpenedByUserSteps: Function;
    openStep: (step: Step) => any;
    openTile: (id: string) => any;
    clearBoard: (id: string) => any;
    reset: () => any;
    bar: number;
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
    changeDisplayingRoundMovementsNumber: () => {},
}

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
    gameStatus: 'waiting',
    bar: 0,
    isOver: false,
    isAutoPlay: false,
    isAgainsRobot: false,
    displayingRoundMovementsNumber: 1,
    takenCombinations: [],
    openedByUserSteps: [],
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
            state.gameStatus = over;
            state.winner = w + ' - ' + getLoserName(state.items);
            state.isAutoPlay = false;
        }

        if (hasWinner(state.items)) {
            state.winner = getWinnerName(state.items);
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
        state.gameStatus = 'waiting';
    }),
    clearBoard: () => set((state: BoardStateProps) => {
        state.items = _.map(state.items, (elem) => ({...elem, isOpened: false, color: 'grey'}));
    }),
    addToOpenedByUserSteps: (step: Step) => set((state: BoardStateProps) => {
        state.openedByUserSteps.push(step);
    }),
    clearOpenedByUserSteps: () => set((state: BoardStateProps) => {
        state.openedByUserSteps = [];
    }),
    openStep: (step: Step) => set((state: BoardStateProps) => {
        console.log('BATX', step.coord.split('x'));
        const [x, y] = step.coord.split('x');
        console.log(_.map(state.items, itm => itm.x));
        state.items = _.map(state.items, (item) => item.x == x && item.y == y ? ({ ...item, isOpened: true, color: step.color }) : item);
    }),
    openTile: (id: string) => set((state: BoardStateProps) => {
        const tileToOpen = _.find(state.items, {id: id, isOpened: false});
        if (tileToOpen) {
            const color = isFirstPlayerMove(state.items) ? 'red' : 'cyan';
            state.roundSteps[state.roundSteps.length-1].push({coord: `${tileToOpen.x}x${tileToOpen.y}`, color });
            // appendMovement(`${tileToOpen.x}x${tileToOpen.y}`);
            state.items = _.map(state.items, (elem) => elem.id === id && !elem.isOpened ? { ...elem, isOpened: true, color, sign: elem.sign === 'a' ? 'b' : 'a' } as GameItem : elem);
        }
        
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
        // console.log('________________________L<AKKKKKKKKKKKKKKKKKKKKKKKKKKKK>____________________________');

        if (calculatedTile) {
            // console.log('DSY');
            // get().openTile(calculatedTile);
            const color = isFirstPlayerMove(state.items) ? 'red' : 'cyan';
            state.roundSteps[state.roundSteps.length-1].push({coord: `${calculatedTile.x}x${calculatedTile.y}`, color });
            state.items = _.map(state.items, (elem) => elem.id === calculatedTile.id && !elem.isOpened ? { ...elem, isOpened: true, color: isFirstPlayerMove(state.items) ? 'red' : 'cyan', sign: elem.sign === 'a' ? 'b' : 'a' } as GameItem : elem);
            // state.openTile(rndTile!.id);
            // state.items = _.map(state.items, (elem) => elem.id === rndTile.id && !elem.isOpened ? { ...elem, isOpened: true, color: state.gameIndex % 2 === 0 ? 'red' : 'cyan', sign: elem.sign === 'a' ? 'b' : 'a' } as GameItem : elem);
            // state.openTile(rndTile.id);
            // state.items = _.map(state.items, item => _.isEqual(item, rndTile) ? _.merge(item, { isOpened: true }) : item);
        }

    }),
    // (state: BoardStateProps) => state ({...state, gameIndex: state.gameIndex + 1, items: _.map(state.items, (elem) => elem.id === id && !elem.isOpened ? {...elem, isOpened: true, color: state.gameIndex % 2 === 0 ? 'red' : 'cyan', sign: elem.sign === 'a' ? 'b' : 'a'} as GameItem : elem)})),
    setColor: (id: string, color: string) => set((state: BoardStateProps) => {
        state.gameIndex = 3;
    }),
    automaticRun: () => set((state: BoardStateProps) => {
        if (!state.isAutoPlay || state.isOver) {
            return;
        }

        const notOpened = _.filter(state.items, (obj: GameItem) => !obj.isOpened);
        const randomItem = _.sample(notOpened);

        // await asyncTimeout(1500);

        if (randomItem) {
            const isFirstPlayerMove = _.filter(state.items, (item: GameItem) => item.isOpened).length % 2 === 0;
            state.items = _.map(state.items, (elem) => elem.id === randomItem.id && !elem.isOpened ? { ...elem, isOpened: true, color: isFirstPlayerMove ? 'red' : 'cyan', sign: elem.sign === 'a' ? 'b' : 'a' } as GameItem : elem);
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
    //     (set(state: BoardStateProps) => {
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
        state.roundSteps.push([]);
        state.hasNextWinner = false;
        state.items = hop;
        state.isOver = false;
        state.winner = '';
        state.gameStatus = 'running';
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
    changeDisplayingRoundMovementsNumber: (value: number) => set((state: BoardStateProps) => {
        if (value > 0 && value <= state.roundSteps.length) {
            console.log('setting', value);
            state.displayingRoundMovementsNumber = value;
        } else {
            console.log('Not setting', value);
        }
    })
}))));

const GameTile = () => {
    const makeB = useTileStore((state: BoardStateProps) => state.makeB);
    const sign = useTileStore((state: BoardStateProps) => state.sign);
    const gameIndex = useTileStore((state: BoardStateProps) => state.gameIndex);
    const gameStatus = useTileStore((state: BoardStateProps) => state.gameStatus);
    const gameDelay = useTileStore((state: BoardStateProps) => state.gameDelay);
    const firstPlayerName = useTileStore((state: BoardStateProps) => state.firstPlayerName);
    const secondPlayerName = useTileStore((state: BoardStateProps) => state.secondPlayerName);
    const items = useTileStore((state: BoardStateProps) => state.items);
    const isOver = useTileStore((state: BoardStateProps) => state.isOver);
    const isAgainsRobot = useTileStore((state: BoardStateProps) => state.isAgainsRobot);
    const isAutoPlay = useTileStore((state: BoardStateProps) => state.isAutoPlay);
    const displayingRoundMovementsNumber = useTileStore((state: BoardStateProps) => state.displayingRoundMovementsNumber);
    const takenCombinations = useTileStore((state: BoardStateProps) => state.takenCombinations);
    const winner = useTileStore((state: BoardStateProps) => state.winner);
    const openStep = useTileStore((state: BoardStateProps) => state.openStep);
    const openTile = useTileStore((state: BoardStateProps) => state.openTile);
    const addToOpenedByUserSteps = useTileStore((state: BoardStateProps) => state.addToOpenedByUserSteps);
    const openedByUserSteps = useTileStore((state: BoardStateProps) => state.openedByUserSteps);
    const clearBoard = useTileStore((state: BoardStateProps) => state.clearBoard);
    const checkOver = useTileStore((state: BoardStateProps) => state.checkOver);
    const automaticRun = useTileStore((state: BoardStateProps) => state.automaticRun);
    const toggleInterval = useTileStore((state: BoardStateProps) => state.toggleInterval);
    const startNewRound = useTileStore((state: BoardStateProps) => state.startNewRound);
    const willWinnerNextStep = useTileStore((state: BoardStateProps) => state.willWinnerNextStep);
    const makeRobotMove = useTileStore((state: BoardStateProps) => state.makeRobotMove);
    const toggleAgainstRobot = useTileStore((state: BoardStateProps) => state.toggleAgainstRobot);
    const roundSteps = useTileStore((state: BoardStateProps) => state.roundSteps);
    const reset = useTileStore((state: BoardStateProps) => state.reset);
    const changeDisplayingRoundMovementsNumber = useTileStore((state: BoardStateProps) => state.changeDisplayingRoundMovementsNumber);

    const unsub = useTileStore.subscribe((state: BoardStateProps) => {     // @ts-ignore
        return state.items;
        // return (a: any) => {
        //     console.log('================', a);
        // }
    }, (va: any) => {
        console.log('sas======', va);
        checkOver();
        // console.log('YYYYYYYYYYYYYYY', va);
    }, { equalityFn: _.isEqual });
    // useTileStore.

    useInterval(() => {
        automaticRun();
        // checkOver();
    }, isAutoPlay ? gameDelay : null);
    const [tp, setTp] = useState<number>(100);
    const [bt, setBt] = useState<number>(100);

    return <PanelGroup direction='horizontal'>
        <>
            <Panel id='sidebar' minSize={10} maxSize={20} order={1}>
                <Flex vertical gap="middle" align="center" justify="center">
                    <Col>
                        <p>GI: {gameIndex}</p>
                    </Col>
                    <Col>
                        <p>
                            {
                                isOver
                                    ? 'Game is ove'
                                    : (gameIndex % 2 === 0 ? firstPlayerName : secondPlayerName) + "'s turn"
                            }

                        </p>
                    </Col>
                    <Col>
                        <p>Game Status: {gameStatus}</p>
                    </Col>
                </Flex>
                <Card
                    hoverable={true}
                    style={{ width: 320, display: 'none' }}
                    actions={[
                        <Camera />,
                        <Apple />
                    ]}
                    title="Need more information"
                    extra={<Button type="primary">Details</Button>}
                    cover={
                        <div style={{
                            height: 150,
                            width: '100%',
                            background: 'linear-gradient(#FF007A, #4200FF)',
                            color: 'white',
                            fontSize: 30,
                            paddingTop: 200,
                        }} />
                    }
                >
                    <p>Stign</p>
                            <Card.Meta
                            style={{
                                display: "flex",
                                flexDirection: 'column',
                                marginTop: -60,
                            }}
                                avatar={
                                    <Avatar src="https://www.gravatar.com/avatar/a021d1244f918f49610e162529d8e499?s=64&d=identicon&r=PG" />
                                }
                                title="Code with Amajer"
                                description="@CodeWithAmajer"
                            >
                                <p>POan</p>
                            </Card.Meta>
                </Card>
                <Flex vertical gap='middle' align="center" justify="center">
                        <Button
                            onClick={() => {
                                toggleInterval();
                            }}
                        >
                            {
                                isOver ?
                                    'Rnn' :
                                    isAutoPlay ? 'Stop' : 'Make automatic play'
                            }
                        </Button>
                        <Button hidden={true} onClick={() => {
                            unsub();

                            if (true) {
                                
                            }
                        }}>
                            Not click
                        </Button>
                        <Button onClick={() => {
                            startNewRound();
                        }}>
                            Start new round
                        </Button>
                        <Switch defaultChecked={false} disabled={gameStatus === 'running'} checkedChildren='Against robot' unCheckedChildren='Against user' onChange={() => {
                            toggleAgainstRobot();
                        }} />
                        <Button onClick={() => reset()}>
                            Reset
                        </Button>
                </Flex>
                <Flex vertical>
                    <Col>
                        <Input
                            style={{width: '60px'}}
                            size="large"
                            placeholder="Round number"
                            onChange={(event) => {
                                event.preventDefault();
                                console.log('ah', event.target.value);
                                changeDisplayingRoundMovementsNumber(event.target.value);
                            }}
                        />
                        <Button size='middle' onClick={() => {

                        }}>Show</Button>
                        <p>Round: {displayingRoundMovementsNumber}</p>
                        {
                            _.map(roundSteps, (roundStep, i) => {
                                return <Combos key={i} hidden={i !== displayingRoundMovementsNumber - 1 && false}>
                                    {
                                        getChunkedMovements(roundSteps[i]).map((movementPair: string[], j: number) => (
                                            // const wasOpened = _.every(movementPair, openedByUserSteps.includes);

                                            <Movement key={_.uniqueId()} disabled={!isOver} opened={includesStep(openedByUserSteps, movementPair)} onClick={(event) => {
                                                const toShow = _.slice(getChunkedMovements(roundSteps[i]), 0, j + 1);
                                                const [x, y] = toShow[0][0].coord.split('x');

                                                
                                                console.log(`+==========toShow======: ${JSON.stringify(toShow)}`);
                                                console.log('sds---', x, y);
                                                console.log('SHHSHS', toShow[0][0]);

                                                if (isOver) {
                                                    clearBoard();
                                                    console.log('INV MAP');
                                                    _.map(toShow, item => {
                                                        console.log(item);
                                                        _.map(item, step => {
                                                            addToOpenedByUserSteps(step);
                                                            openStep(step);
                                                        });
                                                        // const tata = _.invokeMap([item], openStep);
                                                        // console.log('INV MAP END', tata);
                                                    })
                                                    
                                                    console.log('INV MAP END');
                                                    // _.map(toShow, tilePair => {
                                                        // _.invokeMap(tilePair, openStep);
                                                    // });
                                                }
                                                
                                                console.log(`${JSON.stringify(movementPair[0])} (${_.get(movementPair, "0.coord")}) - ${JSON.stringify(movementPair[1])} (${_.get(movementPair, "1.coord")})`);

                                            }}>
                                                {`${_.join([_.get(movementPair, "0.coord"), _.get(movementPair, "1.coord")], '-')}`}
                                            </Movement>
                                        ))
                                    }
                                </Combos>
                            })
                        }
                    </Col>
                    {/* <Col>
                        <Combos>
                            {
                                _.chunk(takenCombinations, 2).map((el: string[], i: number) => (
                                    <Movement key={i}>
                                        <span>{el[0]}; </span><span>{el[1]}</span>
                                    </Movement>
                                ))
                            }
                        </Combos>
                    </Col> */}
                </Flex>
            </Panel>
            <PanelResizeHandle />
        </>
        <Panel minSize={25} color="orange">
            <StatusPanel>
                <Steps
                    current={gameStatus === 'over' ? 2 : gameStatus === 'running' ? 1 : 0}
                    items={[
                        {
                            title: 'Waiting',
                            description: gameStatus !== running ? 'Click Start new round to start a new round' : '',
                        },
                        {
                            title: 'In progress',
                            description: `Turn: ${_.filter(items, (item) => item.isOpened).length % 2 === 0 ? 'Player 1' : 'Player 2'}`,
                        },
                        {
                            title: 'Finished',
                            description: 'Game is over',
                        }
                    ]}
                >
                </Steps>
                {isOver && winner !== '' ?
                    <Row>
                        <p>Winner: {winner}</p>
                    </Row> :
                    null
                }
            </StatusPanel>
            <GamePanel isOver={isOver}>
                <Shake h={10} v={0} r={3} active={true}>
                    Bathz
                </Shake>
                {items.map((item, ind) => {
                    return ind % 5 === 0 ?
                        <>
                            <Break />
                            <Tile key={ind} bgColor={item.color} onClick={async () => {
                                if (!item.isOpened && !isOver && !isAutoPlay) {
                                    openTile(item.id);
                                    checkOver();
                                    if (isAgainsRobot) {
                                        makeRobotMove();
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
                                checkOver();
                                if (true) {
                                    
                                }
                                if (isAgainsRobot) {
                                    makeRobotMove();
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
    Step,
}
