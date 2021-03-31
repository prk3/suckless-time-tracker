import { Duration } from 'luxon';
import { ManDays, Task as TaskModel } from './state';
import { cs, onlyThisElementClick } from './utils';
import './task.css';

const HOURS_IN_ONE_MAN_DAY = 7;

type TaskProps = {
    task: TaskModel,
    active: boolean,
    timeSpent: Duration,
    onActiveChange: (active: boolean) => void,
    onEstimationChange: (estimation: ManDays | null) => void,
    onNameChange: (name: string) => void,
    onDelete: () => void,
};

export function Task({ task, active, timeSpent, onActiveChange, onEstimationChange, onNameChange, onDelete }: TaskProps) {

    const updateName = (ev: any) => {
        onNameChange(ev.target.value);
    };

    const toggleActive = () => {
        onActiveChange(!active);
    }

    const updateEstimation = (ev: any) => {
        onEstimationChange(Number(ev.target.value) || null);
    };

    const incrementEstimation = () => {
        onEstimationChange((task.estimation || 0) + 1);
    };

    const decrementEstimation = () => {
        onEstimationChange(((task.estimation || 1) - 1) || null);
    };

    let timeSpentElement = null;

    if (task.estimation !== null) {
        let estimationSpent = timeSpent.as('hours') / HOURS_IN_ONE_MAN_DAY;
        let estimationRatio = estimationSpent / task.estimation;
        let estimationClassName;

             if (estimationRatio < 0.5) estimationClassName = 'ok';
        else if (estimationRatio < 0.7) estimationClassName = 'worse';
        else if (estimationRatio < 0.9) estimationClassName = 'bad';
        else                            estimationClassName = 'critical';

        timeSpentElement = (
            <span>
                Time:
                {" "}
                <progress
                    className={cs(estimationClassName)}
                    value={Math.min(estimationRatio, 1.0)}
                    title={`${estimationSpent.toFixed(1)} of ${task.estimation} man days`}
                    max="1"
                />
            </span>
        );
    }

    return (
        <div
            className={cs("task", active && "active")}
            key={task.id}
            onClick={onlyThisElementClick(toggleActive)}
        >
            <div><textarea className="name" value={task.name} onChange={updateName}/></div>
            <div>{"Estimation: "}
                <button type="button" className="button minus" onClick={decrementEstimation}>-</button>
                {" "}
                <input
                    className="estimation"
                    min="1"
                    step="1"
                    type="number"
                    value={task.estimation || ""}
                    onChange={updateEstimation}
                />
                {" "}
                <button type="button" className="button plus" onClick={incrementEstimation}>+</button>
                {" "}
                {timeSpentElement}
                {" "}
                <button type="button" className="button" onClick={() => window.confirm("You sure?") && onDelete()}>Delete</button>
            </div>
        </div>
    );
}
