import sql from '../services/sqlService.js';
import queries from '../services/queries.js';

const random = {
    num: '0123456789',
    upp: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    low: 'abcdefghijklmnopqrstuvwxyz',
    all: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    execute: function (size = 5, charset = this.all) {
        let result = new String();
        for (let i = 0; i < size; i++)
            result += charset[
                Math.floor(Math.random() * charset.length)
            ];
        return result;
    },
}

async function performance(call, times, name = 'execute') {
    let thousands = times.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    console.log(`EXECUTE ${thousands} times... -------------------------- ${name} start.`);
    let st = Date.now();
    await call(); // execute function.
    let en = Date.now();
    console.log(`TIME IN ${(en - st) / 1e3}s. -------------------------- ${name} finished.\n\n`);
}

const TABLE = 'UAccount';
(async times => {

    // USE DB_SUPER
    // GO
    // SELECT uid, username, fullname FROM UACCOUNT ORDER BY uid DESC
    // DELETE UACCOUNT WHERE uid > 1005
    // DBCC CHECKIDENT ('[UACCOUNT]', RESEED, 1005);
    let conn = sql.connect;
    let array = new Array(times);
    console.log('SQL connected: ', conn.connected);

    await performance(async function () {
        let getRecord = false; // get OUTPUT INSERTED.* || OUTPUT DELETED.*
        await exinsert(array, getRecord); // multiple insert
        await exupdate(array, getRecord); // multiple update
        await exdelete(array, getRecord); // multiple delete
    }, array.length, 'EXECUTE CRUD');

    conn.close();
    console.log('SQL Closed.');
})(1.25e3)

// -------------------------------------------------------------------- INSERT DATA
async function exinsert(array = [], getRecord = false) {
    console.log('Random data ... '); // prepare
    for (let i = 0; i < array.length; i++) {
        array[i] = {
            username: { type: "'?'", value: random.execute(10, random.low) },
            email: { type: "'?'", value: `${random.execute(10, random.low)}@gmail.com` },
            password: { type: "PWDENCRYPT('?')", value: 'abc' },
            fullname: random.execute(20),
            regTime: new Date(),
            ua_id: 0
        };
    }

    console.log('SQL insert'); // insert data
    await performance(async () => {
        async function execute(array2) {
            console.log(`-- insert ${array2.length} rows.`);
            let query = queries.insert(TABLE, array2, getRecord);
            await sql.execute(query).catch(console.error)
                .then(res => console.log('inserted: ', getRecord ? res.recordset?.map(e => e.uid) : res.rowsAffected));
        }

        // execute the fisrt 1000 rows when size of array lager than 1 thousand
        for (let i = 0; i < array.length;) await execute(array.slice(i, i += 1e3));

    }, array.length, 'SQL insert');

}

// -------------------------------------------------------------------- UPDATE DATA
async function exupdate(array = [], getRecord = false) {
    console.log("Random update ... ");
    for (const data of array) { // random update data
        Object.assign(data, {
            fullname: random.execute(20),
            password: { type: "PWDENCRYPT('?')", value: '123' },
        })
    }

    console.log('SQL update'); // update data by username
    await performance(async () => {
        async function execute(data) {
            console.log(`-- update ${data.length} rows`);
            let query = queries.update(TABLE, data, getRecord, 'username');
            await sql.execute(query).catch(console.error)
                .then(res => console.log('updated: ', getRecord ? res.recordset?.map(e => e.uid) : res.rowsAffected));
        }

        for (let i = 0; i < array.length;) await execute(array.slice(i, i += 1e3));
    }, array.length, 'SQL update');
}

// -------------------------------------------------------------------- DELETE DATA
async function exdelete(array = [], getRecord = false) {
    console.log('SQL delete'); // update data by username

    await performance(async () => {
        let us = array.map(e => e.username);
        async function execute(data) {
            console.log(`-- delete ${data.length} rows`);
            let query = queries.delete(TABLE, { username: data }, getRecord);
            await sql.execute(query).catch(console.error)
                .then(res => console.log('deleted: ', getRecord ? res.recordset?.map(e => e.uid) : res.rowsAffected));
        }

        for (let i = 0; i < array.length;) await execute(us.slice(i, i += 1e3));
    }, array.length, 'SQL delete');
}
