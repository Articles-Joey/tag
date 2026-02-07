import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import dynamic from 'next/dynamic'

// import { useSelector } from 'react-redux'

import { Modal } from "react-bootstrap"

import ViewUserModal from "@/components/UI/ViewUserModal"

// import BasicLoading from "@/components/loading/BasicLoading";

// import powerups from "app/(site)/community/games/four-frogs/components/powerups";

// import games from "../constants/games";
const games = []

import IsDev from "@/components/UI/IsDev";
import ArticlesButton from "./Button";

import B from "@articles-media/articles-gamepad-helper/dist/img/Xbox UI/B.svg";
import { useModalNavigation } from "@/hooks/useModalNavigation";

export default function GameInfoModal({
    show,
    setShow,
    credits
}) {

    const [showModal, setShowModal] = useState(true)

    // const [lightboxData, setLightboxData] = useState(null)

    // const userReduxState = useSelector((state) => state.auth.user_details);
    // const userReduxState = false

    // const [showVideo, setShowVideo] = useState()

    const elementsRef = useRef([]);
    useModalNavigation(elementsRef, () => setShowModal(false));

    return (
        <>
            {/* {lightboxData && (
                <Lightbox
                    mainSrc={lightboxData?.location}
                    onCloseRequest={() => setLightboxData(null)}
                    reactModalStyle={{
                        overlay: {
                            zIndex: '2000'
                        }
                    }}
                />
            )} */}

            <Modal
                className="articles-modal games-info-modal"
                size='md'
                show={showModal}
                centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Game Info</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column">

                    <div className="ratio ratio-16x9 mb-2">
                        <img
                            src={"/img/preview.webp"}
                        ></img>
                    </div>

                    <div>Multiplayer Peer-to-peer tag game built with React Three Fiber and Next.js. Run, hide, and tag your friends in a fun and dynamic 3D environment. Join the chase and see if you can avoid being 'it' in this fast-paced game of tag!</div>

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    <div></div>

                    <ArticlesButton variant="outline-dark" onClick={() => {
                        setShow(false)
                    }}>
                        <img src={B.src} className="me-1" alt="Close" />
                        Close
                    </ArticlesButton>

                </Modal.Footer>

            </Modal>
        </>
    )

}