// modify data to mssql data
const modify = (data) => {
    if (data === null) return 'NULL';
    else if (Array.isArray(data)) {
        data = Object.assign([], data);// to avoid overwriting
        for (const i in data) data[i] = modify(data[i]); // set for array
        return data;
    } else switch (typeof data) { // type check to return corresponding data
        case 'string': return `N'${data}'`;
        case 'boolean': case 'undefined': return data ? 1 : 0;
        case 'object':
            if (data instanceof Date) {
                data = data.toISOString().replace('T', ' ');
                return `'${data.substring(0, data.length - 1)}'`;
            }
            data = Object.assign({}, data); // to avoid overwriting
            if (data.type) return data.type.replace('?', data.value);
            else for (const i of Object.keys(data)) data[i] = modify(data[i]) // set for object
            return data;
        default: return data;
    }
} // Array > Object > data

const queries = {
    select: (table, top, fields, ...serials) => {
        let query = `SELECT${top ? ` TOP ${top} ` : ' '}${fields || '*'} FROM ${table}`;
        return serials?.length ? `${query} ${serials.join('\xa0')}` : query
    },
    insert: (table, data) => {
        if (Array.isArray(data)) {
            let keys = Object.keys(data[0]);
            let query = `INSERT INTO ${table} (${keys}) VALUES\n`;

            for (let obj of data) query += ` (${Object.values(modify(obj))}),\n`
            return query.substring(0, query.length - 2);
        } else {
            data = modify(data);
            return `INSERT INTO ${table} (${Object.keys(data)}) values(${Object.values(data)});`
        }
    },
    update: (table, data, ...by) => {
        let keys, query;

        if (Array.isArray(data)) {
            keys = Object.keys(data[0]);

            // set keys inner join t1 = t2
            query = `UPDATE t1 SET `
            for (let k of keys) query += `t1.${k}=t2.${k},\n`;
            query = query.substring(0, query.length - 2) // sub ',\n'
            
            // set join data values (...)
            query += `\nFROM ${table} t1 INNER JOIN (\nVALUES\n`
            for (let obj of data) query += `(${Object.values(modify(obj))}),\n`;
            query = query.substring(0, query.length - 2) // sub ,\n
            
            // set key for t2 as columns EX: (id,name,note...)
            query += `\n) t2 (${keys})\n ON `;
            for (let k of by) query += `t1.${k}=t2.${k} OR `;
            return query.substring(0, query.length-4); // sub ' OR '
        } else {
            data = modify(data);
            keys = Object.keys(data);
            query = `UPDATE ${table} SET `

            // set key as value
            for (let k of keys) query += `${k}=${data[k]},`;
            query = query.substring(0, query.length - 1);

            let values = {};
            for (let k of by) values[k] = data[k];
            return `${query} WHERE ${queries.conditions(values, true)}`;
        }
    },
    delete: (table, data, isAbsolute) => {
        return `DELETE FROM ${table} WHERE ${queries.conditions(modify(data), isAbsolute)}`;
    },
    conditions: (data, isAbsolute) => {
        let conditions = new String();
        let serials = isAbsolute ? ' AND ' : ' OR ';
        let value, keys = Object.keys(data);

        // serials conditional
        for (let k of keys) {
            value = data[k]; // is array "key" in (value) || key euqual value
            conditions += Array.isArray(value)
                ? `${k} IN (${value})${serials}`
                : `${k}=${value}${serials}`;
        }

        return conditions.substring(0, conditions.length - serials.length);
    }
};

export default {

    /**
     * 
     * @param {String} table 
     * @param {Number} top integer
     * @param {String || Array} fields select fields
     * @param {...String} serials 
     * @returns query selector
     */
    select: queries.select,

    /**
     * @param {String} table to insert data
     * @param {Object || Array<Object>} data object model to insert
     * @returns query insert data
     */
    insert: queries.insert,

    /**
     * @param {String} table to update data
     * @param {Object || Array<Object>} data to update
     * @param {...String} by fields to update
     * @returns 
     */
    update: queries.update,

    /**
     * @param {String} table to delete data
     * @param {Object} data for delete
     * @param {Boolean} isAbsolute ? AND : OR
     */
    delete: queries.delete,

    /**
     * @param {Object} data for delete
     * @param {Boolean} isAbsolute ? AND : OR
     */
    conditions: queries.conditions,
};