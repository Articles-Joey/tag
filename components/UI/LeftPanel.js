import Link from "next/link";

import { Dropdown, DropdownButton } from "react-bootstrap";

// import ROUTES from '@/components/constants/routes';
// import { useGameStore } from "../hooks/useGameStore";
import ArticlesButton from "@/components/UI/Button";

import ControllerPreview from "@/components/ControllerPreview";
import { useSocketStore } from "@/hooks/useSocketStore";
// import { useState } from "react";
import { useTagGameStore } from "@/hooks/useTagGameStore";
import { useStore } from "@/hooks/useStore";
import PeerDetails from "./PeerDetails";
import useFullscreen from "@/hooks/useFullScreen";
import { set } from "date-fns";
import TouchControlsPanel from "./TouchControlsPanel";

export default function LeftPanelContent(props) {

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const {
        kickPlayer,
        // server,
        // players,
        touchControlsEnabled,
        setTouchControlsEnabled,
        reloadScene,
        controllerState,
        // isFullscreen,
        // requestFullscreen,
        // exitFullscreen,
        // setShowMenu
    } = props;

    const setShowSettingsModal = useStore((state) => state.setShowSettingsModal);
    const setShowMenu = useStore(state => state.setShowMenu);
    const darkMode = useStore((state) => state.darkMode);
    const toggleDarkMode = useStore((state) => state.toggleDarkMode);

    const sidebar = useStore(state => state.sidebar);
    const toggleSidebar = useStore(state => state.toggleSidebar);

    const position = useTagGameStore(state => state.position);
    const tagCounter = useTagGameStore(state => state.tagCounter);
    const debug = useTagGameStore(state => state.debug);
    const setDebug = useTagGameStore(state => state.setDebug);

    // const [ playerLocation, setPlayerLocation ] = useState({
    //     x: 0,
    //     y: 0,
    //     z: 0
    // })

    // const {
    //     socket,
    // } = useSocketStore(state => ({
    //     socket: state.socket,
    // }));

    return (
        <div className='w-100' id="left-panel-content">

            <div className="card card-articles card-sm">

                <div className="card-body">

                    {/* <div className='flex-header'>
                        <div>Server: {server}</div>
                        <div>Players: {0}/4</div>
                    </div> */}

                    {/* {!socket?.connected &&
                        <div
                            className=""
                        >

                            <div className="">

                                <ArticlesButton
                                    className="w-100 mb-2"
                                    small
                                    onClick={() => {
                                        console.log("Reconnect")
                                        socket.connect()
                                    }}
                                >
                                    <i className="fad fa-link"></i>
                                    Reconnect!
                                </ArticlesButton>

                            </div>

                        </div>
                    } */}

                    <div className="d-flex flex-wrap">

                        <Link
                            href={'/'}
                            className="w-50"
                        >
                            <ArticlesButton
                                className='w-100'
                                small
                            >
                                <i className="fad fa-arrow-alt-square-left"></i>
                                <span>Leave Game</span>
                            </ArticlesButton>
                        </Link>

                        <ArticlesButton
                            small
                            className="w-50"
                            active={isFullscreen}
                            onClick={() => {
                                if (isFullscreen) {
                                    exitFullscreen()
                                } else {
                                    requestFullscreen('tag-game-page')
                                }
                            }}
                        >
                            {isFullscreen && <span>Exit </span>}
                            {!isFullscreen && <span><i className='fad fa-expand'></i></span>}
                            <span>Fullscreen</span>
                        </ArticlesButton>

                        <div
                            className="d-flex w-50"
                        >
                            <ArticlesButton
                                small
                                className="w-100"
                                onClick={() => {
                                    setShowSettingsModal(true)
                                }}
                            >
                                <i className="fad fa-cog"></i>
                                <span>Settings</span>
                            </ArticlesButton>
                            <ArticlesButton
                                small
                                className=""
                                active={darkMode}
                                onClick={() => {
                                    toggleDarkMode()
                                }}
                            >
                                <i className="fad fa-sun"></i>
                            </ArticlesButton>
                        </div>

                        <ArticlesButton
                            small
                            className="w-50"
                            active={sidebar}
                            onClick={() => {
                                toggleSidebar()
                                setShowMenu(false)
                            }}
                        >
                            <i className="fad fa-chevron-square-right"></i>
                            Sidebar
                        </ArticlesButton>
                    </div>

                </div>
            </div>

            <div
                className="card card-articles card-sm"
            >
                <div className="card-body d-flex justify-content-between">

                    <div className="w-100">
                        <div className="small text-muted">playerData</div>
                        <div className="small d-flex justify-content-between">
                            <div>X: {position[0].toFixed(2)}</div>
                            <div>Y: {position[1].toFixed(2)}</div>
                            <div>Z: {position[2].toFixed(2)}</div>
                            <div>Tags: {tagCounter || 0}</div>
                            {/* <div>Shift: {shift ? 'True' : 'False'}</div> */}
                            {/* <div>Score: 0</div> */}
                        </div>
                    </div>

                </div>
            </div>

            {/* Camera Controls */}
            {/* <div
                className="card card-articles card-sm"
            >
                <div className="card-body">

                    <div className="small text-muted">Camera Controls</div>

                    <div className='d-flex flex-column'>

                        <div>
                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                active={controlType == "Player"}
                            >
                                <i className="fad fa-redo"></i>
                                Player
                            </ArticlesButton>

                            <ArticlesButton
                                size="sm"
                                className="w-50"
                            >
                                <i className="fad fa-redo"></i>
                                Free Cam
                            </ArticlesButton>
                        </div>

                    </div>

                </div>
            </div> */}

            {/* Peer Details */}
            <PeerDetails kickPlayer={kickPlayer} />

            {/* Touch Controls */}
            <TouchControlsPanel />

            {/* Debug Controls */}
            <div
                className="card card-articles card-sm"
            >
                <div className="card-body">

                    <div className="small text-muted">Debug Controls</div>

                    <div className='d-flex flex-column'>

                        <div>

                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                onClick={reloadScene}
                            >
                                <i className="fad fa-redo"></i>
                                Reload Game
                            </ArticlesButton>

                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                onClick={reloadScene}
                            >
                                <i className="fad fa-redo"></i>
                                Reset Camera
                            </ArticlesButton>

                            <div className='w-50'>
                                <ArticlesButton
                                    size="sm"
                                    className="w-100"
                                    onClick={() => {
                                        setDebug(!debug)
                                        reloadScene()
                                    }}
                                >
                                    <i className="fad fa-bug"></i>
                                    Debug: {debug ? 'On' : 'Off'}
                                </ArticlesButton>
                                {/* <DropdownButton
                                variant="articles w-100"
                                size='sm'
                                id="dropdown-basic-button"
                                className="dropdown-articles"
                                title={
                                    <span>
                                        <i className="fad fa-bug"></i>
                                        <span>Debug </span>
                                        <span>{debug ? 'On' : 'Off'}</span>
                                    </span>
                                }
                            >

                                <div style={{ maxHeight: '600px', overflowY: 'auto', width: '200px' }}>

                                    {[
                                        false,
                                        true
                                    ]
                                        .map(location =>
                                            <Dropdown.Item
                                                key={location}
                                                onClick={() => {
                                                    setDebug(location)
                                                }}
                                                className="d-flex justify-content-between"
                                            >
                                                {location ? 'True' : 'False'}
                                            </Dropdown.Item>
                                        )}

                                </div>

                            </DropdownButton> */}
                            </div>

                        </div>

                    </div>

                </div>
            </div>

            {controllerState?.connected &&
                <div className="panel-content-group p-0 text-dark">

                    <div className="p-1 border-bottom border-dark">
                        <div className="fw-bold" style={{ fontSize: '0.7rem' }}>
                            {controllerState?.id}
                        </div>
                    </div>

                    <div className='p-1'>
                        <ArticlesButton
                            small
                            className="w-100"
                            active={showControllerState}
                            onClick={() => {
                                setShowControllerState(prev => !prev)
                            }}
                        >
                            {showControllerState ? 'Hide' : 'Show'} Controller Preview
                        </ArticlesButton>
                    </div>

                    {showControllerState && <div className='p-3'>

                        <ControllerPreview
                            controllerState={controllerState}
                            showJSON={true}
                            showVibrationControls={true}
                            maxHeight={300}
                            showPreview={true}
                        />
                    </div>}

                </div>
            }

        </div>
    )

}