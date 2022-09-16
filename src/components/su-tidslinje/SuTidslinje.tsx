import { Collapse } from '@navikt/ds-icons';
import { Button, Popover } from '@navikt/ds-react';
import * as HelseFrontend from '@navikt/helse-frontend-tidslinje';
import React, { useRef, useState } from 'react';

import '@navikt/helse-frontend-tidslinje/lib/main.css';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import Vedtaksoppsummering from '~src/pages/saksbehandling/vedtak/Vedtaksoppsummering';
import { VedtakType } from '~src/types/Vedtak';
import { VedtakPåTidslinje, VedtakPåTidslinjeType } from '~src/types/VedtakPåTidslinje';

import messages from './SuTidslinje-nb';
import styles from './suTidslinje.module.less';

const SuTidslinje = (props: { vedtakerPåTidslinje: VedtakPåTidslinje[] }) => {
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
            <HelseFrontend.Sykepengetidslinje
                startDato={new Date(sorterteVedtaker[0].periode.fraOgMed)}
                sluttDato={new Date(sorterteVedtaker[sorterteVedtaker.length - 1].periode.tilOgMed)}
                maksdato={{ date: new Date() }}
                onSelectPeriode={(periode: HelseFrontend.Periode) => {
                    setVedtakIdPåKlikketPeriode(
                        sorterteVedtaker.find((vPåLinje) => vPåLinje.vedtakId === periode.id)?.vedtakId ?? null
                    );
                }}
                rader={[
                    sorterteVedtaker.map((vedtakPåTidslinje) => ({
                        fom: new Date(vedtakPåTidslinje.periode.fraOgMed),
                        id: vedtakPåTidslinje.vedtakId,
                        status: vedtaksTypeTilVedtaksperiodetilstand(vedtakPåTidslinje.vedtakType),
                        tom: new Date(vedtakPåTidslinje.periode.tilOgMed),
                    })),
                ]}
            />

            <div ref={divRef} />
            <Popover
                open={!!vedtakIdPåKlikketPeriode}
                onClose={() => {
                    return;
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

export default SuTidslinje;

const vedtaksTypeTilVedtaksperiodetilstand = (v: VedtakPåTidslinjeType) => {
    switch (v) {
        case VedtakType.ENDRING:
            return HelseFrontend.Vedtaksperiodetilstand.Oppgaver;
        case VedtakType.GJENOPPTAK_AV_YTELSE:
            return HelseFrontend.Vedtaksperiodetilstand.TilUtbetaling;
        case VedtakType.INGEN_ENDRING:
            return HelseFrontend.Vedtaksperiodetilstand.UtbetaltIInfotrygd;
        case VedtakType.OPPHØR:
            return HelseFrontend.Vedtaksperiodetilstand.Annullert;
        case VedtakType.REGULERING:
            return HelseFrontend.Vedtaksperiodetilstand.Venter;
        case VedtakType.STANS_AV_YTELSE:
            return HelseFrontend.Vedtaksperiodetilstand.Avslag;
        case VedtakType.SØKNAD:
            return HelseFrontend.Vedtaksperiodetilstand.Utbetalt;
    }
};
