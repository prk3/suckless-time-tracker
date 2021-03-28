import { DateTime, Duration } from "luxon";
import { MouseEvent } from "react";
import { TaskStory } from "./state";

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

export const workTimeFromStory = (story: TaskStory): Duration => {
    let totalTime = Duration.fromObject({ seconds: 0 });
    let startTime: DateTime | null = null;

    story.forEach(event => {
        // if waiting for start, expect start event
        if (startTime === null) {
            assert(event.action === 'start');
            assert(event.time <= DateTime.local());
            startTime = event.time;
        } else {
            assert(event.action === 'end');
            assert(event.time <= DateTime.local());
            assert(event.time >= startTime);
            totalTime = totalTime.plus(event.time.diff(startTime));
            startTime = null;
        }
    });

    if (startTime !== null) {
        // task hasn't ended
        totalTime = totalTime.plus(DateTime.local().diff(startTime));
    }

    return totalTime;
}