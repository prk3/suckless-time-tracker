import { DateTime, Duration } from "luxon";
import { MouseEvent } from "react";
import { Event, Task } from "./state";

export function groupTasksByTaskId(tasks: Task[]): { [taskId: number]: Task } {
    return Object.fromEntries(tasks.map(task => [task.id, task]));
}

export function groupEventsByTaskId(events: Event[]): { [taskId: number]: Event[] } {
    let story: { [taskId: number]: Event[] } = {};

    for (let event of events) {
        // Ignore all events that have no start.
        if (event.action === "end" && story[event.taskId] === undefined) {
            continue;
        }

        if (story[event.taskId]) {
            // We don't allow concurrent tasks. There can't be two starts or two ends one after other.
            assert(story[event.taskId][story[event.taskId].length - 1].action !== event.action);
            story[event.taskId].push(event);
        } else {
            story[event.taskId] = [event];
        }
    }

    return story;
}

export function calculateTotalTimeFromEvents(events: Event[]): Duration {
    let totalTime = Duration.fromObject({ seconds: 0 });
    let startTime: DateTime | null = null;

    events.forEach(event => {
        if (startTime === null) {
            // No event started. Anticipating start.
            assert(event.action === 'start');
            assert(event.time <= DateTime.local());
            startTime = event.time;
        } else {
            // Event started. Anticipating end.
            assert(event.action === 'end');
            assert(event.time <= DateTime.local());
            assert(event.time >= startTime);
            totalTime = totalTime.plus(event.time.diff(startTime));
            startTime = null;
        }
    });

    // Add time of unfinished tasks.
    if (startTime !== null) {
        totalTime = totalTime.plus(DateTime.local().diff(startTime));
    }

    return totalTime;
}

export function cs(...classes: (string | false)[]): string {
    let output = "";
    classes.forEach(c => {
        if (c !== false) {
            output = output + " " + c;
        }
    });
    return output;
}

export function assert(condition: boolean): void {
    if (!condition) {
        console.error("assertion failed!");
        console.trace();
        throw new Error("assertion failed");
    }
}

export const onlyThisElementClick = (fn: (ev: MouseEvent) => void) => (ev: MouseEvent) => {
    if (ev.target === ev.currentTarget) {
        fn(ev);
    }
}
