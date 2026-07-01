import { BodyShort, Button, Heading, HStack, Label, Loader } from '@navikt/ds-react';
import { ReactNode } from 'react';

import { NotatResponse } from '~src/types/Notat';
import styles from './notatPanel.module.less';
import { formatTidspunkt } from './notatPanelUtils';

type Props = {
    notat: NotatResponse | null;
    manglerNotat: boolean;
    underAttestering: boolean;
    kanRedigere: boolean;
    harAttestantNotat: boolean;
    skalViseVedleggsknapp: boolean;
    antallVedlegg: number;
    lasterNotat: boolean;
    oppretterNotat: boolean;
    statusElement?: ReactNode;
    onOpprettNotat: () => void;
    onOpenEditor: () => void;
    onOpenVedlegg: () => void;
    onOpenAttestant: () => void;
};

const NotatToolbar = (props: Props) => {
    return (
        <div className={styles.topBar}>
            <div className={styles.topBarContent}>
                <HStack gap="3" align="center" className={styles.actionRow}>
                    <Heading level="2" size="small">
                        Notat
                    </Heading>
                    {props.lasterNotat && <Loader size="small" title="Henter notat" />}
                    {props.manglerNotat && props.kanRedigere && (
                        <Button
                            type="button"
                            size="small"
                            onClick={props.onOpprettNotat}
                            loading={props.oppretterNotat}
                        >
                            Lag notat
                        </Button>
                    )}
                    {props.notat && (
                        <>
                            <Button type="button" size="small" onClick={props.onOpenEditor}>
                                {props.kanRedigere
                                    ? props.underAttestering
                                        ? 'Rediger attestantnotat'
                                        : 'Rediger notat'
                                    : 'Vis notat'}
                            </Button>
                            {props.skalViseVedleggsknapp && (
                                <Button type="button" size="small" variant="secondary" onClick={props.onOpenVedlegg}>
                                    {props.kanRedigere && props.antallVedlegg === 0
                                        ? 'Legg til vedlegg'
                                        : `Vis vedlegg (${props.antallVedlegg})`}
                                </Button>
                            )}
                            {props.harAttestantNotat && (
                                <Button type="button" size="small" variant="tertiary" onClick={props.onOpenAttestant}>
                                    Vis attestantnotat
                                </Button>
                            )}
                            <div className={styles.metaBlock}>
                                <Label size="small">Sist endret</Label>
                                <BodyShort>{formatTidspunkt(props.notat.endret)}</BodyShort>
                            </div>
                            <div className={styles.metaBlock}>
                                <Label size="small">Opprettet</Label>
                                <BodyShort>{formatTidspunkt(props.notat.opprettet)}</BodyShort>
                            </div>
                        </>
                    )}
                    {props.statusElement}
                </HStack>
            </div>
        </div>
    );
};

export default NotatToolbar;
