import _ from 'lodash';

const colors = {
    first: 'red',
    second: 'cyan'
};

const colorItems = _.values(colors);
const opponentColors = _.spread(_.merge)(_.map(colorItems, (item, i) => ( { [item]: colorItems[(i+1)%2] })));

const mapping = _.zipObject(_.values(colors), ['Player 1', 'Player 2']);

export {
    colors,
    opponentColors,
    colorItems,
    mapping,
};
