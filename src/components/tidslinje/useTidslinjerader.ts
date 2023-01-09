import dayjs, { Dayjs } from 'dayjs';
import { nanoid } from 'nanoid';
import { useMemo } from 'react';

import { horizontalPositionAndWidth } from './calc';
import { innenEtDøgn, invisiblePeriods } from './filter';
import { sistePeriode } from './sort';
import { TidslinjeProps } from './Tidslinje';
import { Periode } from './types.external';
import { InternalSimpleTimeline, PositionedPeriod } from './types.internal';

const spatialPeriod = (
    period: Periode,
    timelineStart: Dayjs,
    timelineEndInclusive: Dayjs,
    direction: 'left' | 'right' = 'left'
): PositionedPeriod => {
    const start = dayjs(period.fom);
    const endInclusive = dayjs(period.tom);
    const { horizontalPosition, width } = horizontalPositionAndWidth(
        start.startOf('day'),
        endInclusive.endOf('day'),
        timelineStart,
        timelineEndInclusive
    );
    return {
        id: period.id || nanoid(),
        start: start,
        endInclusive: endInclusive,
        horizontalPosition: horizontalPosition,
        hoverLabel: period.hoverLabel,
        direction: direction,
        className: period.className,
        disabled: period.disabled,
        status: period.status,
        active: period.active,
        infoPin: period.infoPin,
        width: width,
    };
};

const adjustedEdges = (period: PositionedPeriod, i: number, allPeriods: PositionedPeriod[]): PositionedPeriod => {
    const left = i > 0 && innenEtDøgn(allPeriods[i - 1].endInclusive, period.start);
    const right = i < allPeriods.length - 1 && innenEtDøgn(period.endInclusive, allPeriods[i + 1].start);
    return left && right
        ? { ...period, cropped: 'both' }
        : left
        ? { ...period, cropped: 'left' }
        : right
        ? { ...period, cropped: 'right' }
        : period;
};

const trimmedPeriods = (period: PositionedPeriod) => {
    let { horizontalPosition, width, cropped } = period;
    if (horizontalPosition + width > 100) {
        width = 100 - horizontalPosition;
        cropped = cropped === 'left' || cropped === 'both' ? 'both' : 'right';
    }
    if (horizontalPosition < 0 && horizontalPosition + width > 0) {
        width = horizontalPosition + width;
        horizontalPosition = 0;
        cropped = cropped === 'right' || cropped === 'both' ? 'both' : 'left';
    }
    return {
        ...period,
        width: width,
        horizontalPosition: horizontalPosition,
        cropped: cropped,
    };
};

export const useTidslinjerader = (
    rader: Periode[][],
    startDato: Dayjs,
    sluttDato: Dayjs,
    direction: 'left' | 'right'
): InternalSimpleTimeline[] =>
    useMemo(
        () =>
            rader.map((perioder) => {
                const tidslinjeperioder = perioder
                    .map((periode: Periode) => spatialPeriod(periode, startDato, sluttDato, direction))
                    .sort(sistePeriode)
                    .map(adjustedEdges)
                    .map(trimmedPeriods)
                    .filter(invisiblePeriods);
                return {
                    id: nanoid(),
                    periods: direction === 'left' ? tidslinjeperioder : tidslinjeperioder.reverse(),
                };
            }),
        [rader, startDato, sluttDato]
    );

const tidligsteDato = (tidligst: Date, periode: Periode) => (periode.fom < tidligst ? periode.fom : tidligst);

const tidligsteFomDato = (rader: Periode[][]) => rader.flat().reduce(tidligsteDato, new Date());

export const useTidligsteDato = ({ startDato, rader }: TidslinjeProps) =>
    useMemo(() => (startDato ? dayjs(startDato) : dayjs(tidligsteFomDato(rader))), [startDato, rader]);

const senesteDato = (senest: Date, periode: Periode) => (periode.tom > senest ? periode.tom : senest);

const senesteTomDato = (rader: Periode[][]) => rader.flat().reduce(senesteDato, new Date(0));

export const useSenesteDato = ({ sluttDato, rader }: TidslinjeProps) =>
    useMemo(() => (sluttDato ? dayjs(sluttDato) : dayjs(senesteTomDato(rader)).add(1, 'day')), [sluttDato, rader]);
