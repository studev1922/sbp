
import sql from "../../services/sqlService.js";
import queries from "../../services/queries.js";

export default class AbstractDAO {

    constructor(table, unique, fields) {
        this._table = table;
        this._unique = unique;
        this._fields = fields;
        Object.freeze(this); // final value
    };

    // Execute query
    async #execute(data, call = 'conditions') {
        let isArray = Array.isArray(data);
        let { _table, _unique } = this;
        let uniques = Object.keys(_unique);
        async function execute(array) {
            let query = queries[call](_table, array, true, ...uniques);
            return sql.execute(query).then(r => r.recordset)
                .catch(e => {
                    console.error(e);
                    throw new Error(e.message);
                });
        }

        if (isArray) { // execute the fisrt 1000 rows when size of array lager than 1 thousand
            var success = [], failue = [];

            for (let i = 0; i < data.length;) {
                await execute(data.slice(i, i += 1e3))
                    .then(record => success.push(...record))
                    .catch(failue.push);
            }
            
            return new Promise((resolve, reject) => {
                if (success.length) resolve(success);
                if (failue.length) reject(failue);
            });
        } else return execute(data); // single
    };

    // Map data to type
    #filterByUnique(data) {
        let { _unique } = this;
        let result = {}, keys = Object.keys(_unique);
        let set = (o, k) => ({ type: "'?'", value: o[k] });

        for (let k of keys) result[k] = Array.isArray(data)
            ? data.map(o => set(o, k))
            : set(data, k);
        return result;
    }

    #filterByFields(data, fields = this._fields) {
        let keys = Object.keys(fields);

        function filter(o1) {
            let includes = Object.keys(o1).filter(k => keys.includes(k));

            return includes.reduce((o2, k) => {
                if (typeof (o2[k]) === 'object')
                    o2[k] = { type: o2[k].type, value: o1[k] }
                else o2[k] = o1[k];
                return o2;
            }, { ...fields });
        }

        return Array.isArray(data) ? data.map(filter) : filter(data);
    };

    async select(top, fields) {
        let query = queries.select(this._table, top, fields);
        return sql.execute(query).then(res => res.recordset);
    }

    async insert(data) {
        data = this.#filterByFields(data);
        return this.#execute(data, 'insert');
    };
    async update(data) {
        data = this.#filterByFields(data);
        return this.#execute(data, 'update');
    };
    async delete(data) {
        data = this.#filterByUnique(data);
        return this.#execute(data, 'delete');
    };
}