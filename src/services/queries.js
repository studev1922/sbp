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
                return `'${data.substring(0, data.length-1)}'`;
            }
            data = Object.assign({}, data); // to avoid overwriting
            if (data.type) return data.type.replace('?', data.value);
            else for (const i of Object.keys(data)) data[i] = modify(data[i]) // set for object
            return data;
        default: return data;
    }
}

const single = {
    /**
     * 
     * @param {String} table 
     * @param {Number} top integer
     * @param {String || Array} fields 
     * @returns 
     */
    select: (table, top, fields) => `SELECT${top ? ` TOP ${top} ` : ' '}${fields || '*'} FROM ${table}`,
}

const queries = {

    select: function (table, top, fields, ...serials) {
        let query = single.select(table, top, fields);
        return serials?.length ? `${query} ${serials.join('\xa0')}` : query
    },
    insert: function (table, data) {
        let keys = Object.keys(data);
        let values = Object.values(data);
        return `INSERT INTO ${table} (${keys}) values(${values});`;
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
    insert: queries.insert
};