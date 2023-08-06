import queries from './services/queries.js';
import sql, { modify } from './services/queries.js';

const table = "UAccount"
const arr = [
    { uid: 1, fullname: 'abc' },
    { uid: 2, fullname: 'def' },
    { uid: 3, fullname: 'ghi' },
];
const data = {
    price: 123.283,
    qty: 4958,
    password: '123',
    uid: { type: "?", value: '123' },
    name: { type: "'?'", value: 'abc' },
    time: new Date(),
}

let st = Date.now();
console.log('push...');
for (let i = 0; i < 1e5; i++) arr.push(data);
console.log('modify...');

let query ='';
console.log('running...');
for(let i = 0; i < arr.length; i++) {
     query+=`\n ${queries.insert(table, modify(arr[i]))}`
}
let en = Date.now();
console.log(query);
console.log('-------------------------- finished.');

console.log(`${(en-st)/1e3} s.`);