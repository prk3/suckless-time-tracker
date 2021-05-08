import { DateTime, Duration } from 'luxon';
import React from 'react';
import { StateContext, Event } from './state';
import { assert, groupTasksByTaskId } from './utils';

import './week.css';

function weekLogFromEvents(events: Event[], startOfWeek: DateTime) {
    let endOfWeek = startOfWeek.endOf('week');
    let indexOfFirst = events.findIndex(event => event.start_time >= startOfWeek);
    let eventsToCheck = indexOfFirst === -1 ? [] : events.slice(indexOfFirst);
    let week: { [taskId: number]: Duration }[] = [{}, {}, {}, {}, {}, {}, {}];

    for (let event of eventsToCheck) {
        if (event.start_time > endOfWeek) {
            break;
        }

        let day = week[event.start_time.weekday-1];
        let taskDuration = (event.end_time || DateTime.local()).diff(event.start_time);
        day[event.taskId] = day[event.taskId]?.plus(taskDuration) ?? taskDuration;
    }

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
