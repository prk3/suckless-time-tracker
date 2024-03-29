import React from 'react';
import { DateTime } from 'luxon';
import { DragDropContext, Draggable, Droppable, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { ManDays, TaskId, useState } from './state';
import { Task } from './task';
import { assert, groupEventsByTaskId, groupTasksByTaskId, calculateTotalTimeFromEvents } from './utils';
import { useSync } from './sync';

import './tasks.css';

const ALERT_MSG = `
Good day!

This is a small app for time tracking. It's serverless, meaning all data is stored on your device, in local storage*. As you can see, it's pretty basic and not well tested. Probably works only on Firefox. Use it at your own risk.

* You can enable syncing through a self-hosted backend, more on that in README.md at https://github.com/prk3/suckless-time-tracker.

suckless-time-tracker 0.4.1`;

export function Tasks() {
    const { state, updateState } = useState();
    const { status } = useSync();
    const [filter, setFilter] = React.useState('');

    let taskMap = React.useMemo(() => groupTasksByTaskId(state.tasks), [state.tasks]);
    let story = React.useMemo(() => groupEventsByTaskId(state.events), [state.events]);

    const addNewTask = () => {
        updateState(state => {
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

        updateState(state => ({
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

        updateState(state => ({
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

        updateState(state => {
            if (active) {
                // Task must be inactive if we want to activate it.
                assert(state.activeTask !== id);

                let newEvents = [...state.events];

                if (state.activeTask !== null) {
                    assert(newEvents.length > 0);
                    assert(newEvents[newEvents.length - 1].end_time === null);
                    newEvents[newEvents.length - 1] = {
                        ...newEvents[newEvents.length - 1],
                        end_time: DateTime.local(),
                    };
                }
                newEvents.push({
                    taskId: id,
                    start_time: DateTime.local(),
                    end_time: null,
                });

                return {
                    ...state,
                    activeTask: id,
                    events: newEvents,
                };
            } else {
                // Task must be active if we want to deactivate it.
                assert(state.activeTask === id);

                let newEvents = [...state.events];

                assert(newEvents.length > 0);
                assert(newEvents[newEvents.length - 1].end_time === null);

                newEvents[newEvents.length - 1] = {
                    ...newEvents[newEvents.length - 1],
                    end_time: DateTime.local(),
                };

                return {
                    ...state,
                    activeTask: null,
                    events: newEvents,
                };
            }
        });
    };

    const deleteTask = (id: TaskId) => () => {
        // Task must exist and not be deleted.
        assert(taskMap[id] !== undefined);
        assert(taskMap[id].deleted === false);

        updateState(state => {
            let events;
            let activeTask;
            if (state.activeTask === id) {
                events = [...state.events];
                assert(events.length > 0);
                assert(events[events.length - 1].end_time === null);
                events[events.length - 1] = {
                    ...events[events.length - 1],
                    end_time: DateTime.local(),
                };
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

    const filteredTasks = state.tasks
        .filter(task => !task.deleted)
        .filter(task => filter.trim() === "" || task.name.includes(filter.trim()))

    const moveTask = (result: DropResult, provided: ResponderProvided) => {
        const source = result.source;
        const destination = result.destination;

        if (result.reason === 'DROP' && destination !== undefined) {
            updateState(state => {
                const sourceIndex = state.tasks.findIndex(e => e === filteredTasks[source.index]);
                const destinationIndex = state.tasks.findIndex(e => e === filteredTasks[destination.index]);

                const tasks = [...state.tasks];
                const [reorderedItem] = tasks.splice(sourceIndex, 1);
                tasks.splice(destinationIndex, 0, reorderedItem);

                return { ...state, tasks };
            });
        }
    };

    const tasks = filteredTasks
        .map((task, index) => {
            let active = task.id === state.activeTask;
            let timeSpent = calculateTotalTimeFromEvents(story[task.id] || []);

            return (
                <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                    {(provided) => (
                        <div style={{ padding: '2.5px 5px' }}>
                            <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} >
                                <Task
                                    task={task}
                                    active={active}
                                    timeSpent={timeSpent}
                                    onNameChange={updateTaskName(task.id)}
                                    onEstimationChange={updateTaskEstimation(task.id)}
                                    onActiveChange={updateTaskActive(task.id)}
                                    onDelete={deleteTask(task.id)}
                                />
                            </div>
                        </div>
                    )}
                </Draggable>
            );
        });

    return (
        <div>
            <div className="tasks-bar">
                <button type="button" className="button plus" onClick={addNewTask}>+</button>
                {" "}
                <input type="text" value={filter} placeholder="Search..." onChange={updateFilter} />
                {" "}
                <button type="button" className="button plus" onClick={() => alert(ALERT_MSG)}>?</button>
                {" "}
                <span className={"sync-indicator sync-indicator-" + status} title={status}>●</span>
            </div>
            <DragDropContext onDragEnd={moveTask}>
                <Droppable droppableId="tasks">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {tasks}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}
