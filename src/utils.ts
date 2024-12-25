import _ from 'lodash';
import { Step, type GameItem } from "./components/GameTile";
import { mapping, opponentColors } from './constants';

// const getWinnerBy = (items: GameItem[], source: string) => {
//     const firstPlayerTiles = _.filter(items, item => item.color === source);
//     // let result = false;
//     const horizontal = _.groupBy(firstPlayerTiles, _.property('y'));
//     if (_.some(_.values(horizontal), openedTiles => openedTiles.length === 3)) {
//         return true;
//     }
//     return false;
// }

enum GameResult {
    draw = 'draw',
    win = 'win',
    none = 'none',
};

const getGameResult = (items: GameItem[]) => {
    // console.log('cdsvfd', _.map(items, 'isOpened'));
    let ra = '';
    _.forEach(items, el => {
        ra += el.isOpened ? 'YE; ' : 'NO; ';
    });
    console.log('_____CDL ', ra);
    if (getLoserName(items)) {
        return GameResult.win;
    }
    if (_.every(items, _.property('isOpened'))) {
        return GameResult.draw;
    }
    return GameResult.none;
    // const b = getWinnerBy(items, 'cyan');
    // if (b) {
    //     return true;
    // }
}

const hasWinner = (items: GameItem[]) => {
    const a = getWinnerNameBy(items, 'red');
    if (a) {
        return true;
    }
    const b = getWinnerNameBy(items, 'cyan');
    if (b) {
        return true;
    }
    return false;
}

const getChunkedMovements = (items: string[]) => {
    return _.chain(items).chunk(2).value();
    // .filter((pair) => pair.length === 2).value();
};

const getWinnerNameByOld = (items: GameItem[], source: string) => {
    // const da = isWin(items, '');
    const firstPlayerTiles = _.filter(items, item => item.color === source);
    const horizontal = _.groupBy(firstPlayerTiles, _.property('y'));
    if (_.some(_.values(horizontal), openedTiles => openedTiles.length === 3)) {
        console.log('fg er', _.get(_.values(horizontal), '0'));
        return _.get(_.values(horizontal), '0.0.color');
    }
    return '';
};

const includesStep = (openedSteps: Step[], pair: Step[]) => {
    return _.every(pair, openedSteps.includes);
};

const getLoserName = (items: GameItem[]) => {
    let loser = getWinnerNameBy(items, 'red');
    console.log(`1 ----- ${loser}`);
    console.log(opponentColors);
    if (loser) return mapping[_.get(opponentColors, loser)];
    loser = getWinnerNameBy(items, 'cyan');
    console.log(`2 ----- ${loser}`);
    if (loser) return mapping[_.get(opponentColors, loser)];
    return '';
};

const getWinnerName = (items: GameItem[]) => {
    let winner = getWinnerNameBy(items, 'red');
    if (winner !== '') return mapping[winner];
    winner = getWinnerNameBy(items, 'cyan');
    if (winner !== '') return mapping[winner];
    return '';
};

const filterOpenedTiles = (items: GameItem[]) => {
    return _.filter(items, _.property('isOpened'));
};

const isFirstPlayerMove = (items: GameItem[]) => {
    return filterOpenedTiles(items).length % 2 === 0;
};

