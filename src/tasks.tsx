import { DateTime } from 'luxon';
import React from 'react';
import { Event, ManDays, StateContext, TaskId } from './state';
import { Task } from './task';
import { assert, groupEventsByTaskId, groupTasksByTaskId, calculateTotalTimeFromEvents } from './utils';
import './tasks.css';

export function Tasks() {
    const { state, update } = React.useContext(StateContext);
    const [filter, setFilter] = React.useState('');

    let taskMap = React.useMemo(() => groupTasksByTaskId(state.tasks), [state.tasks]);
    let story = React.useMemo(() => groupEventsByTaskId(state.events), [state.events]);

    const addNewTask = () => {
        update(state => {
            let id = Math.floor(Math.random() * 1_000_000_000);

            return {
                ...state,
                tasks: [
                    {
                        id,
                        name: "",
                        estimation: null,
                        deleted: false,
                    },
                    ...state.tasks,
                ],
            };
        });
        // Focus on the new task.
        window.setTimeout(() => {
            // @ts-ignore
            document.querySelector(".task .name")?.focus();
        },1);
    };

    const updateFilter = (ev: any) => {
        setFilter(ev.target.value);
    };

    const updateTaskName = (id: TaskId) => (name: string) => {
        // Task must exist and not be deleted.
        assert(taskMap[id] !== undefined);
        assert(taskMap[id].deleted === false);

        update(state => ({
            ...state,
            tasks: state.tasks.map(task => task.id !== id
                ? task
                : { ...task, name }
            ),
        }));
    };

    const updateTaskEstimation = (id: TaskId) => (estimation: ManDays | null) => {
        // Task must exist and not be deleted.
        assert(taskMap[id] !== undefined);
        assert(taskMap[id].deleted === false);

        update(state => ({
            ...state,
            tasks: state.tasks.map(task => task.id !== id
                ? task
                : { ...task, estimation }
            ),
        }));
    };

    const updateTaskActive = (id: TaskId) => (active: boolean) => {
        // Task must exist and not be deleted.
        assert(taskMap[id] !== undefined);
        assert(taskMap[id].deleted === false);

        update(state => {
            if (active) {
                // Task must be inactive if we want to activate it.
                assert(state.activeTask !== id);

                let newEvents = [...state.events];

                if (state.activeTask !== null) {
                    newEvents.push({
                        taskId: state.activeTask,
                        time: DateTime.local(),
                        action: 'end',
                    });
                }
                newEvents.push({
                    taskId: id,
                    time: DateTime.local(),
                    action: 'start',
                });

                return {
                    ...state,
                    activeTask: id,
                    events: newEvents,
                };
            } else {
                // Task must be active if we want to deactivate it.
                assert(state.activeTask === id);

                let newEvent: Event = {
                    taskId: state.activeTask as TaskId,
                    time: DateTime.local(),
                    action: 'end',
                };

                return {
                    ...state,
                    activeTask: null,
                    events: [...state.events, newEvent],
                };
            }
        });
    };

    const deleteTask = (id: TaskId) => () => {
        // Task must exist and not be deleted.
        assert(taskMap[id] !== undefined);
        assert(taskMap[id].deleted === false);

        update(state => {
            let events;
            let activeTask;
            if (state.activeTask === id) {
                events = [
                    ...state.events,
                    {
                        taskId: state.activeTask,
                        time: DateTime.local(),
                        action: "end" as "end",
                    }
                ];
                activeTask = null;
            } else {
                events = state.events;
                activeTask = state.activeTask;
            }

            return {
                ...state,
                tasks: state.tasks.map(task => task.id !== id
                    ? task
                    : { ...task, deleted: true }
                ),
                activeTask,
                events,
            };
        });
    };

    const tasks = state.tasks
        .filter(task => !task.deleted)
        .filter(task => filter.trim() === "" || task.name.includes(filter.trim()))
        .map(task => {
            let active = task.id === state.activeTask;
            let timeSpent = calculateTotalTimeFromEvents(story[task.id] || []);

            return (
                <Task
                    key={task.id}
                    task={task}
                    active={active}
                    timeSpent={timeSpent}
                    onNameChange={updateTaskName(task.id)}
                    onEstimationChange={updateTaskEstimation(task.id)}
                    onActiveChange={updateTaskActive(task.id)}
                    onDelete={deleteTask(task.id)}
                />
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
