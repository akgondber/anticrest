import _ from 'lodash';

const la = [{
    x: 0,
    y: 0,
    c: 'a',
}, {
    x: 1,
    y: 0,
    c: 'b',
}, {
    x: 2,
    y: 0,
    c: 'b',
}, {
    x: 0,
    y: 1,
    c: 'a',
}, {
    x: 1,
    y: 1,
    c: 'a',
}, {
    x: 2,
    y: 1,
    c: 'a',
}];

const p1 = _.filter(la, item => item.c === 'b');
const res =  _.groupBy(p1, _.property('y'));
const hs = _.some(_.values(res), item => item.length === 2);
if (hs) {
    console.log(_.head(_.head(_.values(res))));
    console.log('_____________');
    console.log(_.get(_.values(res), '0.0.c'));
    console.log('_____________');
}
console.log(hs);
console.log(_.values(res));
console.log('bad');
console.log(res);