const getWinnerNameBy = (items: GameItem[], source: string) => {
    const firstPlayerTiles = _.filter(items, item => item.color === source);
    let result = false;
    const horizontal = _.groupBy(firstPlayerTiles, _.property('y'));
    if (_.some(_.values(horizontal), openedTiles => openedTiles.length === 5)) {
        console.log('--------------HORIZONTAL---------------------');
        return source;
    }
    const vertical = _.groupBy(firstPlayerTiles, _.property('x'));
    if (_.some(_.values(vertical), openedTiles => openedTiles.length === 5)) {
        console.log('--------------VERTICAL---------------------');
        return source;
    }
    const diagonal = _.groupBy(firstPlayerTiles, item => `${item.x}x${item.y}`);
    let diagonalItems = [];
    // 2,0 1,1; 0,2
    // 4,0; 3,1; 2,2; 1,3; 0,4

    _.map(firstPlayerTiles, item => {
        if (item.x === item.y) {
            diagonalItems.push(item);
        }
    });
    if (diagonalItems.length >= 5) {
        return source;
    }
    const oppositeDiagonal = [];
    const centralItem = _.find(firstPlayerTiles, item => item.x === item.y);
    if (centralItem) {
        const centralX = centralItem!.x;
        const centralY = centralItem!.y;
        let j = centralY;
        for (let i = centralX + 1; i <= _.maxBy(firstPlayerTiles, item => item.x)!.x; i++) {
            if (j > 0) {
                j = j - 1;
                const found = _.find(firstPlayerTiles, item => item.x === i && item.y === j);
                if (found) {
                    // found = true;
                    oppositeDiagonal.push(found);
                    // break;
                }
            }
            // if (j < 0) {
            //     if (_.find(firstPlayerTiles, item => item.x === i)) {

            //     }
            // }
        }
        j = centralY;
        for (let i = centralX; i >= 0; i--) {
            const found = _.find(firstPlayerTiles, item => item.x === i && item.y === j);
            if (found) {
                oppositeDiagonal.push(found);
            }
            if (j < _.maxBy(firstPlayerTiles, item => item.y)!.y) {
                j++;
            } else {
                break;
            }
        }
    }
    if (oppositeDiagonal.length >= 5) {
        return source;
    }
    // _.reduce(diagonal, (prev: any, curr, k) => {
    //     curr.x
    //     prev[k] ||= [];
    //     return prev;
    // }, {});
    // if (_.some(_.values(diagonal), openedTiles => openedTiles.length === 3)) {
    //     return source;
    // }
    return '';

    // _.map(firstPlayerTiles, item => {

    //     const horizontal = _.filter(firstPlayerTiles, item2 => item.id !== item2.id && item.x === item2.x);
    //     if (horizontal.length === 2) {
    //         result = true;
    //         return;
    //     }
    // });
    // _.map(firstPlayerTiles, item => {
    //     const directional = _.filter(firstPlayerTiles, item2 => item.id !== item2.id && item.y === item2.y);
    //     if (directional.length === 2) {
    //         result = true;
    //         return;
    //     }
    // });
    // _.map(firstPlayerTiles, item => {
    //     const directional = _.filter(firstPlayerTiles, item2 => item.id !== item2.id && item.x === item.y);
    //     if (directional.length === 2) {
    //         result = true;
    //         return;
    //     }
    // });
    // _.map(firstPlayerTiles, item => {
    //     const directional = _.filter(firstPlayerTiles, item2 => item.id !== item2.id && Math.abs(item.x - item.y) === 2 || (item.x === item.y && item.x > 0 && item.y > 0 && item.x < 2));
    //     if (directional.length === 2) {
    //         result = true;
    //         return;
    //     }
    // });

    // return result ? 'first' : '';
};

const getWinner = (items: GameItem[]) => {
    const first = getWinnerNameBy(items, 'red');
    if (first !== '') {
        console.log('____________________FIRST WIN _______________________');
        return first;
    }
    const second = getWinnerNameBy(items, 'cyan');
    if (second !== '') {
        console.log('____________________SECOND WIN _______________________');
        return second;
    }
    return '';
    // const firstPlayerTiles = _.filter(items, item => item.color === source);
    //     let firstWin = false;
    //     _.map(firstPlayerTiles, item => {
    //         const directional = _.filter(firstPlayerTiles, item2 => item.id !== item2.id && item.x === item2.x);
    //         if (directional.length === 2) {
    //             firstWin = true;
    //             return;
    //         }
    //     });
};

const couldWinNextStep = (items: GameItem[]) => {
    const freeTiles = _.reject(items, (item) => item.isOpened);
    
    return _.some(freeTiles, tile => {
        let nextItems =  _.cloneDeep(items);
        nextItems = _.map(nextItems, item => item.x === tile.x && item.y === tile.y ? _.merge(item, { isOpened: true }) : item);
        if (hasWinner(nextItems)) {
            return true;
        }

        return false;
        // const indexToOpen = _.findIndex(nextItems, item => item.x == tile.x && item.y === tile.y);
        // if (indexToOpen > -1) {
        //     nextItems.splice(indexToOpen, 1, nextItems[indexToOpen])
        // }
    });
};

export {
    getWinner,
    hasWinner,
    getWinnerName,
    getLoserName,
    getGameResult,
    filterOpenedTiles,
    isFirstPlayerMove,
    couldWinNextStep,
    getChunkedMovements,
    GameResult,
    includesStep,
};
