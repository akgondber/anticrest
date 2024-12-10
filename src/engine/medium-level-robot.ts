import _ from "lodash";
import { GameItem } from "../components/GameTile";
import { opponentColors } from "../constants";

const canWinHorizontal = (items: GameItem[], playerColor = 'red') => {
    const gameSize = _.get(_.last(_.sortBy(items, _.property('x'))), 'x');
    const groupedHorizontally = _.chain(items).filter((el) => el.color === playerColor).groupBy((el) => `${el.x}xy`).value();
    let result = _.some(_.values(groupedHorizontally), (tiles) => tiles.length === gameSize);
    return result;
};

const canWinVertical = (items: GameItem[], playerColor = 'red') => {
    const gameSize = _.get(_.last(_.sortBy(items, _.property('y'))), 'y');
    const groupedHorizontally = _.chain(items).filter((el) => el.color === playerColor).groupBy((el) => `xx${el.y}`).value();
    let result = _.some(_.values(groupedHorizontally), (tiles) => tiles.length === gameSize);
    return result;
};

const canWinDiagonal = (items: GameItem[], playerColor = 'red') => {
    return true;
}

const getFirstHorizontalTileGivingWin = (items: GameItem[], playerColor = 'red') => {
    const groupedHorizontally = _.chain(items).filter((el) => el.color === playerColor).groupBy((el) => `${el.x}xy`).value();
    const groupValues = _.values(groupedHorizontally);
    let result: GameItem | undefined;

    if (_.some(groupValues, (tiles) => tiles.length === 4)) {
        const xCoords = [0, 1, 2, 3, 4];
        const potentialWinningLines = _.filter(groupValues, (tiles) => tiles.length === 4);

        for (let i = 0; i < potentialWinningLines.length; i++) {
            const tiles = potentialWinningLines[i];
            const targetLineTiles = _.filter(items, (element) => element.x === tiles[0].x);
            console.log(tiles[0].y);
            console.log(tiles[1].y);
            const remained = _.difference(xCoords, _.map(tiles, _.property('y')));
            console.log(remained);
            console.log('remae --_____________________');
             
            if (remained.length > 0) {
                
                _.map(remained, (xCoord) => {
                    console.log('POTENTIAL _______________________', tiles);
                    const potentialTile = _.find(targetLineTiles, (item: GameItem) => item.y === xCoord && !item.isOpened);
                    if (potentialTile) {
                        result = potentialTile;
                        return;
                    }
                });

                if (result) {
                    break;
                }
            }
        }

        console.log('________________GONNNNNNNA ', result ? result.toString() : 'undefined');
        return result;
    }
}

const getFirstVerticalTileGivingWin = (items: GameItem[], playerColor = 'red') => {
    const groupedHorizontally = _.chain(items).filter((el) => el.color === playerColor).groupBy((el) => `xx${el.y}`).value();
    const groupValues = _.values(groupedHorizontally);
    let result: GameItem | undefined;

    if (_.some(groupValues, (tiles) => tiles.length === 4)) {
        const xCoords = [0, 1, 2, 3, 4];
        const potentialWinningLines = _.filter(groupValues, (tiles) => tiles.length === 4);

        for (let i = 0; i < potentialWinningLines.length; i++) {
            const tiles = potentialWinningLines[i];
            const targetLineTiles = _.filter(items, (element) => element.y === tiles[0].y);
            const remained = _.difference(xCoords, _.map(tiles, _.property('x')));
             
            if (remained.length > 0) {
                
                _.map(remained, (xCoord) => {
                    const potentialTile = _.find(targetLineTiles, (item: GameItem) => item.x === xCoord && !item.isOpened);
                    if (potentialTile) {
                        result = potentialTile;
                        return;
                    }
                });

                if (result) {
                    break;
                }
            }
        }

        return result;
    }
}

const makeStep = (items: GameItem[], robotColor = 'cyan') => {
    // const closedTiles = _.reject(items, _.property('isOpened'));
    // const opponentOpenedColors = _.filter(items, _.property('isOpened'));
    const opponentColor = opponentColors[robotColor];
    let result;

    if (canWinHorizontal(items, opponentColor)) {
        return getFirstHorizontalTileGivingWin(items, opponentColor);
        // if (result) {
        //     return result;
        // }
    } else if (canWinVertical(items, opponentColor)) {
        return getFirstVerticalTileGivingWin(items, opponentColor);
    }
}

export {
    makeStep,
};
