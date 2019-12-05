const fs = require('fs');
const MAPS_DIR = require('../routes/static').MAPS_DIR;
const Storage = require('../services/admin_storage_mariadb');
const storage = new Storage();

const Utils = require('./req_utils');

exports.login = async (req, res) => {
    const username = req.params.u;
    const password = req.params.p;

    const r = await storage.getLogin(username, password);
    res.json(r);
};

exports.getEvents = async (req, res) => {
    let user_id = Utils.emptyIsNull(req.params.user_id);
    if (user_id != null) {
        user_id = parseInt(user_id);
    }

    const events = await storage.getEvents(user_id);
    res.json(events);
}

exports.getMaps = async (req, res) => {
    let user_id = Utils.emptyIsNull(req.params.user_id);
    if (user_id != null) {
        user_id = parseInt(user_id);
    }

    const events = await storage.getMaps(user_id);
    res.json(events);
}

exports.addMap = async (req, res) => {
    let map = req.body.map;
    if (!map) {
        throw 'Missing the map'
    }

    map = await storage.addMap(map);
    res.json(map);
}

exports.uploadMap = async (req, res) => {
    // todo restrict to images with limited size
    const fileName = decodeURIComponent(req.params.file_name);
    const filePath = `${__dirname}/../${MAPS_DIR}/${fileName}`

    req.on('data', (d) => {
        fs.appendFile(filePath, d, (e) => {
            if (e) throw e;
        });
    });
    req.on('error', (e) => res.sendStatus(500));
    req.on('end', () => {
        res.json(fileName);
    });
}

exports.editMap = async (req, res) => {
    let map = req.body.map;
    if (!map) {
        throw 'Missing the map'
    }

    map = await storage.editMap(map);
    res.json(map);
}

exports.deleteMap = async (req, res) => {
    let id = req.body.id;
    if (!id) {
        throw 'Missing the map'
    }
    id = parseInt(id)

    map = await storage.deleteMap(id);
    res.json(map);
}