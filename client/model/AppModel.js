export default class AppModel {
    static async getBillboards() {
        try {
            const getbillboardsResponse = await fetch('http://localhost:4321/billboards');
            const getbillboardsBody = await getbillboardsResponse.json();

            if (getbillboardsResponse.status !== 200) {
                return Promise.reject(getbillboardsBody)
            }
            return getbillboardsBody.billboards;
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async addBillboards({
        billboardId,
        address,
    } = {
        billboardId: null,
        address: '',
    }) {
        try {
            const addbillboardsResponse = await fetch(
                'http://localhost:4321/billboards',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        billboardId,
                        address,
                    }),
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            );


            if (addbillboardsResponse.status !== 200) {
                const addbillboardsBody = await addbillboardsResponse.json();
                return Promise.reject(addbillboardsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Биллборд '${billboardId}' добавлен`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateBillboards({
        billboardId,
        address,
      } = {
        billboardId: null,
        address: ''
      }) {
        try {
            console.log(billboardId)
            const updateBillboardsResponse = await fetch(
                `http://localhost:4321/billboards/${billboardId}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        address: address
                    }),
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            );


            if (updateBillboardsResponse.status !== 200) {
                const updateBillboardsBody = await updateBillboardsResponse.json();
                return Promise.reject(updateBillboardsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Параметры биллборда '${billboardId}' обнавлены`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async deleteBillboards({
        billboardId,

    } = {
        billboardId: null
    }) {
        try {
            const deleteBillboardsResponse = await fetch(
                `http://localhost:4321/billboards/${billboardId}`,
                {
                    method: 'DELETE',
                }
            );


            if (deleteBillboardsResponse.status !== 200) {
                const updateBillboardsBody = await deleteBillboardsResponse.json();
                return Promise.reject(updateBillboardsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Биллборд '${billboardId}' удален`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async addApplication({
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
        try {
            const addApplicationsResponse = await fetch(
                'http://localhost:4321/applications',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        applicationId ,
                        start_dt ,
                        end_dt ,
                        company ,
                        billboardId
                    }),
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            );


            if (addApplicationsResponse.status !== 200) {
                const addApplicationsBody = await addApplicationsResponse.json();
                return Promise.reject(addApplicationsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Заявка '${name}' добавлена`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateApplications({
                                        applicationID,
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
        try {
            const updateApplicationsResponse = await fetch(
                `http://localhost:4321/Applications/${applicationID}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        start_dt,
                        end_dt,
                        company,
                        billboardId,
                    }),
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            );


            if (updateApplicationsResponse.status !== 200) {
                const updateApplicationsBody = await updateApplicationsResponse.json();
                return Promise.reject(updateApplicationsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Параметр заявки '${name}' обнавлен`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async deleteApplications({
        taskID
    } = {
        taskID: null
    }) {
        try {
            console.log(taskID)
            const deleteApplicationsResponse = await fetch(
                `http://localhost:4321/applications/${taskID}`,
                {
                    method: 'DELETE',
                }
            );


            if (deleteApplicationsResponse.status !== 200) {
                const deleteApplicationsBody = await deleteApplicationsResponse.json();
                return Promise.reject(deleteApplicationsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Заявка '${taskID}' удалена`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async moveApplications({
                                      applicationId,
                                      billboardId,
                                      newBillboardId,
                                      start_dt,
                                      end_dt,

      } = {
        applicationId: null,
        billboardId: null,
        newBillboardId: null,
        start_dt: '',
        end_dt: ''
      }) {
        try {
            const moveApplicationsResponse = await fetch(
                `http://localhost:4321/applications`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        applicationId,
                        billboardId,
                        newBillboardId,
                        start_dt,
                        end_dt
                      }),
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            );

            console.log(moveApplicationsResponse)
            if (moveApplicationsResponse.status !== 200) {
                const moveApplicationsBody = await moveApplicationsResponse.json();
                return Promise.reject(moveApplicationsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Заявка '${applicationId}' перенесена`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }
};