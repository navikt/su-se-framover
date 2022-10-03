import { Collapse } from '@navikt/ds-icons';
import { Button, Popover } from '@navikt/ds-react';
import * as HelseFrontend from '@navikt/helse-frontend-tidslinje';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';

import '@navikt/helse-frontend-tidslinje/lib/main.css';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import Vedtaksoppsummering from '~src/pages/saksbehandling/vedtak/Vedtaksoppsummering';
import { VedtakType } from '~src/types/Vedtak';
import { VedtakPåTidslinje, VedtakPåTidslinjeType } from '~src/types/VedtakPåTidslinje';

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
        <div>
            <HelseFrontend.Tidslinje
                onSelectPeriode={(periode: HelseFrontend.Periode) => {
                    setVedtakIdPåKlikketPeriode(
                        sorterteVedtaker.find((vPåLinje) => vPåLinje.vedtakId === periode.id)?.vedtakId ?? null
                    );
                }}
                pins={[{ date: new Date() }]}
                startDato={new Date(sorterteVedtaker[0].periode.fraOgMed)}
                sluttDato={new Date(sorterteVedtaker[sorterteVedtaker.length - 1].periode.tilOgMed)}
                rader={[
                    sorterteVedtaker.map((vedtakPåTidslinje) => ({
                        fom: new Date(vedtakPåTidslinje.periode.fraOgMed),
                        id: vedtakPåTidslinje.vedtakId,
                        status: 'suksess',
                        className: vedtaktypeTilPeriodeStyle(vedtakPåTidslinje.vedtakType),
                        tom: new Date(vedtakPåTidslinje.periode.tilOgMed),
                    })),
                ]}
            />

            <div ref={divRef} />
            <Popover
                open={!!vedtakIdPåKlikketPeriode}
                onClose={() => {
                    setVedtakIdPåKlikketPeriode(null);
                }}
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
                                onClick={() => setVedtakIdPåKlikketPeriode(null)}
                            >
                                <div className={styles.lukkKnappTekst}>
                                    {formatMessage('oppsummering.lukk')} <Collapse />
                                </div>
                            </Button>
                        </div>
                        <Vedtaksoppsummering vedtakId={vedtakIdPåKlikketPeriode ?? ''} ikkeVisTilbakeKnapp />
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
        case VedtakType.INGEN_ENDRING:
            return classNames(styles.ingenEndringPeriode, styles.ingenEndringIkon);
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