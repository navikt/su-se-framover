import classNames from 'classnames';
import React from 'react';

import * as styles from './Tidslinjerad.module.less';
import { TimelinePeriod } from './TimelinePeriod';
import { PositionedPeriod } from './types.internal';

interface TimelineRowProps {
    periods: PositionedPeriod[];
    onSelectPeriod?: (periode: PositionedPeriod) => void;
    active?: boolean;
}

export const EmptyTimelineRow = () => <hr className={styles.emptyRow} />;

export const TimelineRow = ({ periods, onSelectPeriod, active = false }: TimelineRowProps) => (
    <div className={classNames('tidslinjerad', styles.perioder, active && styles.aktivRad)}>
        {periods.map((period) => (
            <TimelinePeriod key={period.id} period={period} onSelectPeriod={onSelectPeriod} active={period.active} />
        ))}
    </div>
);
