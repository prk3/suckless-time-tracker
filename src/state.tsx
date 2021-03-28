import { DateTime } from 'luxon';
import React from 'react';

export type TaskId = number;
export type ManDays = number;

export type Event = {
    time: DateTime,
    task_id: TaskId,
    action: 'start'|'end',
}

export type Task = {
    id: TaskId,
    name: string,
    estimation: ManDays | null,
}

export type TaskStory = Event[];

export type State = {
    tasks: Task[],
    events: Event[],
    activeTask: TaskId | null,
    taskStory: { [taskId: number]: TaskStory };
}

export const initial: State = {
    tasks: [],
    events: [],
    taskStory: {},
    activeTask: null,
};

export type StateUpdateFunction = (state: State) => State;

export type StateUpdate = (fn: StateUpdateFunction) => void;

export const StateContext = React.createContext({ state: initial, update: () => {} } as { state: State, update: StateUpdate });

export const deserialize = (stateString: string): State => {
    let obj = JSON.parse(stateString);
    let hydrated = {
        ...obj,
        events: obj.events.map((e: any) => ({ ...e, time: DateTime.fromISO(e.time) })),
        taskStory: Object.fromEntries(Object.entries(obj.taskStory).map(([eventId, story]: any) => {
            return [eventId, story.map((e: any) => ({ ...e, time: DateTime.fromISO(e.time) }))];
        })),
    };

    return hydrated as State;
}
