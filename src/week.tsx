import { DateTime } from 'luxon';
import React from 'react';
import WeekSummary from './week-summary';
import WeekTimeline from './week-timeline';

import './week.css';

export function Week() {
    const [startOfWeek, setStartOfWeek] = React.useState(DateTime.local().startOf('week'));
    const [mode, setMode] = React.useState<'summary'|'timeline'>('summary');

    const oneWeekBack = () => {
        setStartOfWeek(startOfWeek.minus({ weeks: 1 }));
    }

    const oneWeekForward = () => {
        setStartOfWeek(startOfWeek.plus({ weeks: 1 }));
    }

    const toggleMode = () => {
        setMode(mode === 'summary' ? 'timeline' : 'summary');
    }

    return (
        <div>
            <div className="week-select">
                <button className="button minus" type="button" onClick={oneWeekBack}>&lt;</button>
                <span className="week-range">{startOfWeek.toFormat("d LLLL y") + ' - ' + startOfWeek.endOf('week').toFormat("d LLLL y")}</span>
                <button className="button plus" type="button" onClick={oneWeekForward}>&gt;</button>
                <button className="button plus" type="button" onClick={toggleMode}>↷</button>
            </div>
            <div>
                {mode === 'summary' && <WeekSummary startOfWeek={startOfWeek} />}
                {mode === 'timeline' && <WeekTimeline startOfWeek={startOfWeek} />}
            </div>
        </div>
    );
}
