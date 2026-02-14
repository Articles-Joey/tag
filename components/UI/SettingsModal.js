import { useEffect, useRef, useState } from "react";

import { Modal, Form } from "react-bootstrap"

import ArticlesButton from "@/components/UI/Button";
import { useStore } from "@/hooks/useStore";

import B from "@articles-media/articles-gamepad-helper/dist/img/Xbox UI/B.svg";
import { useModalNavigation } from "@/hooks/useModalNavigation";
// import { Article } from "@mui/icons-material";
// import { useControllerStatus } from "@articles-media/articles-gamepad-helper";

export default function SettingsModal({
    show,
    setShow,
}) {

    const audioSettings = useStore((state) => state?.audioSettings);
    const setAudioSettings = useStore((state) => state?.setAudioSettings);

    const [showModal, setShowModal] = useState(true)

    const [lightboxData, setLightboxData] = useState(null)

    const [tab, setTab] = useState('Graphics')

    const graphicsQuality = useStore((state) => state.graphicsQuality);
    const setGraphicsQuality = useStore((state) => state.setGraphicsQuality);

    const darkMode = useStore((state) => state.darkMode);
    const setDarkMode = useStore((state) => state.setDarkMode);

    const elementsRef = useRef([]);
    useModalNavigation(elementsRef, () => setShowModal(false));

    // const isGamepadConnected = useControllerStatus();

    // const [isGamepadConnected, setIsGamepadConnected] = useState(false);

    // useEffect(() => {
    //     const updateGamepadStatus = () => {
    //         const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    //         const connected = Array.from(gamepads).some(gp => gp !== null);
    //         console.log("Gamepad status:", connected);
    //         setIsGamepadConnected(connected);
    //     };

    //     // window.ongamepaddisconnected = (event) => {
    //     //     console.log("Lost connection with the gamepad.");
    //     //     console.log("Gamepad object:", event.gamepad);
    //     //     // Update game state as needed
    //     // };

    //     window.addEventListener("gamepadconnected", updateGamepadStatus);
    //     window.addEventListener("gamepaddisconnected", updateGamepadStatus);
    //     updateGamepadStatus();

    //     return () => {
    //         window.removeEventListener("gamepadconnected", updateGamepadStatus);
    //         window.removeEventListener("gamepaddisconnected", updateGamepadStatus);
    //     }
    // }, []);

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
                className="articles-modal"
                size='md'
                show={showModal}
                // To much jumping with little content for now
                // centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Game Settings</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column p-0">

                    <div className='p-2'>
                        {[
                            'Graphics',
                            'Controls',
                            'Audio',
                            'Chat'
                        ].map(item =>
                            <ArticlesButton
                                key={item}
                                active={tab == item}
                                onClick={() => { setTab(item) }}
                            >
                                {item}
                            </ArticlesButton>
                        )}
                    </div>

                    <hr className="my-0" />

                    <div className="p-2">

                        {tab == 'Graphics' &&
                            <div>

                                <div className="mb-2">
                                    <div>Graphics Quality:</div>
                                    <div>
                                        {['Low', 'Medium', 'High'].map(level =>
                                            <ArticlesButton
                                                key={level}
                                                className=""
                                                active={graphicsQuality == level}
                                                onClick={() => {
                                                    setGraphicsQuality(level)
                                                }}
                                            >
                                                {level}
                                            </ArticlesButton>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <div>Dark Mode:</div>
                                    <div>
                                        {[false, true].map(level =>
                                            <ArticlesButton
                                                key={level}
                                                className=""
                                                active={darkMode == level}
                                                onClick={() => {
                                                    setDarkMode(level)
                                                }}
                                            >
                                                <span
                                                    style={{ textTransform: 'capitalize' }}
                                                >
                                                    {level.toString()}
                                                </span>
                                            </ArticlesButton>
                                        )}
                                    </div>
                                </div>

                            </div>
                        }

                        {tab == 'Controls' &&
                            <div>
                                {[
                                    {
                                        action: 'Move Up',
                                        defaultKeyboardKey: 'W',
                                        defaultControllerKey: 'Left Stick Up',
                                    },
                                    {
                                        action: 'Move Down',
                                        defaultKeyboardKey: 'S',
                                        defaultControllerKey: 'Left Stick Down',
                                    },
                                    {
                                        action: 'Move Left',
                                        defaultKeyboardKey: 'A',
                                        defaultControllerKey: 'Left Stick Left',
                                    },
                                    {
                                        action: 'Move Right',
                                        defaultKeyboardKey: 'D',
                                        defaultControllerKey: 'Left Stick Right',
                                    },
                                    {
                                        action: 'Look Around',
                                        defaultKeyboardKey: 'Mouse Move',
                                        defaultControllerKey: 'Right Stick',
                                        disableChange: true,
                                    },
                                    {
                                        action: 'Sprint',
                                        defaultKeyboardKey: 'Shift',
                                        defaultControllerKey: 'RT',
                                    },
                                    {
                                        action: 'Jump',
                                        defaultKeyboardKey: 'Space',
                                        defaultControllerKey: 'A',
                                    },
                                    {
                                        action: 'Camera Control Toggle',
                                        defaultKeyboardKey: 'V',
                                        defaultControllerKey: 'Y',
                                    },
                                ].map(obj =>
                                    <div key={obj.action}>
                                        <div className="flex-header border-bottom pb-1 mb-1">

                                            <div>
                                                <div>{obj.action}</div>
                                                {obj.emote && <div className="span badge bg-dark">Emote</div>}
                                            </div>

                                            <div>

                                                <div className="badge badge-hover bg-dark border me-1">{obj.defaultKeyboardKey}</div>

                                                {/* {isGamepadConnected && obj.defaultControllerKey && */}
                                                    <div className="controller-only badge badge-hover bg-primary border me-1">{obj.defaultControllerKey}</div>
                                                {/* } */}

                                                <ArticlesButton
                                                    className=""
                                                    small
                                                    disabled={obj.disableChange}
                                                >
                                                    Change Key
                                                </ArticlesButton>

                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        }
                        {tab == 'Audio' &&
                            <>

                                <div className="mb-3">
                                    <ArticlesButton
                                        active={!audioSettings?.enabled}
                                        onClick={() => {
                                            setAudioSettings({
                                                ...audioSettings,
                                                enabled: false,
                                            })
                                        }}
                                    >
                                        Off
                                    </ArticlesButton>
                                    <ArticlesButton
                                        active={audioSettings?.enabled}
                                        onClick={() => {
                                            setAudioSettings({
                                                ...audioSettings,
                                                enabled: true,
                                            })
                                        }}
                                    >
                                        On
                                    </ArticlesButton>
                                </div>

                                <Form.Label className="mb-0">Game Volume - {audioSettings?.soundEffectsVolume}</Form.Label>
                                <Form.Range
                                    value={audioSettings?.soundEffectsVolume}
                                    onChange={(e) => setAudioSettings({
                                        ...audioSettings,
                                        soundEffectsVolume: Number(e.target.value),
                                    })}
                                />
                                <Form.Label className="mb-0">Music Volume - {audioSettings?.backgroundMusicVolume}</Form.Label>
                                <Form.Range
                                    value={audioSettings?.backgroundMusicVolume}
                                    onChange={(e) => setAudioSettings({
                                        ...audioSettings,
                                        backgroundMusicVolume: Number(e.target.value),
                                    })}
                                />
                            </>
                        }
                        {tab == 'Chat' &&
                            <>
                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label="Game chat panel"
                                />
                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label="Censor chat"
                                />
                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label="Game chat speech bubbles"
                                />
                            </>
                        }
                    </div>

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    <ArticlesButton
                        variant="outline-danger"
                        onClick={() => {
                            setShow(false)
                        }}
                    >
                        Reset
                    </ArticlesButton>

                    <ArticlesButton
                        variant="outline-dark"
                        onClick={() => {
                            setShow(false)
                        }}
                    >
                        <img src={B.src} className="controller-only me-1" alt="Close" />
                        Close
                    </ArticlesButton>

                </Modal.Footer>

            </Modal>
        </>
    )

}