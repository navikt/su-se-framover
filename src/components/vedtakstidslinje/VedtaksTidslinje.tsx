import { Collapse } from '@navikt/ds-icons';
import { Button, Popover } from '@navikt/ds-react';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { VedtakType } from '~src/types/Vedtak';
import { VedtakPåTidslinje, VedtakPåTidslinjeType } from '~src/types/VedtakPåTidslinje';

import OppsummeringAvVedtak from '../oppsummeringAvVedtak/OppsummeringAvVedtak';
import { Tidslinje } from '../tidslinje/Tidslinje';
import { Periode as TidslinjePeriode } from '../tidslinje/types.external';

import messages from './VedtaksTidslinje-nb';
import styles from './vedtaksTidslinje.module.less';

const Vedtakstidslinje = (props: { vedtakerPåTidslinje: VedtakPåTidslinje[] }) => {
    const { formatMessage } = useI18n({ messages });
    const divRef = useRef<HTMLDivElement>(null);

    if (!props.vedtakerPåTidslinje?.length) {
        return null;
    }

    const [vedtakIdPåKlikketPeriode, setVedtakIdPåKlikketPeriode] = useState<Nullable<string>>(null);
    const sorterteVedtaker = [...props.vedtakerPåTidslinje].sort((a: VedtakPåTidslinje, b: VedtakPåTidslinje) => {
        return Date.parse(a.periode.fraOgMed) - Date.parse(b.periode.fraOgMed);
    });

    return (
        <div className={styles.vedtakstidslinjeContainer}>
            <Tidslinje
                onSelectPeriode={(periode: TidslinjePeriode) => {
                    setVedtakIdPåKlikketPeriode(
                        sorterteVedtaker.find((vPåLinje) => vPåLinje.vedtakId === periode.id?.split(' ')[1])
                            ?.vedtakId ?? null
                    );
                }}
                pins={[{ date: new Date() }]}
                startDato={new Date(sorterteVedtaker[0].periode.fraOgMed)}
                sluttDato={new Date(sorterteVedtaker[sorterteVedtaker.length - 1].periode.tilOgMed)}
                rader={[
                    sorterteVedtaker.map((vedtakPåTidslinje) => ({
                        fom: new Date(vedtakPåTidslinje.periode.fraOgMed),
                        //kan eksisitere samme vedtak over flere perioder, noe som fører til at vedtaksId ikke er unik på linjen
                        id: `${vedtakPåTidslinje.periode.fraOgMed} ${vedtakPåTidslinje.vedtakId}`,
                        status: 'suksess',
                        className: vedtaktypeTilPeriodeStyle(vedtakPåTidslinje.vedtakType),
                        tom: new Date(vedtakPåTidslinje.periode.tilOgMed),
                    })),
                ]}
            />

            <div ref={divRef} />
            <Popover
                open={!!vedtakIdPåKlikketPeriode}
                onClose={() => void 0}
                anchorEl={divRef.current}
                placement="bottom"
                arrow={false}
            >
                <Popover.Content>
                    <div className={styles.popoverContent}>
                        <div className={styles.lukkKnappContainer}>
                            <Button
                                type="button"
                                variant={'tertiary'}
                                onClick={() => {
                                    console.log('closed');
                                    setVedtakIdPåKlikketPeriode(null);
                                }}
                            >
                                <div className={styles.lukkKnappTekst}>
                                    {formatMessage('oppsummering.lukk')} <Collapse />
                                </div>
                            </Button>
                        </div>
                        {vedtakIdPåKlikketPeriode && <OppsummeringAvVedtak vedtakId={vedtakIdPåKlikketPeriode} />}
                    </div>
                </Popover.Content>
            </Popover>
        </div>
    );
};

export default Vedtakstidslinje;

const vedtaktypeTilPeriodeStyle = (v: VedtakPåTidslinjeType) => {
    switch (v) {
        case VedtakType.ENDRING:
            return classNames(styles.endringPeriode, styles.endringIkon);
        case VedtakType.GJENOPPTAK_AV_YTELSE:
            return classNames(styles.gjenopptakAvYtelsePeriode, styles.gjenopptakAvYtelseIkon);
        case VedtakType.OPPHØR:
            return classNames(styles.opphørPeriode, styles.opphørIkon);
        case VedtakType.REGULERING:
            return classNames(styles.reguleringPeriode, styles.reguleringIkon);
        case VedtakType.STANS_AV_YTELSE:
            return classNames(styles.stansPeriode, styles.stansIkon);
        case VedtakType.SØKNAD:
            return classNames(styles.søknadPeriode, styles.søknadIkon);
    }
};
