import { Database } from 'better-sqlite3';
import { Router } from 'express';
import { noCacheMiddleware } from './noCacheMiddleware.js';
import { env } from '../env/env.js';

export function createRouter(db: Database, domainName: string) {

    const router = Router();

    router.use(noCacheMiddleware);

    const refreshInterval = env.MAIL_REFRESH_INTERVAL;
    router.get('/addresses', (req, res) => {
        try {
            const rows = db.prepare("SELECT addr, owner FROM address WHERE owner is NULL or owner = ?").all(req.user?.sub);
            res.json({ addresses: rows, refreshInterval: refreshInterval });
        } catch (err) {
            console.error("DB get addresses fail", err);
            res.status(500).send('Failed to get addresses');
        }
    });

    router.get('/domain', (req, res) => {
        if (domainName) {
            res.status(200).send(domainName);
        } else {
            res.status(200).send(req.headers.host?.split(':')[0] || 'unknown');
        }
    });

    router.get('/address/:addr', (req, res) => {
        const address = req.params.addr.toLowerCase();
        try {
            const rows = db.prepare("SELECT addr FROM address WHERE addr = ?").all(address);
            if (rows.length > 0) {
                res.status(200).send((rows[0] as { addr: string }).addr);
            } else {
                res.status(404).send('Address not found');
            }
        } catch (err) {
            console.error("DB get addresses fail", err);
            res.status(500).send('Failed to retrieve address');
        }
    });

    router.put('/address/:addr', (req, res) => {
        const address = req.params.addr.toLowerCase();
        try {
            const rows = db.prepare("SELECT addr FROM address WHERE addr = ?").all(address);
            if (rows.length > 0) {
                res.status(200).send();
            } else {
                db.prepare("INSERT INTO address (addr) VALUES (?)").run(address);
                res.status(200).send();
            }
        } catch (err) {
            console.error("DB add addresses fail", err)
            res.status(500).json({ error: "Failed to add address" });
        }
    })

    router.post('/address/:addr', (req, res) => {
        const address = req.params.addr.toLowerCase();

        const json = req.body as {
            private: boolean,
        };

        const owner = json.private ? req.user?.sub : null;
        console.log("Assigning " + address + " to " + owner)
        try {
            // check that addr is public or owned by sub first
            db.prepare("UPDATE address SET owner = ? WHERE addr = ?").run(owner, address);
            res.status(200).send();
        } catch (err) {
            console.error("DB add addresses fail", err)
            res.status(500).json({ error: "Failed to add address" });
        }
    })

    router.delete('/address/:addr', (req, res) => {
        const address = req.params.addr.toLowerCase();
        try {
            db.prepare("DELETE FROM address WHERE addr = ?").run(address);
            db.prepare("DELETE FROM mail WHERE recipient = ?").run(address);
            res.status(200).send();
        } catch (err) {
            console.error("DB delete address fail");
            console.error(err)
            res.status(500).send('Failed to delete address');
        }
    })

    return router;
}

export default createRouter;