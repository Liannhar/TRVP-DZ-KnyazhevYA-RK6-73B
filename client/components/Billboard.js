import AppModel from "../model/AppModel.js";
import Application from "./Application.js";

export default class Billboard {
    #billboardDestination = '';
    #applications = [];
    #billboardId = '';
    #liElement = '';

    constructor({
                    billboardId = null,
                    destination,
                    onDropTaskInTasklist,
                    onEditTask,
                    onDeleteTask,
                    onDeleteBillboard,
                    onBillboardEditSubmit = {}, onEditBillboard = {},
                }) {
        this.#billboardDestination = destination;
        this.#billboardId = billboardId || crypto.randomUUID();
        this.onDropTaskInTasklist = onDropTaskInTasklist;
        this.onEditTask = onEditTask;
        this.onDeleteTask = onDeleteTask;
        this.onDeleteBillboard = onDeleteBillboard;
        this.onEditBillboard = onEditBillboard;
        this.onBillboardEditSubmit = onBillboardEditSubmit

    }


    stringify() {
        return {
            billboardId: this.#billboardId,
            address: this.#billboardDestination,
        }
    }

    addApplication(apps) {
        let i = 0;
        apps.forEach(application => {
            i++;
            let a = new Application({
                id: application.id,
                start_dt: application.start_dt,
                end_dt: application.end_dt,
                company: application.company,
                order: i,
                onEditTask: this.onEditTask,
                onDeleteTask: this.onDeleteTask
            });
            this.#applications.push(a)
        })
        this.updateApps();
    }

    get billboardId() {
        return this.#billboardId;
    }

    get Destination() {
        return this.#billboardDestination;
    }

    addTask = ({task}) => this.#applications.push(task);

    getTaskById = ({taskID}) => this.#applications.find(task => task.taskID === taskID);

    deleteTask = ({taskID}) => {

        const deleteTaskIndex = this.#applications.findIndex(task => task.taskID === taskID);

        if (deleteTaskIndex === -1) return;

        const [deletedTask] = this.#applications.splice(deleteTaskIndex, 1);

        return deletedTask;
    };

