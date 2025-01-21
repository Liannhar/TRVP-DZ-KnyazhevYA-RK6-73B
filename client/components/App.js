import Billboard from './Billboard.js';
import AppModel from "../model/AppModel.js";
import Application from "./Application.js";

export default class App {
    #billboardlist = [];
    onEscapeKeydown = (event) => {
        if (event.key === 'Escape') {
            const input = document.querySelector('.tasklist-adder__input');
            input.style.display = 'none';
            input.value = '';

            document.querySelector('.tasklist-adder__btn')
                .style.display = 'inherit';
        }
    };


    onDeleteBillboard = (event) => {
        if (event.target) {
            let billboardId = event.target.closest('li').id
            let billboard = this.#billboardlist.find(billboard => billboard.billboardId === billboardId)
            let data = AppModel.deleteBillboards({billboardId})
            data.then(result => {
                console.log(result.message)
                if (result.message.length > 0) {
                    let index = this.#billboardlist.indexOf(billboard)
                    if (index > -1) {
                        this.#billboardlist.slice(index, 1);
                        document.getElementById(billboardId).remove()
                    }
                }
            })

        }
    }

    onEditBillboard(event) {
        let li = event.target.closest('.tasklist')
        li.querySelector('.d-main').style.display = 'none'
        li.querySelector('.d-form').style.display = 'block'
    }

    onBillboardEditSubmit = (event) => {
        event.preventDefault()
        let billboardLi = event.target.closest('.tasklist')
        let billboard = this.#billboardlist.find(billboard => billboard.billboardId === billboardLi.id)
        let destination = event.target.querySelector('input[name="Dest"]').value;
        if (destination !== '') {

            if (destination !== billboard.destination ) {
                let result = AppModel.updateBillboards({
                    billboardId: billboardLi.id,
                    address: destination,
                })

                result.then(result => {
                    billboardLi.querySelector(".dest-val").textContent = destination
                })
            }
        } else {
            alert("Заполните все поля")
        }
        event.target.closest('.d-form').style.display = 'none';
        billboardLi.querySelector('.d-main').style.display = 'block';
    };

    onBillboardAddSubmit = (event) => {
        event.preventDefault();
        let destination = event.target.querySelector('input[name="Dest"]').value;
        if (destination) {
            const newBillboard = new Billboard({
                destination: destination,
                onDropTaskInTasklist: this.onDropTaskInTasklist,
                onEditTask: this.onEditTask,
                onDeleteTask: this.onDeleteTask,
                onDeleteBillboard: this.onDeleteBillboard,
                onEditBillboard: this.onEditBillboard,
                onBillboardEditSubmit: this.onBillboardEditSubmit
            });
            let data = AppModel.addBillboards({
                billboardId: newBillboard.billboardId,
                address: newBillboard.Destination
            })

            data.then(result => {
                console.log(result)
                if (result.statusCode) {
                    if (result.statusCode !== 200) {
                        console.log(result)
                    }

                } else {
                    this.#billboardlist.push(newBillboard);
                    newBillboard.render();
                    newBillboard.updateApps();
                }
            }).catch(result => {
                alert("Попытка создать дубль биллборда!")
            })

        } else {
            alert("Заполните все поля")
        }

        event.target.style.display = 'none';
        event.target.value = '';

        document.querySelector('.tasklist-adder__btn')
            .style.display = 'inherit';
    };

    onDropTaskInTasklist = (evt) => {
        evt.stopPropagation();
        const destTasklistElement = evt.currentTarget;
        destTasklistElement.classList.remove('tasklist_droppable');

        const movedTaskID = localStorage.getItem('movedTaskID');
        const srcTasklistID = localStorage.getItem('srcTasklistID');
        const destTasklistID = destTasklistElement.getAttribute('id');
        localStorage.setItem('movedTaskID', '');
        localStorage.setItem('srcTasklistID', '');

        const srcTasklist = this.#billboardlist.find(tasklist => tasklist.billboardId === srcTasklistID);
        const destTasklist = this.#billboardlist.find(tasklist => tasklist.billboardId === destTasklistID);
        if (srcTasklistID !== destTasklistID) {
            const srcTask=srcTasklist.getTaskById({taskID:movedTaskID})
            let data = AppModel.moveApplications({
                applicationId: movedTaskID,
                billboardId: srcTasklistID,
                newBillboardId: destTasklistID,
                start_dt:srcTask.taskTextStart,
                end_dt: srcTask.taskTextEnd,
            })
            data.then(result => {
                console.log(result)
                const destTasksIDs = Array.from(
                    destTasklistElement.querySelector('.applist__item').children,
                    elem => elem.getAttribute('id')
                );

                const movedTask = srcTasklist.deleteTask({taskID: movedTaskID});
                destTasklist.addTask({task: movedTask});
                new Application({
                    start_dt: movedTask.taskTextStart,
                    end_dt: movedTask.taskTextEnd,
                    company: movedTask.taskTextCompany,
                    order: destTasksIDs.length + 1,
                    onEditTask: this.onEditTask,
                    onDeleteTask: this.onDeleteTask,
                });
                srcTasklist.updateApps();
                destTasklist.updateApps();
            }).catch(error => {
                console.log(error)
                alert("Пересечение дат!")
            })
        }
    };

