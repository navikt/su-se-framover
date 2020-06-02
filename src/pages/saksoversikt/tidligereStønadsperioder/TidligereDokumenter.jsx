import React, { useState } from 'react';
import { isJsonObject } from '../../../HelperFunctions';
import { getRandomSmiley } from '../../../hooks/getRandomEmoji';
import ModalWrapper from 'nav-frontend-modal';
import DisplayDataFromApplic from '../../../components/DisplayDataFromApplic';

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
        <div style={{ display: 'grid', gridTemplateColumns: ' 1fr 1fr', marginBottom: '1em' }}>
            <p>{dokument.navn}</p>
            <p onClick={() => openModal()}>{getRandomSmiley()}</p>
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
                            <img src={dokument.innhold} alt="info" />
                        )}
                    </div>
                </ModalWrapper>
            ) : (
                ''
            )}
        </div>
    );
};

const Saksnotat = ({ saksnotat }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const openModal = () => {
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: ' 1fr 1fr' }}>
            <p>saksnotater</p>
            <p onClick={() => openModal()}>{getRandomSmiley()}</p>
            {modalOpen ? (
                <ModalWrapper
                    isOpen={modalOpen}
                    onRequestClose={() => {
                        closeModal();
                    }}
                    contentLabel="saksModal"
                    ariaHideApp={false}
                    className="saksnotatModal"
                >
                    <div style={{ padding: '2rem 2.5rem' }}>
                        <p>{saksnotat}</p>
                    </div>
                </ModalWrapper>
            ) : (
                ''
            )}
        </div>
    );
};

const TidligereDokumentasjon = (dokumenterArray, saksnotater) => {
    return (
        <div style={{ display: 'flex' }}>
            {getRandomSmiley()}
            <div style={{ marginLeft: '1em', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '1em' }}>
                    <p style={{ fontWeight: 'bold' }}>Navn</p>
                    <p style={{ fontWeight: 'bold' }}>Se</p>
                </div>
                {dokumenterArray.map((dokument, idx) => (
                    <Dokument key={idx} dokument={dokument} />
                ))}
                <Saksnotat saksnotat={saksnotater} />
            </div>
        </div>
    );
};

export default TidligereDokumentasjon;
