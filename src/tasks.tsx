import { DateTime } from 'luxon';
import React from 'react';
import { Event, StateContext, TaskId } from './state';
import { assert, cs, onlyThisElementClick, workTimeFromStory } from './utils';
import './tasks.css';

const HOURS_IN_ONE_MAN_DAY = 7;

export function Tasks() {
    const { state, update } = React.useContext(StateContext);
    const [filter, setFilter] = React.useState('');

    const addNewTask = () => {
        update(state => {
            let id = Math.floor(Math.random() * 1_000_000_000);

            return {
                ...state,
                tasks: [{
                        id,
                        name: "",
                        estimation: null,
                    },
                    ...state.tasks,
                ],
                taskStory: {
                    ...state.taskStory,
                    [id]: [],
                },
            };
        });
        window.setTimeout(() => {
            // @ts-ignore
            document.querySelector(".task .name")?.focus();
        },1);
    };

    const updateFilter = (ev: any) => {
        setFilter(ev.target.value);
    };

    const updateTaskName = (id: TaskId) => (ev: any) => {
        update(state => ({
            ...state,
            tasks: state.tasks.map(task => task.id !== id
                ? task
                : {
                    ...task,
                    name: ev.target.value,
                }
            ),
        }));
    };

    const updateTaskEstimation = (id: TaskId) => (ev: any) => {
        update(state => ({
            ...state,
            tasks: state.tasks.map(task => task.id !== id
                ? task
                : {
                    ...task,
                    estimation: Number(ev.target.value) || null,
                }
            ),
        }));
    };

    const setActiveTask = (id: TaskId) => (ev: any) => {
        update(state => {
            // we should not activate already active tasks
            assert(state.activeTask !== id);
            assert(state.taskStory[id] !== undefined);

            let newEvents = [...state.events];
            let newStory = { ...state.taskStory };

            if (state.activeTask !== null) {
                let endEvent: Event = {
                    task_id: state.activeTask,
                    time: DateTime.local(),
                    action: 'end',
                };
                newEvents.push(endEvent);
                newStory[state.activeTask] = [...newStory[state.activeTask], endEvent];
            }
            let startEvent: Event = {
                task_id: id,
                time: DateTime.local(),
                action: 'start',
            };
            newEvents.push(startEvent);
            newStory[id] = [...newStory[id], startEvent];

            return {
                ...state,
                activeTask: id,
                events: newEvents,
                taskStory: newStory,
            };
        });
    };

    const setInactiveTask = (id: TaskId) => (ev: any) => {
        update(state => {
            // we should only deactivate active tasks
            // the task should exist and have story
            assert(state.activeTask === id);
            assert(state.taskStory[id] !== undefined);

            let newEvent: Event = {
                task_id: state.activeTask as TaskId,
                time: DateTime.local(),
                action: 'end',
            };

            return {
                ...state,
                activeTask: null,
                events: [...state.events, newEvent],
                taskStory: { ...state.taskStory, [id]: [...state.taskStory[id], newEvent] },
            };
        });
    };

    const incrementTaskEstimation = (id: TaskId) => (ev: any) => {
        update(state => ({
            ...state,
            tasks: state.tasks.map(task => task.id !== id
                ? task
                : {
                    ...task,
                    estimation: (task.estimation || 0) + 1,
                }
            ),
        }));
    };

    const decrementTaskEstimation = (id: TaskId) => (ev: any) => {
        update(state => ({
            ...state,
            tasks: state.tasks.map(task => task.id !== id
                ? task
                : {
                    ...task,
                    estimation: ((task.estimation || 1) - 1) || null,
                }
            ),
        }));
    };

    const tasks = state.tasks
        .filter(task => filter.trim() === "" || task.name.includes(filter.trim()))
        .map(task => {
            let active = task.id === state.activeTask;
            let timeProgressElement = null;

            if (task.estimation !== null) {
                let timeUsed = workTimeFromStory(state.taskStory[task.id]).as('hours') / HOURS_IN_ONE_MAN_DAY;
                let timeUsedNormalized = timeUsed / task.estimation;
                let progressClassName;

                    if (timeUsedNormalized < 0.5) progressClassName = 'ok';
                else if (timeUsedNormalized < 0.7) progressClassName = 'worse';
                else if (timeUsedNormalized < 0.9) progressClassName = 'bad';
                else                               progressClassName = 'critical';

                timeProgressElement = (
                    <span>Time: <progress
                        className={cs(progressClassName)}
                        value={Math.min(timeUsedNormalized, 1.0)}
                        title={`${timeUsed.toFixed(1)} of ${task.estimation} man days`}
                        max="1"
                        />
                    </span>
                );
            }

            return (
                <div
                    className={cs("task", active && "active")}
                    key={task.id}
                    onClick={onlyThisElementClick(active ? setInactiveTask(task.id) : setActiveTask(task.id))
                }>
                    <div><textarea className="name" value={task.name} onChange={updateTaskName(task.id)}/></div>
                    <div>{"Estimation: "}
                        <button type="button" className="button minus" onClick={decrementTaskEstimation(task.id)}>-</button>
                        {" "}
                        <input
                            className="estimation"
                            min="1"
                            step="1"
                            type="number"
                            value={task.estimation || ""}
                            onChange={updateTaskEstimation(task.id)}
                        />
                        {" "}
                        <button type="button" className="button plus" onClick={incrementTaskEstimation(task.id)}>+</button>
                        {" "}
                        {timeProgressElement}
                    </div>
                </div>
            );
        });

    return (
        <div>
            <div className="tasks-bar">
                <button type="button" className="button plus" onClick={addNewTask}>+</button>
                {" "}
                <input type="text" value={filter} placeholder="Search..." onChange={updateFilter} />
            </div>
            {tasks}
        </div>
    );
}
