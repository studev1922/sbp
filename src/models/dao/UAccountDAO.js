import AbstractDAO from "./AbstractDAO.js";

export default class UAccountDAO extends AbstractDAO {
    constructor() {
        // uid || username || email
        let username = { type: "'?'", value: undefined };

        super('UACCOUNT', { username }, {
            username,
            email: { type: "'?'", value: undefined },
            password: { type: "PWDENCRYPT('?')", value: undefined },
            fullname: undefined,
            regTime: undefined,
            ua_id: undefined
        });
    }
}