    onEditTask = ({taskID},event) => {
        const appList=event.target.closest(".applist");
        const additionalContainer =appList.querySelector(".additional-container");
        additionalContainer.style.display = "block";
        const li = event.target.closest(".app_list_inside");
        li.style.display = 'none';
        const changeButton=additionalContainer.querySelector(".additional-btn-change");
        changeButton.style.display='block';
        const addButton=additionalContainer.querySelector(".additional-btn");
        addButton.style.display='none';

        additionalContainer.querySelector(".additional-btn-change").addEventListener('click', (newEvent) => {
            this.onEditTaskSubmit({taskID},newEvent);
        });
    };

    onEditTaskSubmit = ({taskID},event) => {
        event.preventDefault();
        let fTask = null;
        let foundBillboard = null;
        for (let billboardList of this.#billboardlist) {
            fTask = billboardList.getTaskById({taskID});
            if (fTask) {
                foundBillboard = billboardList;
                break
            }
        }
        const appList=event.target.closest(".applist");
        const form =appList.querySelector(".additional-container");
        let dateStart = form.querySelector('input[name="startDate"]').value,
            dateEnd = form.querySelector('input[name="endDate"]').value,
            destination = form.querySelector('input[name="additionalText"]').value;

        if(!dateStart || !dateEnd || !destination) return;

        let success = AppModel.updateApplications({
            applicationID: taskID,
            start_dt:dateStart,
            end_dt:dateEnd,
            company:destination,
            billboardId: document.querySelector(`[id="${taskID}"]`).closest('.tasklist').id
        })
        success.then(result => {
            if (result.statusCode) {
                console.log(result)
            } else {
                foundBillboard.changeApp(taskID,dateStart,dateEnd,destination);
                foundBillboard.updateApps();

                form.style.display = "none";
                const li =appList.querySelector(".app_list_inside");
                li.style.display = 'block';
                const changeButton=form.querySelector(".additional-btn-change");
                changeButton.style.display='none';
                const addButton=form.querySelector(".additional-btn");
                addButton.style.display='block';
                const button = form.querySelector(".additional-btn-change");
                const clonedButton = button.cloneNode(true);
                button.replaceWith(clonedButton);
            }
        }).catch(error => {
            alert("Неверная заявка")
        })

    };

    onDeleteTask = ({taskID}) => {
        let fTask = null;
        let fTasklist = null;
        for (let tasklist of this.#billboardlist) {
            fTasklist = tasklist;
            fTask = tasklist.getTaskById({taskID});
            if (fTask) break;
        }
        if (!fTask) {
            console.error("Не найдена заявка")
            return;
        }

        const taskShouldBeDeleted = confirm(`Заяка будет удалена. Продолжить?`);

        if (!taskShouldBeDeleted) return;

        let data = AppModel.deleteApplications({taskID})
        data.then(result => {
            if (result.statusCode) {
                console.error(result)
            } else {
                fTasklist.deleteTask({taskID});
                document.getElementById(taskID).remove();
            }
        })

    };


    init() {
        document.querySelector('.tasklist-adder__btn')
            .addEventListener(
                'click',
                (event) => {
                    event.target.style.display = 'none';

                    const form = document.querySelector('.billboard_adder_form');
                    form.style.display = 'flex';
                }
            );

        document.addEventListener('keydown', this.onEscapeKeydown);
        document.querySelector('.billboard_adder_form')
            .addEventListener('submit', this.onBillboardAddSubmit);


        document.addEventListener('dragover', (evt) => {
            evt.preventDefault();
            const draggedElement = document.querySelector('.app.task_selected');
            const draggedElementPrevList = draggedElement.closest('.tasklist');

            const currentElement = evt.target;
            const prevDroppable = document.querySelector('.tasklist_droppable');
            let curDroppable = evt.target;
            while (!curDroppable.matches('.tasklist') && curDroppable !== document.body) {
                curDroppable = curDroppable.parentElement;
            }


            if (curDroppable !== prevDroppable) {
                if (prevDroppable) prevDroppable.classList.remove('tasklist_droppable');

                if (curDroppable.matches('.tasklist')) {
                    curDroppable.classList.add('tasklist_droppable');
                }


            }

            if (!curDroppable.matches('.tasklist') || draggedElement === currentElement) return;

            if (curDroppable === draggedElementPrevList) {
                if (!currentElement.matches('.book')) return;

                const nextElement = (currentElement === draggedElement.nextElementSibling)
                    ? currentElement.nextElementSibling
                    : currentElement;

                curDroppable.querySelector('.applist__item')
                    .insertBefore(draggedElement, nextElement);

                return;
            }

            if (currentElement.matches('.book')) {
                curDroppable.querySelector('.applist__item')
                    .insertBefore(draggedElement, currentElement);

                return;
            }

            if (!curDroppable.querySelector('.applist__item').children.length) {
                curDroppable.querySelector('.applist__item')
                    .appendChild(draggedElement);
            }
        });

        try {
            let billboards = AppModel.getBillboards()
            billboards.then(data => {
                data.forEach(billboardRaw => {
                    let billboard = new Billboard(
                        {
                            billboardId: billboardRaw.billboardID,
                            destination: billboardRaw.address,
                            onDropTaskInTasklist: this.onDropTaskInTasklist,
                            onEditTask: this.onEditTask,
                            onDeleteTask: this.onDeleteTask,
                            onDeleteBillboard: this.onDeleteBillboard,
                            onEditBillboard: this.onEditBillboard,
                            onBillboardEditSubmit: this.onBillboardEditSubmit
                        }
                    )
                    this.#billboardlist.push(billboard)
                    billboard.render()
                    billboard.addApplication(billboardRaw.applications)
                })

            })
        } catch (e) {
            console.log(e)
        }
    }
};
