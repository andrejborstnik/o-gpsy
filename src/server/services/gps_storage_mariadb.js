let mariadb = require('mariadb');

class MariaDBGPSStorageService {

    constructor() {
        this.config = require('../../common/config.json').storage.ogpsy;
        // connecting to DB
        this.pool = mariadb.createPool({
            host: this.config.host,
            user: this.config.user,
            password: this.config.password,
            multipleStatements: true
        });
    }

    async addGPS(u, p, x, y, t) {
        let conn;
        let pool;

        try {
            // connecting to DB
            pool = mariadb.createPool({
                host: this.config.host,
                user: this.config.user,
                password: this.config.password,
                multipleStatements: true
            });
            conn = await pool.getConnection();
            await conn.query('use ' + this.config.db);

            // create record
            let px = parseFloat(x);
            let py = parseFloat(y);
            let pt = parseInt(t);

            let query = `
                insert into points
                (runner_id, ts, lat, lon)
                values (
                    (select runners.id from trackers, runners
                        where trackers.id = runners.tracker_id and
                        trackers.uuid = ?),
                    from_unixtime(?), ?, ?
                )
            `;

            await conn.query(query, [u, pt, px, py]);

        } catch(err) {
            console.log(err);
            throw(err);
        } finally {
            if (conn) conn.end();
            if (pool) pool.end();
        }
    };

    async getPoint(u) {
        let conn;
        let pool;

        try {
            // connecting to DB
            pool = mariadb.createPool({
                host: this.config.host,
                user: this.config.user,
                password: this.config.password,
                multipleStatements: true
            });
            conn = await pool.getConnection();
            await conn.query('use ' + this.config.db);

            let query = `
                select UNIX_TIMESTAMP(ts) as ts, lat, lon from points order by ts desc limit 1
            `;

            let record = await conn.query(query);
            return(record[0]);

        } catch(err) {
            console.log(err);
            throw(err);
        } finally {
            if (conn) conn.end();
            if (pool) pool.end();
        }
    }

    async getCompetitors(event_id) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            await conn.query('use ' + this.config.db);
            let query = `
                select * from runners where event_id = ?
            `;

            let records = await conn.query(query, event_id);
            let track;

            await Promise.all(records.map(async (rec, i) => {
                let query = `
                    select
                        UNIX_TIMESTAMP(ts) as ts,
                        lon,
                        lat
                    from points
                    where runner_id = ?
                `;
                track = await conn.query(query, rec.id);
                records[i].track = track;
            }));
            return(records);
        } catch(err) {
            console.log(err);
            throw(err);
        } finally {
            if (conn) conn.end();
        }
    }

};

module.exports = MariaDBGPSStorageService;