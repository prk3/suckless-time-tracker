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

// Either start or end of working on a task.
export type Event = {
    taskId: TaskId,
    time: DateTime,
    action: 'start'|'end',
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
}

export const initial: State = {
    tasks: [],
    events: [],
    activeTask: null,
    settings: {
        manDayDuration: Duration.fromObject({ hours: 7 }),
        eventRetentionMonths: 3,
    },
};

export type StateUpdateFunction = (state: State) => State;

export type StateUpdate = (fn: StateUpdateFunction) => void;

export const StateContext = React.createContext({ state: initial, update: () => {} } as { state: State, update: StateUpdate });

export function deserialize(stateString: string): State {
    let obj = JSON.parse(stateString);
    let hydrated = {
        ...obj,
        events: obj.events.map((e: any) => ({
            ...e,
            time: DateTime.fromISO(e.time)
        })),
        settings: {
            ...obj.settings,
            manDayDuration: Duration.fromISO(obj.settings.manDayDuration),
        },
    };

    return hydrated as State;
}
