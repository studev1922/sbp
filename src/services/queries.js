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
}

const queries = {

    select: (table, top, fields, ...serials) => {
        let query = `SELECT${top ? ` TOP ${top} ` : ' '}${fields || '*'} FROM ${table}`;
        return serials?.length ? `${query} ${serials.join('\xa0')}` : query
    },
    insert: (table, data) => `INSERT INTO ${table} (${Object.keys(data)}) values(${Object.values(data)});`,
    update: (table, data, ...serials) => {
        let keys = Object.keys(data);
        let query = `UPDATE ${table} SET `;

        for (let k of keys) query += `${k}=${data[k]},`;
        return serials?.length
            ? `${query.substring(0, query.length - 1)} ${serials.join('\xa0')}`
            : query.substring(0, query.length - 1);
    },
    delete: (table, data, isAbsolute) => {

        let query = `DELETE FROM ${table} WHERE `;
        let serials = isAbsolute ? ' AND ' : ' OR ';
        let value, keys = Object.keys(data);

        // serials conditional
        for (let k of keys) {
            value = data[k]; // is array "key" in (value) || key euqual value
            query += Array.isArray(value) 
                ? `${k} IN (${value})${serials}` 
                : `${k}=${value}${serials}`;
        }

        return query.substring(0, query.length - serials.length);
    }

};


export {
    modify
}

export default {

    /**
     * 
     * @param {String} table 
     * @param {Number} top integer
     * @param {String || Array} fields select fields
     * @param {String || Array<String>} serials 
     * @returns query selector
     */
    select: queries.select,

    /**
     * @param {String} table to insert data
     * @param {Object} data object model to insert
     * @returns query insert data
     */
    insert: queries.insert,

    /**
     * @param {String} table to update data
     * @param {Object} data to update
     * @returns 
     */
    update: queries.update,

    /**
     * @param {String} table to delete data
     * @param {Object} data for delete
     * @param {Boolean} isAbsolute ? AND : OR
     */
    delete: queries.delete
};