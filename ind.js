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

const colors = {
    first: 'af',
    second: 'die',
};
const obj = {};
const coArr = _.values(colors);
console.log(coArr);
console.log(_.fromPairs(coArr));
const na = _.reduce(coArr, (acc, v, i, lst) => {
    acc[lst[i]] = coArr[(i + 1) % 2];
    return acc;
}, {});
console.log(na);
console.log('-------------');
const ta = { a: 'f' };
console.log((_.spread(_.merge)(_.map(coArr, (a, i) => ({ [a]: coArr[(i+1)%2] })))));
console.log(_.keyBy(ta, (a, obj, v) => ta[_.keys(ta)[0]]));
console.log(_.mapKeys(colors, (a, obj) => {
    console.log(`bbb - ${a} == ${obj}`);
    // if (obj)
    return obj[a];
}));
console.log(_.mapValues(colors, (a) => obj[a] = 'e'));
console.log(obj);
console.log(_.fromPairs([['a', 1], ['e', 3]]));
const tar = ['fr', 'dfvrt trgtr', 'rgrt hthty', 'jy'];
// const tir = _.reject(tar, el => el.length > 3);
const by = _.reject(tar, ba => ba === 'fr');
const nd = _.findIndex(tar, la => la === 'fr');
if (nd > -1) {
    let nel = _.clone(tar)
    nel.splice(nd, 1, 'tyh ');
    console.log(nd);
    console.log('--------');
    console.log(nel);
} else {
    console.log('not found');
}

console.log(by);
const ja = _.chain(tar).clone(tar).reject((el) => el === 'rgrt hthty').value();
// .remove(tar, el => el.length > 3);
console.log(tar);
console.log(ja);
console.log(_.merge({a: 1, b: 2}, {a: 3}));
// const p1 = _.filter(la, item => item.c === 'b');
// const res =  _.groupBy(p1, _.property('y'));
// const hs = _.some(_.values(res), item => item.length === 2);
// if (hs) {
//     console.log(_.head(_.head(_.values(res))));
//     console.log('_____________');
//     console.log(_.get(_.values(res), '0.0.c'));
//     console.log('_____________');
// }
// console.log(hs);
// console.log(_.values(res));
// console.log('bad');
// console.log(res);
const its = [{iso: true}, {iso: true}];
const rsl = _.every(its, _.property('iso'));
console.log(rsl);
console.log(_.merge({a: 3}, {a: 4}));
const tr = [{iO: true}];
const tr2 = [{iO: false}, {iO: true}, {iO: true}];
console.log(_.countBy(tr2, v => v.iO));
const nae = [
    {x: 0, y: 0, color: 'red'},
    {x: 1, y: 0, color: 'cyan'},
    {x: 2, y: 0, color: 'red'},
    {x: 1, y: 1, color: 'red'},
];
console.log(_.chain(nae).filter(el => el.color === 'red').groupBy((el) => `xx${el.y}`).value());
console.log(_.difference([1, 2, 3], [1]));

let colorItems = ['re', 'gt'];
console.log(_.spread(_.merge)(_.map(colorItems, (item, i) => ( { [item]: colorItems[(i+1)%2] })))['re']);
const itas = [{u: 4, r: 2, b: 23}, {u: 2, r: 5, b: 78}, {u: 24, r: 2, b: 23}];
const itas2 = [{u: 2, r: 2, b: 23}, {u: 2, r: 5, b: 78}, {u: 24, r: 2, b: 23}];
console.log(_.find(itas, {'u': 2, r: 3}));
console.log(_.chunk(itas, 2));
console.log(_.isEqual(itas, itas2));
console.log(_.get([{a: '3r'}], '0.a'));


