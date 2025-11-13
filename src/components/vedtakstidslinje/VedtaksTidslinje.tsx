import { Popover, Timeline } from '@navikt/ds-react';
import { useRef, useState } from 'react';

import { CheckmarkIkon, HåndMedPengerIkon, RevurderingBlyantIkon, StansIkon, SøknadIkon } from '~src/assets/Icons';
import { Nullable } from '~src/lib/types';
import { VedtakType } from '~src/types/Vedtak';
import { VedtakPåTidslinje, VedtakPåTidslinjeType } from '~src/types/VedtakPåTidslinje';
import { parseNonNullableIsoDateOnly } from '~src/utils/date/dateUtils';

import OppsummeringAvVedtak from '../oppsummering/oppsummeringAvVedtak/OppsummeringAvVedtak';

import styles from './vedtaksTidslinje.module.less';

const Vedtakstidslinje = (props: { vedtakerPåTidslinje: VedtakPåTidslinje[] }) => {
    const divRef = useRef<HTMLDivElement>(null);

    if (!props.vedtakerPåTidslinje?.length) {
        return null;
    }

    const [vedtakIdPåKlikketPeriode, setVedtakIdPåKlikketPeriode] = useState<Nullable<string>>(null);
    const sorterteVedtaker = [...props.vedtakerPåTidslinje].sort((a: VedtakPåTidslinje, b: VedtakPåTidslinje) => {
        return Date.parse(a.periode.fraOgMed) - Date.parse(b.periode.fraOgMed);
    });

    return (
        <div>
            <Timeline>
                {new Date() > new Date(sorterteVedtaker[sorterteVedtaker.length - 1].periode.tilOgMed) ? null : (
                    <Timeline.Pin date={new Date()} />
                )}
                <Timeline.Row label=" ">
                    {sorterteVedtaker.map((v) => {
                        const props = periodeStyles(v.vedtakType);
                        return (
                            <Timeline.Period
                                className={props.className}
                                status={props.status}
                                key={`${v.periode.fraOgMed} ${v.vedtakId}`}
                                start={parseNonNullableIsoDateOnly(v.periode.fraOgMed)}
                                end={parseNonNullableIsoDateOnly(v.periode.tilOgMed)}
                                icon={props.ikon}
                                isActive={vedtakIdPåKlikketPeriode === v.vedtakId}
                                onSelectPeriod={() => {
                                    setVedtakIdPåKlikketPeriode(
                                        sorterteVedtaker.find((vPåLinje) => vPåLinje.vedtakId === v.vedtakId)
                                            ?.vedtakId ?? null,
                                    );
                                }}
                                aria-controls="timeline-panel"
                            ></Timeline.Period>
                        );
                    })}
                </Timeline.Row>
            </Timeline>

            <div ref={divRef} />
            <Popover
                open={!!vedtakIdPåKlikketPeriode}
                onClose={() => setVedtakIdPåKlikketPeriode(null)}
                anchorEl={divRef.current}
                placement="bottom"
                arrow={false}
            >
                <Popover.Content>
                    <div>
                        {vedtakIdPåKlikketPeriode && <OppsummeringAvVedtak vedtakId={vedtakIdPåKlikketPeriode} />}
                    </div>
                </Popover.Content>
            </Popover>
        </div>
    );
};

export default Vedtakstidslinje;

const periodeStyles = (
    v: VedtakPåTidslinjeType,
): {
    status: 'warning' | 'success' | 'danger' | 'info' | 'neutral';
    ikon: React.ReactElement;
    className?: string;
} => {
    switch (v) {
        case VedtakType.ENDRING:
            return { status: 'warning', ikon: <RevurderingBlyantIkon /> };
        case VedtakType.GJENOPPTAK_AV_YTELSE:
            return { status: 'success', ikon: <CheckmarkIkon /> };
        case VedtakType.OPPHØR:
            return { status: 'danger', ikon: <RevurderingBlyantIkon /> };
        case VedtakType.REGULERING:
            return { status: 'success', ikon: <HåndMedPengerIkon /> };
        case VedtakType.STANS_AV_YTELSE:
            return { status: 'danger', ikon: <StansIkon /> };
        case VedtakType.SØKNAD:
            return { status: 'info', ikon: <SøknadIkon />, className: styles.søknadPeriode }; //status må endres
    }
};
