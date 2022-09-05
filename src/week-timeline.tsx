import React from 'react';
import { DateTime, Duration } from 'luxon';
import { Event, useState } from './state';
import { groupTasksByTaskId } from './utils';
import { range } from 'lodash';

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

function weekFromEvents(events: Event[]) {
    let week: Event[][] = [[], [], [], [], [], [], []];

    for (let event of events) {
        week[event.start_time.weekday-1].push(event);
    }

    return week;
}

function topFromTime(time: DateTime) {
    return time.diff(time.startOf('day')).as('seconds') / (24 * 60 * 60);
}

function heightFromStartAndEnd(start: DateTime, end: DateTime | null) {
    const end_ = end || DateTime.local();

    if (!start.endOf('day').equals(end_.endOf('day'))) {
        return start.endOf('day').diff(start).as('seconds') / (24 * 60 * 60);
    } else {
        return end_.diff(start).as('seconds') / (24 * 60 * 60);
    }
}

function linesCountFromHeight(height: number) {
    let marginTop = 10;
    let marginBottom = 10;
    let lineHeight = 17;

    return Math.max(Math.floor((height - marginTop - marginBottom) / lineHeight), 0);
}

type Props = {
    startOfWeek: DateTime,
}

export default function WeekTimeline({ startOfWeek }: Props) {
    const { state } = useState();

    const taskMap = React.useMemo(() => groupTasksByTaskId(state.tasks), [state.tasks]);
    const weekEvents = React.useMemo(() => selectWeekEvents(state.events, startOfWeek), [state.events, startOfWeek]);
    const week = weekFromEvents(weekEvents);

    return (
        <div className="week-timeline-container">
            <div>
                {range(0, 25).map(hour => (
                    <div key={hour} className="hour-line">{hour}</div>
                ))}
            </div>
            <div className="week-view week-timeline-view">
                {week.map((events, index) => (
                    <div className="week-day" key={startOfWeek.toString() + ' ' + index}>
                        <div className="week-day-name" key="day">{startOfWeek.plus({ days: index }).toFormat('cccc')}</div>

                        <div className="week-day-events">
                            {events.map((event, index) => {
                                let top = topFromTime(event.start_time) * 960;
                                let height = heightFromStartAndEnd(event.start_time, event.end_time) * 960;
                                let lines = linesCountFromHeight(height);
                                return (
                                    <div
                                        className="week-event"
                                        key={String(event.taskId) + String(index)}
                                        style={{ top, height }}
                                        title={taskMap[event.taskId].name + ' - ' + formatDuration((event.end_time || DateTime.local()).diff(event.start_time))}
                                    >
                                        <div
                                            className="week-task-log-name"
                                            style={{WebkitLineClamp: lines || 'none'}}
                                        >
                                            {lines > 0 ? taskMap[event.taskId as any as number].name : ''}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
