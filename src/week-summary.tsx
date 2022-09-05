import React from 'react';
import { DateTime, Duration } from 'luxon';
import { Event, useState } from './state';
import { groupTasksByTaskId } from './utils';

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

function selectWeekEvents(events: Event[], startOfWeek: DateTime) {
    let endOfWeek = startOfWeek.endOf('week');
    return events.filter(event => event.start_time >= startOfWeek && event.start_time <= endOfWeek);
}

function weekLogFromEvents(events: Event[]) {
    let week: { [taskId: number]: Duration }[] = [{}, {}, {}, {}, {}, {}, {}];

    for (let event of events) {
        let day = week[event.start_time.weekday-1];
        let taskDuration = (event.end_time || DateTime.local()).diff(event.start_time);
        day[event.taskId] = day[event.taskId]?.plus(taskDuration) ?? taskDuration;
    }

    return week;
}

type Props = {
    startOfWeek: DateTime,
}

export default function WeekSummary({ startOfWeek }: Props) {
    const { state } = useState();

    const taskMap = React.useMemo(() => groupTasksByTaskId(state.tasks), [state.tasks]);
    const weekEvents = React.useMemo(() => selectWeekEvents(state.events, startOfWeek), [state.events, startOfWeek]);
    const weekLog = weekLogFromEvents(weekEvents);

    return (
        <div className="week-view">
            {weekLog.map((day, index) => (
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
    );
}
