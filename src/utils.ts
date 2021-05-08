import { DateTime, Duration } from "luxon";
import { MouseEvent } from "react";
import { Event, Task } from "./state";

export function groupTasksByTaskId(tasks: Task[]): { [taskId: number]: Task } {
    return Object.fromEntries(tasks.map(task => [task.id, task]));
}

export function groupEventsByTaskId(events: Event[]): { [taskId: number]: Event[] } {
    let story: { [taskId: number]: Event[] } = {};

    for (let event of events) {
        if (story[event.taskId]) {
            story[event.taskId].push(event);
        } else {
            story[event.taskId] = [event];
        }
    }

    return story;
}

export function calculateTotalTimeFromEvents(events: Event[]): Duration {
    let totalTime = Duration.fromObject({ seconds: 0 });

    events.forEach(event => {
        totalTime = totalTime.plus((event.end_time || DateTime.local()).diff(event.start_time));
    });

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
