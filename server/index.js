import express  from "express";
import dotenv from 'dotenv';
import DB from './db/client.js';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: './server/.env'
});

const appHost = process.env.APP_HOST;
const appPort = process.env.APP_PORT;

const app = express();
const db = new DB();

//logging middleware
app.use('*', (req, res, next) => {
    console.log(
        req.method,
        req.baseUrl || req.url,
        new Date().toISOString()
    );

    next();
});

//middleware for static app filese
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH");
    next();
});
app.use('/', express.static(path.resolve(__dirname, '../dev')));

//Получение изначальной информации
app.get('/billboards', async (req, res) => {
    try {
        const [dbApplications, dbBillboards] = await Promise.all([
            db.getApplications(),
            db.getBillboards(),
        ]);

        const billboardsList = dbBillboards.map((billboard) => {
            const applications = dbApplications.filter(app => app.billboard_id === billboard.id);

            return {
                billboardID: billboard.id,
                address: billboard.address,
                applications: applications
            };
        });
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ billboards: billboardsList });
    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting billboards error: ${err.error.message || err.error}`
        });
    }

});

// Body parsing middleware
app.use('/billboards', express.json());
// Добавление биллборда
app.post('/billboards', async (req, res) => {
    try {
        const { billboardId, address } = req.body;
        await db.addBillboard({ billboardId: billboardId,address });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add billboard error: ${err.error.message || err.error}`
        });
    }
});


// Body parsing middleware
app.use('/billboards/:billboardId', express.json());
// Изменение об информации биллборда
app.patch('/billboards/:billboardId', async (req, res) => {
    try {
        const { billboardId }= req.params; // Получение значения из URL
        const { address} = req.body; // Получение данных из тела запроса
        console.log(address)
        await db.updateBillboard({ billboardId: billboardId,address });
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        // Обработка ошибок
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update billboard error: ${err.error.message || err.error}`
        });
    }
});


// Удаление билборда
app.delete('/billboards/:billboardId', async (req, res) => {
    try {
        const { billboardId }= req.params;
        await db.deleteBillboard({ billboardId });


        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        // Обработка ошибок
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Delete billboard error: ${err.error.message || err.error}`
        });
    }
});


// Body parsing middleware
app.use('/applications', express.json());
// Добавление брони
app.post('/applications', async (req, res) => {
    try {
        const { applicationId,start_dt,end_dt, company, billboardId } = req.body;
        await db.addApplication({ applicationId,start_dt,end_dt, company, billboardId });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add application error: ${err.message}`
        });
    }
});

// Body parsing middleware
app.use('/applications/:applicationId', express.json());
// Изменение информации брони
app.patch('/applications/:applicationId', async (req, res) => {
    try {
        const { applicationId } = req.params; // Получение значения из URL
        const { start_dt,end_dt, company, billboardId } = req.body; // Получение данных из тела запроса
        await db.updateApplication({ applicationId,start_dt,end_dt, company, billboardId });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        // Обработка ошибок
        switch (err.type) {
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update application error: ${err.error.message || err.error}`
        });
    }
});

//Удаление брони
app.delete('/applications/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params; // Получение значения из URL
        console.log(taskId);
        await db.deleteApplication({ taskId });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        // Обработка ошибок
        switch (err.type) {
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Delete application error: ${err.error.message || err.error}`
        });
    }
});


// Body parsing middleware
app.use('/applications', express.json());
// Перетаскивание брони на другой рейс
app.patch('/applications', async (req, res) => {
    try {
        const { applicationId ,billboardId, newBillboardId, start_dt,end_dt } = req.body; // Получение данных из тела запроса
        await db.moveApplication({ applicationId ,billboardId, newBillboardId, start_dt,end_dt });
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        // Обработка ошибок
        switch (err.type) {
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Move application error: ${err.error.message || err.error}`
        });
    }
});



const server = app.listen(Number(appPort), appHost, async () => {
    try {
        await db.connect();
    } catch(error) {
        console.log('App shut down');
        process.exit(100);
    }

    console.log(`App started at host http://${appHost}:${appPort}`);

});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
        await db.disconnect();
        console.log('HTTP server closed');
    });
});