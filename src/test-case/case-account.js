import UAccountDAO from "../models/dao/UAccountDAO.js";

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

(async times => {

    // USE DB_SUPER
    // GO
    // SELECT uid, username, fullname FROM UACCOUNT ORDER BY uid DESC
    // DELETE UACCOUNT WHERE uid > 1005
    // DBCC CHECKIDENT ('[UACCOUNT]', RESEED, 1005);
    let array = new Array(times);
    let dao = new UAccountDAO();

    console.log('Random data ... '); // prepare
    for (let i = 0; i < array.length; i++) {
        array[i] = {
            username: random.execute(10, random.low),
            email: `${random.execute(15, random.low)}@gmail.com`,
            password: 'Ab123',
            fullname: random.execute(20),
            regTime: new Date(),
            ua_id: 0
        };
    }

    await performance(async function () {

        console.log('SQL select'); // read data
        await performance(async () => {
            let res = [];

            res = await dao.select(undefined, ['uid', 'username'])
            console.log('-- Select all: ', res.length, res);

            res = await dao.select(2, 'uid');
            console.log('-- Select top 2: ', res.length, res);
            
            res = await dao.select(1, 'uid');
            console.log('-- Select top 1: ', res.length, res);
        }, -1, 'SQL select')

        console.log('SQL insert'); // insert data
        await performance(async () => {
            let res = await dao.insert(array);
            console.log(res?.length > 1 ? res.length : res[0]);
        }, array.length, 'SQL insert');

        await performance(async () => { // update data
            let res = await dao.update(array);
            console.log(res?.length > 1 ? res.length : res[0]);
        }, array.length, 'SQL update');

        await performance(async () => { // delete data
            let res = await dao.delete(array);
            console.log(res?.length > 1 ? res.length : res[0]);
        }, array.length, 'SQL delete');
    }, array.length, 'EXECUTE CRUD');
})(1.25e3) // 1 250 rows data