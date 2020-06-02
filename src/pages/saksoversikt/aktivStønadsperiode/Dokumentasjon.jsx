import React, { useState } from 'react';
import ModalWrapper from 'nav-frontend-modal';
import DisplayDataFromApplic from '../../../components/DisplayDataFromApplic';
import { isJsonObject } from '../../../HelperFunctions';
import { viewIcon, StackedDocumentsIcon } from '../../../assets/Icons';
import { useSelector } from 'react-redux';
import { BoldP, FlexDiv, FlexColumnDiv } from './StyledComponents';

const Dokumentasjon = () => {
    const { saksoversiktReducer } = useSelector(state => state);
    const { saksoversikt } = saksoversiktReducer;

    const dokumenterState = saksoversikt.aktivStønadsperiode.dokumenter;

    const Dokument = ({ dokument }) => {
        const [modalOpen, setModalOpen] = useState(false);
        const openModal = () => {
            setModalOpen(true);
        };
        const closeModal = () => {
            setModalOpen(false);
        };

        //TODO: bruk less filen bedre
        const modalStyle = () => (isJsonObject(dokument.innhold) ? 'stønadsModal' : '');

        return (
            <div style={{ display: 'grid', gridTemplateColumns: ' 1fr 1fr', marginBottom: '0.5em' }}>
                <p>{dokument.navn}</p>
                <p>
                    <span onClick={() => openModal()}>{viewIcon()}</span>
                </p>
                {modalOpen ? (
                    <ModalWrapper
                        isOpen={modalOpen}
                        onRequestClose={() => {
                            closeModal();
                        }}
                        contentLabel="dokumentModal"
                        ariaHideApp={false}
                        className={modalStyle()}
                    >
                        <div style={{ padding: '2rem 2.5rem' }}>
                            {isJsonObject(dokument.innhold) ? (
                                <DisplayDataFromApplic state={dokument.innhold} />
                            ) : (
                                <img src={dokument.innhold} alt=":)" />
                            )}
                        </div>
                    </ModalWrapper>
                ) : (
                    ''
                )}
            </div>
        );
    };

    function renderDokumentasjon() {
        return (
            <FlexDiv>
                {StackedDocumentsIcon(24)}
                <div style={{ marginLeft: '1em', width: '100%' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '1em' }}>
                        <BoldP>Navn</BoldP>
                        <BoldP>Se</BoldP>
                    </div>
                    {dokumenterState.map(dokument => (
                        <Dokument key={dokument.navn} dokument={dokument} />
                    ))}
                </div>
            </FlexDiv>
        );
    }

    return (
        <FlexColumnDiv>
            <p style={{ marginBottom: '1em', fontSize: '20px', fontWeight: 'bold' }}>Dokumentasjon:</p>
            {renderDokumentasjon()}
        </FlexColumnDiv>
    );
};

export default Dokumentasjon;
