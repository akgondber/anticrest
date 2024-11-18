import _ from 'lodash';

const colors = {
    first: 'red',
    second: 'cyan'
};

const mapping = _.zipObject(_.values(colors), ['Player 1', 'Player 2']);

export {
    colors,
    mapping,
};
