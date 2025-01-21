import pg from 'pg';

const Min=3;
const Max=100;

export default class DB {
    #dbClient = null;
    #dbHost = '';
    #dbPort = '';
    #dbName = '';
    #dbLogin = '';
    #dbPassword = '';

    constructor(){
        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName = process.env.DB_NAME;
        this.#dbLogin = process.env.DB_LOGIN;
        this.#dbPassword = process.env.DB_PASSWORD;

        this.#dbClient = new pg.Client({
            user: this.#dbLogin,
            password: this.#dbPassword,
            host: this.#dbHost,
            port: this.#dbPort,
            database: this.#dbName
        });
    }

    async connect(){
        try {
            await this.#dbClient.connect();
            console.log('DB connection established');
        } catch(error) {
            console.error('Unable to connect to DB: ', error);
            return Promise.reject(error);
        }
    }

    async disconnect(){
        await this.#dbClient.end();
        console.log('DB connection was closed');
    }

    //Получения биллбордов
    async getBillboards() {
        try {

            const billboards = await this.#dbClient.query(
                'SELECT * FROM billboard;'
            );

            return billboards.rows;
        } catch(error) {
            console.error('Unable get billboards, error:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    //Получение заявок
    async getApplications() {
        try {

            const applications = await this.#dbClient.query(
                'SELECT * FROM application;'
            );

            return applications.rows;
        } catch(error) {
            console.error('Unable get applications, error:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    //Добавление билборда
    async addBillboard({
        billboardId,
        address,
    } = {
        billboardId: null,
        address: ''
    }) {
        if (!billboardId || !address ) {
            const errMsg = `Add billboard error: {id: ${billboardId}, address: ${address}}`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            const count_billboards = await this.#dbClient.query(
                'SELECT COUNT(*) FROM billboard WHERE address=$1;',
                [address]
            );

            const count_records = count_billboards.rows[0].count;
            console.log(count_records)

            if (count_records == 0) {
                try {
                  await this.#dbClient.query(
                    'INSERT INTO billboard (id, address) VALUES ($1, $2);',
                    [billboardId, address]
                  );
                } catch (err) {
                  console.log('Unable to add billboard. Error during insertion:', err);
                  return Promise.reject({
                    type: 'internal',
                    error: err
                  });
                }
              } else {
                const errMsg = `Billboard with address=${address} already exists.`;
                console.log(errMsg);
                return Promise.reject({
                  type: 'client',
                  error: new Error(errMsg)
                });
              }
        } catch (err) {
            console.log('Error while checking existing billboard:', err);
            return Promise.reject({
              type: 'internal',
              error: err
            });
        }
    }

    async updateBillboard({
        billboardId,
        address,
      } = {
        billboardId: null,
        address: '',
      }) {
        if (!billboardId || !address) {
          const errMsg = `Update billboard error: {id: ${billboardId}, address: ${address}}`;
          console.error(errMsg);
          return Promise.reject({
            type: 'client',
            error: new Error(errMsg)
          });
        }

        try {
          // Проверяем количество биллбордов
          const count_billboard = await this.#dbClient.query(
            'SELECT COUNT(*) FROM billboard WHERE address = $1',
            [address]
          );

          const count_records = count_billboard.rows[0].count;

          if (count_records == 0) {
            // Если количество billboard равно 0, выполняем обновление
            let query = null;
            const queryParams = [];

            if (address !== '') {
              query = 'UPDATE billboard SET address = $1 WHERE id = $2;';
              queryParams.push(address,billboardId);
            }
            else {
              // Если не указаны поля для обновления
              const errMsg = `No fields specified for update: {id: ${billboardId}, address ${address}}`;
              console.error(errMsg);
              return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
              });
            }

            // Выполняем обновление
            await this.#dbClient.query(query, queryParams);
          } else {
            // Если количество биллбордов больше 0, возвращаем ошибку
            const errMsg = `billboard with address=${address} already exists.`;
            console.error(errMsg);
            return Promise.reject({
              type: 'client',
              error: new Error(errMsg)
            });
          }
        } catch (err) {
          console.log('Unable to update billboards:', err);
          return Promise.reject({
            type: 'internal',
            error: err
          });
        }
      }


    //Удаление биллборда
    async deleteBillboard({
        billboardId,

    } = {
        billboardId: null
    }) {
        if (!billboardId) {
            const errMsg = `Delete billboard error: {id: ${billboardId}}`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {

            await this.#dbClient.query(
                'DELETE FROM application WHERE billboard_id = $1;',
                [billboardId]
            );

            await this.#dbClient.query(
                'DELETE FROM billboard WHERE id = $1;',
                [billboardId]
            );
        } catch (err) {
            console.log('Unable to delete billboard:', err);
            return Promise.reject({
                type: 'internal',
                error: err
            });
        }
    }

    //Добавление заявки
    async addApplication({
                             applicationId,
        start_dt,
        end_dt,
        company,
        billboardId
      } = {
        applicationID: null,
        start_dt: '',
        end_dt: '',
        company: '',
        billboardId: null
      }) {
        if (!applicationId || !start_dt || !end_dt || !company || !billboardId ) {
            const errMsg = `Add tasklist error: {id: ${applicationId}, start_dt: ${start_dt}, end_dt: ${end_dt}, company: ${company}, billboard_id: ${billboardId}}`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        const startDate = new Date(start_dt);
        const endDate = new Date(end_dt);
        const differenceInMs = endDate - startDate;
        const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);
        if (differenceInDays < Min || differenceInDays > Max ) {
            const errMsg = `Неправильный промежуток даты`;
            console.error(differenceInDays);
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        try {
            const count_application = await this.#dbClient.query(
                'SELECT COUNT(*) FROM application WHERE billboard_id = $3 AND ( (start_dt <= $1 AND end_dt >= $1) OR(start_dt <= $2 AND end_dt >= $2) OR (start_dt >= $1 AND end_dt <= $2));',
                [start_dt,end_dt, billboardId]
            );

            const count_records = count_application.rows[0].count;

            if (count_records == 0) {
                try {
                    await this.#dbClient.query(
                        'INSERT INTO application (id, start_dt,end_dt, company, billboard_id) VALUES ($1, $2, $3, $4,$5);',
                        [applicationId, start_dt,end_dt, company, billboardId]
                    );
                } catch (err) {
                    console.log('Unable to add application. Error during insertion:', err);
                    return Promise.reject({
                        type: 'internal',
                        error: err
                    });
                }
            } else {
                const errMsg = `Application with start_dt=${start_dt}, end_dt=${end_dt}  and company=${company} already exists.`;
                console.log(errMsg);
                return Promise.reject({
                    type: 'client',
                    error: new Error(errMsg)
                });
            }
        } catch (err) {
            console.log('Error while checking existing application:', err);
            return Promise.reject({
                type: 'internal',
                error: err
            });
        }

    }

    //Изменение информации брони
    async updateApplication({
                                applicationId,
                                start_dt,
                                end_dt,
                                company,
                                billboardId
      } = {
        applicationId: null,
        start_dt: '',
        end_dt: '',
        company: '',
        billboardId: null
      }) {
        if (!applicationId || !start_dt || !end_dt || !company || !billboardId  ) {
            const errMsg = `Update tasklist error: {id: ${applicationId}, application_start_dt: ${start_dt}, application_end_dt: ${end_dt}, company: ${company}, billboard_id: ${billboardId}}`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        const startDate = new Date(start_dt);
        const endDate = new Date(end_dt);

        const differenceInMs = endDate - startDate;

        const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

        if(differenceInDays < Min || differenceInDays > Max)
        {
            const errMsg = `Update tasklist error in days: {id: ${applicationId}, application_start_dt: ${start_dt}, application_end_dt: ${end_dt}, company: ${company}, billboard_id: ${billboardId}}`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            const count_application = await this.#dbClient.query(
                'SELECT COUNT(*) FROM application WHERE id != $4 AND billboard_id = $3 AND ( (start_dt <= $1 AND end_dt >= $1) OR(start_dt <= $2 AND end_dt >= $2) OR (start_dt >= $1 AND end_dt <= $2));',
                [start_dt,end_dt, billboardId,applicationId]
            );
            const count_records = count_application.rows[0].count;

            if (count_records == 0) {
                try {
                    await this.#dbClient.query(
                        'UPDATE application SET start_dt = $1 , end_dt=$2,company=$3 WHERE id = $4;',
                        [start_dt,end_dt,company,applicationId]
                    );
                } catch (err) {
                    console.log('Unable to update application. Error during insertion:', err);
                    return Promise.reject({
                        type: 'internal',
                        error: err
                    });
                }
            } else {
                const errMsg = `Application with start_dt=${start_dt}, end_dt=${end_dt}  and company=${company} already exists.`;
                console.log(errMsg);
                return Promise.reject({
                    type: 'client',
                    error: new Error(errMsg)
                });
            }
        } catch (err) {
            console.log('Error while checking existing application:', err);
            return Promise.reject({
                type: 'internal',
                error: err
            });
        }
    }

    //Удаление заявки
    async deleteApplication({
        taskId
    } = {
        taskId: null
    }) {
        if (!taskId) {
            const errMsg = `Delete application error: {id: ${taskId}}`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'DELETE FROM application WHERE id = $1;',
                [taskId]
            );

        } catch (err) {
            console.log('Unable to delete application:', err);
            return Promise.reject({
                type: 'internal',
                error: err
            });
        }
    }


    //Перетаскивание заявки
    async moveApplication({
                              applicationId,
        billboardId,
        newBillboardId,
        start_dt,
        end_dt
      } = {
        applicationId: null,
        billboardId: null,
        newBillboardId: null,
        start_dt: '',
        end_dt: '',
      }) {
        if (!applicationId ||!billboardId ||!newBillboardId|| !start_dt || !end_dt  ) {
            const errMsg = `Move application error: {id: ${applicationId}, billboardID: ${billboardId}, newBillboardID: ${newBillboardId}, start_dt: ${start_dt}, end_dt: ${end_dt}}`;
          console.error(errMsg);
          return Promise.reject({
            type: 'client',
            error: new Error(errMsg)
          });
        }
        const startDate = new Date(start_dt);
        const endDate = new Date(end_dt);

        const differenceInMs = endDate - startDate;

        const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

        if(differenceInDays < Min || differenceInDays > Max)
        {
            const errMsg = `Move application error days: {id: ${applicationId}, billboardID: ${billboardId}, newBillboardID: ${newBillboardId}, start_dt: ${start_dt}, end_dt: ${end_dt}}`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            const count_application = await this.#dbClient.query(
                'SELECT COUNT(*) FROM application WHERE billboard_id = $3 AND ( (start_dt <= $1 AND end_dt >= $1) OR(start_dt <= $2 AND end_dt >= $2) OR (start_dt >= $1 AND end_dt <= $2));',
                [start_dt,end_dt, newBillboardId]
            );
            const count_records = count_application.rows[0].count;

            if (count_records == 0) {
                // Обновление места полета в брони
                await this.#dbClient.query(
                'UPDATE application SET billboard_id = $1 WHERE id = $2;',
                [newBillboardId, applicationId]
          );
          } else {
            const errMsg = `Application already exists on new billboard ${newBillboardId}`;
            console.error(errMsg);
            return Promise.reject({
              type: 'client',
              error: new Error(errMsg)
            });
          }

        } catch (err) {
          console.log('Unable to move application:', err);
          return Promise.reject({
            type: 'internal',
            error: err
          });
        }
      }
};