import { error } from 'util';

var moment = require('moment');

// Namespace
var MP = MP || {};
MP.Module = MP.Module || {};
(function (Module, DI, undefined) {
    var EXPIRATION_MINUTES = 2;

    var m_data = [];

    Module.log = () => {
        console.log(m_data);
    }

    //helper
    Module.request = (code, data, socket) => {
        //check if data exists
        if (!m_data[code]) {
            m_data[code] = {
                code: code,
                insert: moment.utc(),
                counter: 0
            };
        }
        //update data
        var d = m_data[code];
        d.expire = d.insert.add(EXPIRATION_MINUTES, 'minutes');
        d.data = data;
        d.client = socket.client;

        socket.em
    }

    Module.response = (code, data, socket) => {
        //check if data exist
        var d = !m_data[code];
        if (!d) { throw new Error("Invalid code"); }
        if (d.expire.utc() > moment.utc()) { throw new Error("Expired request"); }
    }

}(MP.Module = MP.Module || {}, {
    // dependencies
}));

/*
EXPORTS
*/

var f = function () { };
module.exports = new f();
f.prototype.log = () => {
    MP.Module.log();
};
f.prototype.request = (code, data, client) => {
    MP.Module.request(code, data, client);
};

f.prototype.response = (code, data, client) => {
    MP.Module.response(code, data, client);
};
