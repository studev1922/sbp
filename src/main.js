import queries from './services/queries.js';
import sql, { modify } from './services/queries.js';

const table = "UAccount"
const arr = [
    { uid: 1, fullname: 'abc' },
    { uid: 2, fullname: 'def' },
    { uid: 3, fullname: 'ghi' },
];
const data = {
    image: null,
    price: 123.283,
    qty: 4958,
    fullname: 'abcdefg123',
    password: { type: "PWDENCRYPT('?')", value: '123' },
    uid: { type: "?", value: '123' },
    time: new Date(),
}


function performance(call, times) {
    console.log(`EXECUTE ${times} times... -------------------------- start.`);
    let st = Date.now();
    call(); // execute function.
    let en = Date.now();
    console.log(`TIME IN ${(en - st) / 1e3}s. -------------------------- finished.`);
}

console.log('\n\n\n');
// INSERT QUERIES
performance(() => {
    let values = modify(data);
    console.log(sql.insert(table, values));

    for (let i = 0; i < 5e5; i++) {
        values = modify(data);
        sql.insert(table, values);
    }
}, 5e5);

console.log('\n\n\n');
// UPDATE QUERIES
performance(() => {
    let key = 'uid', values = modify(data);
    console.log(sql.update(table, values, `WHERE ${key}=${values[key]}`));

    for (let i = 0; i < 5e5; i++) {
        values = modify(data);
        sql.update(table, values, `WHERE ${key}=${values[key]}`);
    }
}, 5e5);

console.log('\n\n\n');
// DELETE QUERIES
performance(() => {
    let values = modify({uid: [1,2,3], username: 'abc', name: {type: "'?'", value: 'xin chao'}});
    console.log(sql.delete(table, {uid: 1}));
    console.log(sql.delete(table, {uid: [1,2,3]}));
    console.log(sql.delete(table, values));
    console.log(sql.delete(table, values, true));

    for (let i = 0; i < 5e5; i++) {
        values = modify(values);
        sql.delete(table, values, true);
    }
}, 5e5)
