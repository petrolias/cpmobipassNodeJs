/*!
 * Requester, Responser methods
 * git
 *
 * Copyright (c) 2018 Petrolias Christopher
 * Licensed under the XXX license.
 */
(function () {
    "use strict";
    /**
     * Module dependencies.
     */
    var moment = require('moment');

    var f = function () { };
    /**
     * Requester, Repsponser methods using socket.io
     */
    module.exports = new f();

    let m_data = [];

    /**
     * Simple logger
     */
    f.prototype.log = () => {
        console.log(m_data);
    };

    /**
    * Extention Requester method, registers to m_data / generate requests.
    *
    * @param  {string} key
    * @param  {domain:'www.test.com'} data
    * @param  {} socket
    */
    f.prototype.request = (key, data, socket) => {
        const EXPIRATION_MINUTES = 1;
        try {
            //check if data exists
            m_data[key] = m_data[key] || {};
            //update data
            var d = m_data[key];
            d.expire = moment.utc().add(EXPIRATION_MINUTES, 'minutes');
            d.requester = {
                id: socket.client.id
            };

            //If client is connected then proceed to request
            if (!d.responser || !d.responser.id) { return; }
            //Open a pending request
            d.pendingRequest = true;
            //generate request
            //TODO : add encryption logic
            var req = {
                domain: data.domain || '',
            }
            socket.to(d.responser.id).emit(key, req);
        } catch (er) {
            console.error(er);
            throw er;
        }
    };

    /**
    * Responser join method, registers a responser to a valid requester key.
    *
    * @param  {string} key
    * @param  {} socket
    */
    f.prototype.responserJoin = (key, socket) => {
        try {
            //validations
            var d = m_data[key];
            if (!d) { throw new Error("Invalid key"); }
            //update client data
            d.responser = {
                insert: moment.utc(),
                id: socket.client.id
            }
        } catch (er) {
            console.error(er);
            throw er;
        }
    };

    //client response
    /**
    * Responser response method, send the response back to a requester.
    *
    * @param  {string} key
    * @param  {domain:'www.test.com', username : 'usr', password : 'psw'} data
    * @param  {} socket
    */
    const RESPONSE = 'response';
    f.prototype.response = (key, data, socket) => {
        try {
            //validations
            var d = m_data[key];
            if (!d) { throw new Error("Invalid key"); }
            if (d.expire.utc() < moment.utc()) { throw new Error("Expired request"); }
            if (d.pendingRequest == false) { throw new Error("No Pending Request"); }
            //generate resp
            //TODO : add encryption logic
            var resp = {
                domain: data.domain || '',
                username: data.username || '',
                password: data.password || ''
            }
            //close pending request
            d.pendingRequest = false;
            socket.broadcast.to(d.requester.id).emit(RESPONSE, resp);
        } catch (er) {
            console.error(er);
            throw er;
        }
    };

})();
