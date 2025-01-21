
export default class Application {
    #taskID = '';
    #taskTextStart = '';
    #taskTextEnd = '';
    #taskTextCompany = '';
    #taskOrder = -1;

    constructor({
                    id = null,
                    start_dt,
                    end_dt,
                    company,
                    order,
                    // onMoveTask,
                    onEditTask,
                    onDeleteTask
                }) {
        this.#taskID = id || crypto.randomUUID();
        this.#taskTextStart = start_dt;
        this.#taskTextEnd = end_dt;
        this.#taskTextCompany = company;
        this.#taskOrder = order;
        // this.onMoveTask = onMoveTask;
        this.onEditTask = onEditTask;
        this.onDeleteTask = onDeleteTask;
    }

    get taskID() {
        return this.#taskID;
    }

    changeFlight(old_id, new_id) {
        return axios.post('/changeBillboard/' + this.taskID, {
            old: old_id,
            new: new_id
        })
    }

    get taskTextStart() {
        return this.#taskTextStart;
    }

    set taskTextStart(value) {
        if (typeof value === 'string') {
            this.#taskTextStart = value;
        }
    }
    get taskTextEnd() {
        return this.#taskTextEnd;
    }

    set taskTextEnd(value) {
        if (typeof value === 'string') {
            this.#taskTextEnd = value;
        }
    }

    get taskTextCompany() {
        return this.#taskTextCompany;
    }

    set taskTextCompany(value) {
        if (typeof value === 'string') {
            this.#taskTextCompany = value;
        }
    }

    get taskOrder() {
        return this.#taskOrder;
    }

    set taskOrder(value) {
        if (typeof value === 'number' && value >= 0) {
            this.#taskOrder = value;
        }
    }

    stringify() {
        return {
            ID: this.#taskID,
            start_dt: this.#taskTextStart,
            end_dt: this.#taskTextEnd,
            company: this.#taskTextCompany,
            order: this.#taskOrder
        }
    }

    render() {
        const liElement = document.createElement('li');
        liElement.classList.add('applist__item-booking', 'app', 'task');
        liElement.setAttribute('id', this.#taskID);
        liElement.setAttribute('draggable', true);
        liElement.addEventListener('dragstart', (evt) => {
            evt.target.classList.add('task_selected');
            localStorage.setItem('movedTaskID', this.#taskID);
        });
        liElement.addEventListener('dragend', (evt) => {
            evt.target.classList.remove('task_selected')
        });

        const span = document.createElement('span');
        span.classList.add('task__text');
        span.innerHTML = this.#taskTextCompany;
        liElement.appendChild(span);

        const dateStart = this.#taskTextStart.split('T')[0];
        const spanDateStart = document.createElement('span');
        spanDateStart.classList.add('task__text');
        spanDateStart.innerHTML = dateStart;
        liElement.appendChild(spanDateStart);

        const dateEnd = this.#taskTextEnd.split('T')[0];
        const spanDateEnd = document.createElement('span');
        spanDateEnd.classList.add('task__text');
        spanDateEnd.innerHTML = dateEnd;
        liElement.appendChild(spanDateEnd);

        const controlsDiv = document.createElement('div');
        controlsDiv.classList.add('task__controls');

        const upperRowDiv = document.createElement('div');
        upperRowDiv.classList.add('task__controls-row');
        controlsDiv.appendChild(upperRowDiv);

        const lowerRowDiv = document.createElement('div');
        lowerRowDiv.classList.add('task__controls-row');

        const editBtn = document.createElement('button');
        editBtn.setAttribute('type', 'button');
        editBtn.classList.add('task__contol-btn', 'edit-icon');
        editBtn.addEventListener('click', (event) => this.onEditTask({taskID: this.#taskID},event));
        lowerRowDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.setAttribute('type', 'button');
        deleteBtn.classList.add('task__contol-btn', 'delete-icon');
        deleteBtn.addEventListener('click', () => this.onDeleteTask({taskID: this.#taskID}));
        lowerRowDiv.appendChild(deleteBtn);

        controlsDiv.appendChild(lowerRowDiv);

        liElement.appendChild(controlsDiv);

        return liElement;
    }
};
