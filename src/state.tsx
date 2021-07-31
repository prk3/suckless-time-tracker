import { DateTime, Duration } from 'luxon';
import React from 'react';

export type TaskId = number;
export type ManDays = number;

// A thing you can work on.
export type Task = {
    id: TaskId,
    name: string,
    // If estimated, we'll be able to show time spent on the task.
    estimation: ManDays | null,
    // Flag hiding a task from the interface. Soft-deleted tasks will be
    // permanently deleted when no "start" event has been recorded in 3 months.
    // This makes sure that deleting a task will not destroy "recent" history.
    deleted: boolean,
}

// Started or started and finished piece of work.
export type Event = {
    taskId: TaskId,
    start_time: DateTime,
    end_time: DateTime | null,
}

export type Settings = {
    // How much real time one ManDay represents. Used for displaying progress
    // on tasks.
    manDayDuration: Duration,
    // The app is allowed to delete events older than that many months. Progress
    // on estimated tasks may go down.
    eventRetentionMonths: number,
}

export type State = {
    tasks: Task[],
    events: Event[],
    activeTask: TaskId | null,
    settings: Settings,
    // Number identifying state format. Used for migrating.
    version: number,
}

export const initialState: State = {
    tasks: [],
    events: [],
    activeTask: null,
    settings: {
        manDayDuration: Duration.fromObject({ hours: 7 }),
        eventRetentionMonths: 3,
    },
    version: 1,
};

export type StateUpdateFunction = (state: State) => State;

export type StateUpdate = (fn: StateUpdateFunction) => void;

export const StateContext = React.createContext({ state: initialState, update: () => {} } as { state: State, update: StateUpdate });

export function serializeState(state: State): string {
    return JSON.stringify(state);
}

export function deserializeState(stateString: string): State {
    let obj = JSON.parse(stateString);

    // migrations
    // current version = 1
    if (obj.version !== 1) {
        throw new Error(`State in unsupported version "${obj.version}". Update the app.`);
    }

    let hydrated = {
        ...obj,
        events: obj.events.map((e: any) => ({
            ...e,
            start_time: DateTime.fromISO(e.start_time),
            end_time: e.end_time && DateTime.fromISO(e.end_time)
        })),
        settings: {
            ...obj.settings,
            manDayDuration: Duration.fromISO(obj.settings.manDayDuration),
        },
    };

    return hydrated as State;
}