    reorderTasks = () => {
        console.log(document.querySelector(`[id="${this.#billboardId}"] .applist__item`));
        const orderedTasksIDs = Array.from(
            document.querySelector(`[id="${this.#billboardId}"] .applist__item`).children,
            elem => elem.getAttribute('id')
        );

        orderedTasksIDs.forEach((taskID, order) => {
            this.#applications.find(task => task.taskID === taskID).taskOrder = order;
        });

        console.log(this.#applications);
    };

    onAddNewApplication = (event) => {
        event.preventDefault(); // Предотвращаем стандартное поведение формы
        const form = event.target.closest('.additional-form');
        let dateStart = form.querySelector('input[name="startDate"]').value,
            dateEnd = form.querySelector('input[name="endDate"]').value,
            destination = form.querySelector('input[name="additionalText"]').value;
        const newTask = new Application({
            start_dt: dateStart,
            end_dt: dateEnd,
            company: destination,
            order: this.#applications.length,
            onEditTask: this.onEditTask,
            onDeleteTask: this.onDeleteTask,
        });

        let success = AppModel.addApplication({
            applicationId: newTask.taskID,
            start_dt: dateStart,
            end_dt: dateEnd,
            company: destination,
            billboardId: this.#billboardId
        })
        success.then(result => {
            if (result.statusCode) {
                console.log(result)
            } else {
                this.#applications.push(newTask);
                this.updateApps();

                const additionalContainer = this.#liElement.querySelector(".additional-container");
                additionalContainer.style.display = "none";
                const li = this.#liElement.querySelector(".app_list_inside");
                li.style.display = 'block';
            }
        }).catch(error => {
            alert('Неподходящяя заявка')
        })
    };

    updateApps() {
        console.log(this.#applications)
        this.#applications.sort((a, b) => {
            const dateA = new Date(a.taskTextStart);
            const dateB = new Date(b.taskTextStart);
            if (dateA < dateB) return 1;
            if (dateA > dateB) return -1;
            return 0;
        });
        const appListContainer = document.querySelector(`[id="${this.#billboardId}"] .app_list_inside`);
        appListContainer.innerHTML = '';

        this.#applications.forEach(task => {
            const taskElement = task.render();
            appListContainer.appendChild(taskElement);
        });

        const plusDiv = document.createElement('li');
        plusDiv.className = 'applist__item-app app-adder app-adder__btn';
        plusDiv.innerHTML = '<div class="plus-div">✚</div>';
        appListContainer.appendChild(plusDiv);
        plusDiv.addEventListener('click', (event) => {
            this.onAddNewApplicationSubmit(event);
        });
    }

    changeApp(taskId,dateStart,dateEnd,destination) {
        const taskIndex =  this.#applications.findIndex(task => task.taskID === taskId);
        if(taskIndex != -1)
        {
            this.#applications[taskIndex].taskTextStart=dateStart;
            this.#applications[taskIndex].taskTextEnd=dateEnd;
            this.#applications[taskIndex].taskTextCompany=destination;
        }
    }

    onAddNewApplicationSubmit = (event) => {
        const additionalContainer = this.#liElement.querySelector(".additional-container");
        additionalContainer.style.display = "block";
        const li = this.#liElement.querySelector(".app_list_inside");
        li.style.display = 'none';
    };

    onCancelNewApplication = (event) => {
        const li = this.#liElement.querySelector(".app_list_inside");
        li.style.display = 'block';
        const additionalContainer = this.#liElement.querySelector(".additional-container");
        additionalContainer.style.display = "none";
        const changeButton = additionalContainer.querySelector(".additional-btn-change");
        changeButton.style.display = 'none';
        const addButton = additionalContainer.querySelector(".additional-btn");
        addButton.style.display = 'block';
    };

    render() {
        const liElement = document.createElement('li');
        this.#liElement = liElement;
        liElement.classList.add(
            'tasklists-list__item',
            'tasklist'
        );
        liElement.setAttribute('id', this.#billboardId);
        liElement.addEventListener(
            'dragstart',
            () => localStorage.setItem('srcTasklistID', this.#billboardId)
        );

        liElement.addEventListener('drop', this.onDropTaskInTasklist);
        liElement.innerHTML = '<div class="bill-info__wrapper">\n' +
            '<div class="left-wrapper">' +
            '              <div class="bill-info__info-data d-main">\n' +
            '                <h2 class="bill-info__info-data name-ticket white-text" style="font-size: clamp(1.2rem, 2.0vw, 2.0rem)">Адресс</h2>\n' +
            '                <span class="list-data__item value dest-val white-text">\n' +
            this.#billboardDestination +
            '                    </span>\n' +
            '              </div>\n' +
            '              <div class="bill-info__info-data d-form">\n' +
            '<form action="" class="bill_edit_form">\n' +
            '          <div class="info-adder__wrapper">\n' +
            '            <div class="info-adder__input city">\n' +
            '              <span class="name-item white-text">\n' +
            '                Новый адресс\n' +
            '              </span>\n' +
            '              <input\n' +
            '                      type="text" name="Dest" value="' + this.#billboardDestination + '"\n' +
            '              >\n' +
            '            </div>\n' +
            '          </div>\n' +
            '          <button type="submit" class="edit-btn ">Подтвердить</button>\n' +
            '        </form>' +
            '              </div>\n' +
            '</div>' +
            '              <div class="right-wrapper">\n' +
            '              <div class="applist">\n' +
            '                <ul class="app_list_inside applist__item tasklist__tasks-list" style="display: block">\n' +
            '                  <li class="applist__item-app app-adder app-adder__btn">\n' +
            '                      <div class="plus-div">✚</div>\n' +
            '                  </li>\n' +
            '                </ul>\n' +
            '<div class="additional-container" style="display: none;margin: 10px;">\n' +
            '  <form action="" class="additional-form">\n' +
            '    <div class="additional-inputs">\n' +
            '      <input type="date" name="startDate" placeholder="Дата начала" style="margin: 10px">\n' +
            '      <input type="date" name="endDate" placeholder="Дата окончания" style="margin: 10px">\n' +
            '      <input type="text" name="additionalText" placeholder="Введите текст" style="margin: 10px">\n' +
            '      <div class="button-container" style="display: flex; margin: 10px;">\n' +
            '            <button type="submit" class="additional-btn confirm-btn" style="margin-right: 10px;">Подтвердить</button>\n' +
            '            <button type="submit" class="additional-btn-change confirm-btn" style="display: none; margin-right: 10px;">Изменить</button>\n' +
            '            <button type="button" class="additional-cancel-btn cancel-btn">Отменить</button>\n' +
            '        </div>' +
            '    </div>\n' +
            '  </form>\n' +
            '</div>' +
            '              </div>\n' +
            '            <div class="billboard-info__btn">\n' +
            '              <div class="billboard-info__btn red-icon">\n' +
            '              <span class="name-item">\n' +
            '                Изменить \n' +
            '              </span>\n' +
            '              </div>\n' +
            '              <div class="billboard-info__btn del-icon">\n' +
            '              <span class="name-item">\n' +
            '                Удалить \n' +
            '              </span>\n' +
            '              </div>\n' +
            '            </div>\n' +
            '            </div>\n' +
            '</div>\n';


        const adderElement = document.querySelector('.tasklist-adder');
        adderElement.parentElement.insertBefore(liElement, adderElement);

        liElement.querySelector(".del-icon").addEventListener('click', this.onDeleteBillboard);
        liElement.querySelector(".red-icon").addEventListener('click', this.onEditBillboard)
        liElement.querySelector('.bill_edit_form').addEventListener('submit', this.onBillboardEditSubmit);
        const additionalContainer = liElement.querySelector(".additional-container");
        additionalContainer.querySelector(".additional-btn").addEventListener('click', (nevEvent) => {
            this.onAddNewApplication(nevEvent);
        });
        additionalContainer.querySelector(".additional-cancel-btn").addEventListener('click', (nevEvent) => {
            this.onCancelNewApplication(nevEvent);
        });
    }
};
