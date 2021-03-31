import { DateTime, Duration } from 'luxon';
import React from 'react';
import { StateContext, Event } from './state';
import { assert, groupTasksByTaskId } from './utils';

import './week.css';

function weekLogFromEvents(events: Event[], startOfWeek: DateTime) {
    let endOfWeek = startOfWeek.endOf('week');
    let indexOfFirst = events.findIndex(event => event.time >= startOfWeek);
    let eventsToCheck = indexOfFirst === -1 ? [] : events.slice(indexOfFirst);
    let week: { [taskId: number]: Duration }[] = [{}, {}, {}, {}, {}, {}, {}];
    let started: { [taskId: number]: DateTime } = {};

    for (let event of eventsToCheck) {
        if (event.time > endOfWeek && Object.entries(started).length === 0) {
            break;
        }

        if (event.time <= endOfWeek && event.action === 'start') {
            // we can't start a task that has already been started
            assert(started[event.taskId] === undefined);
            started[event.taskId] = event.time;
        }

        if (event.action === 'end') {
            // task should be started, otherwise it was started before this week and must be ignored
            if (started[event.taskId] !== undefined) {
                assert(started[event.taskId] <= event.time);
                let day = week[started[event.taskId].weekday-1];
                day[event.taskId] = day[event.taskId]?.plus(event.time.diff(started[event.taskId])) || event.time.diff(started[event.taskId]);
                delete started[event.taskId];
            }
        }
    }

    // add time between start and now for unfinished tasks
    Object.entries(started).forEach(([taskIdString, time]) => {
        let taskId = taskIdString as any as number;
        let day = week[time.weekday-1];
        day[taskId] = day[taskId]?.plus(DateTime.local().diff(time)) || DateTime.local().diff(time);
    });

    return week;
}

function formatDuration(duration: Duration): string {
    let minutes = Math.floor(duration.as('minutes'));

    if (minutes < 60) {
        return `${minutes}m`;
    } else if (minutes % 60 === 0) {
        return `${Math.floor(minutes / 60)}h`;
    } else {
        return `${Math.floor(minutes / 60)}h${minutes % 60}m`;
    }
}

export function Week() {
    const [startOfWeek, setStartOfWeek] = React.useState(DateTime.local().startOf('week'));
    const { state } = React.useContext(StateContext);

    const taskMap = React.useMemo(() => groupTasksByTaskId(state.tasks), [state.tasks]);
    const week = React.useMemo(() => weekLogFromEvents(state.events, startOfWeek), [state.events, startOfWeek]);

    const oneWeekBack = () => {
        setStartOfWeek(startOfWeek.minus({ weeks: 1 }));
    }

    const oneWeekForward = () => {
        setStartOfWeek(startOfWeek.plus({ weeks: 1 }));
    }

    return (
        <div>
            <div className="week-select">
                <button className="button minus" type="button" onClick={oneWeekBack}>&lt;</button>
                <span className="week-range">{startOfWeek.toFormat("d LLLL y") + ' - ' + startOfWeek.endOf('week').toFormat("d LLLL y")}</span>
                <button className="button plus" type="button" onClick={oneWeekForward}>&gt;</button>
            </div>
            <div className="week-view">
                {week.map((day, index) => (
                    <div className="week-day" key={startOfWeek.toString() + ' ' + index}>
                        <div className="week-day-name" key="day">{startOfWeek.plus({ days: index }).toFormat('cccc')}</div>
                        {Object.entries(day).map(([taskId, duration]) => (
                            <div className="week-task-log" key={taskId}>
                                <div className="week-task-log-name">{taskMap[taskId as any as number].name}</div>
                                <div className="week-task-log-time">{formatDuration(duration)}</div>
                            </div>
                        ))}
                        {Object.keys(day).length > 0
                            ? (
                                <div className="week-task-summary">{formatDuration(Object.values(day).reduce((acc, next) => acc.plus(next)))}</div>
                            )
                            : null
                        }
                    </div>
                ))}
            </div>
        </div>
    );
}
