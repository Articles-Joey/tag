"use client"
import { useEffect, useContext, useState } from 'react';

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// import { useSelector, useDispatch } from 'react-redux'

// import ROUTES from 'components/constants/routes'

// const Ad = dynamic(() => import('components/Ads/Ad'), {
//     ssr: false,
// });

import ArticlesButton from '@/components/UI/Button';
import { useStore } from '@/hooks/useStore';
// import SingleInput from '@/components/Articles/SingleInput';
// import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
// import IsDev from '@/components/UI/IsDev';
// import { useSocketStore } from '@/hooks/useSocketStore';
// import { useStore } from 'zustand';

// const InfoModal = dynamic(
//     () => import('@/components/UI/InfoModal'),
//     { ssr: false }
// )

// const SettingsModal = dynamic(
//     () => import('@/components/UI/SettingsModal'),
//     { ssr: false }
// )

// const PrivateGameModal = dynamic(
//     () => import('app/(site)/community/games/four-frogs/components/PrivateGameModal'),
//     { ssr: false }
// )

const game_key = 'tag'
const game_name = 'Tag'

export default function TagGameLandingPage() {

    // const {
    //     socket,
    // } = useSocketStore(state => ({
    //     socket: state.socket,
    // }));

    // const userReduxState = useSelector((state) => state.auth.user_details)
    // const userReduxState = false

    const darkMode = useStore((state) => state.darkMode);
    const toggleDarkMode = useStore((state) => state.toggleDarkMode);
    const nickname = useStore((state) => state.nickname);
    const setNickname = useStore((state) => state.setNickname);
    const showInfoModal = useStore((state) => state.showInfoModal);
    const setShowInfoModal = useStore((state) => state.setShowInfoModal);
    const showSettingsModal = useStore((state) => state.showSettingsModal);
    const setShowSettingsModal = useStore((state) => state.setShowSettingsModal);
    const showPrivateGameModal = useStore((state) => state.showPrivateGameModal);
    const setShowPrivateGameModal = useStore((state) => state.setShowPrivateGameModal);

    // const [nickname, setNickname] = useLocalStorageNew("game:nickname", userReduxState.display_name)

    // const [showInfoModal, setShowInfoModal] = useState(false)
    // const [showSettingsModal, setShowSettingsModal] = useState(false)
    // const [showPrivateGameModal, setShowPrivateGameModal] = useState(false)

    const [joinGame, setJoinGame] = useState(false)

    const [isMounted, setIsMounted] = useState(false)
    const [joinAttempted, setJoinAttempted] = useState(false)

    const [lobbyDetails, setLobbyDetails] = useState({
        players: [],
        games: [],
    })

    // useEffect(() => {

    //     if (socket) {
    //         socket.emit('join-room', 'four-frogs');
    //     }

    //     return () => {
    //         if (socket) {
    //             socket.emit('leave-room', 'four-frogs');
    //         }
    //     }

    // }, [socket]);

    useEffect(() => {

        setIsMounted(true)

        // setShowInfoModal(localStorage.getItem('game:four-frogs:rulesAnControls') === 'true' ? true : false)

        //  if (joinAttempted) {
        //     return
        // }

        // console.log("joinAttempted", joinAttempted)

        // setJoinAttempted(true)

        // socket.on('game:tag-landing-details', function (msg) {
        //     console.log('game:tag-landing-details', msg)

        //     // if (JSON.stringify(msg) !== JSON.stringify(lobbyDetails)) {
        //     setLobbyDetails(msg)
        //     // }
        // });

        // return () => {
        //     socket.off('game:tag-landing-details');
        // };

    }, [])

    // useEffect(() => {

    //     if (!isMounted) return

    //     console.log("isMounted")        

    // }, [isMounted])

    // useEffect(() => {

    //     localStorage.setItem('game:four-frogs:rulesAnControls', showInfoModal)

    // }, [showInfoModal])

    // useEffect(() => {

    //     if (!isMounted || joinAttempted) return

    //     console.log("TEST 123")

    //     if (socket.connected) {
    //         setJoinAttempted(true)
    //         socket.emit('join-room', 'game:tag-landing');
    //     }

    //     return function cleanup() {
    //         socket.emit('leave-room', 'game:tag-landing')
    //     };

    // }, [socket.connected, isMounted]);

    return (

        <div className="tag-lobby-page">

            {/* {showInfoModal &&
                <InfoModal
                    show={showInfoModal}
                    setShow={setShowInfoModal}
                />
            }

            {showSettingsModal &&
                <SettingsModal
                    show={showSettingsModal}
                    setShow={setShowSettingsModal}
                />
            }

            {showPrivateGameModal &&
                <PrivateGameModal
                    show={showPrivateGameModal}
                    setShow={setShowPrivateGameModal}
                />
            } */}

            <div className='background-wrap'>
                <img
                    src={
                        darkMode ?
                            `img/background-dark.webp`
                            :
                            `img/background.webp`
                    }
                    alt="Tag game background"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                    }}
                />
            </div>

            <div className="container d-flex flex-column-reverse flex-lg-row justify-content-center align-items-center">

                <div
                    style={{ "width": "20rem" }}
                >

                    <div className="game-name gloria-hallelujah-regular">
                        <div className='' id='left'>Tag!</div>
                        <div className='' id='right'>(You're It!)</div>
                    </div>

                    <div
                        className='hand d-flex justify-content-center'
                    >
                        <img
                            src={"/img/icon.png"}
                            alt="Tag game icon"
                            // width={100}
                            height={200}
                            style={{}}
                        />
                    </div>

                    <div className="card card-articles mb-3 mb-lg-0" >

                        <div className="card-header">

                            <div className="form-group articles mb-0">
                                <label htmlFor="nickname">Nickname</label>
                                {/* <SingleInput
                                    value={nickname}
                                    setValue={setNickname}
                                /> */}
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nickname"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                ></input>
                            </div>

                            <div style={{ fontSize: '0.8rem' }}>Visible to all players</div>

                        </div>

                        <div className="card-body">

                            {joinGame === false &&
                                <>
                                    <Link href={"/play"} className='w-100'>
                                        <ArticlesButton
                                            className="w-100 mb-3"
                                        >
                                            Start Game
                                        </ArticlesButton>
                                    </Link>

                                    <ArticlesButton
                                        className="w-100"
                                        onClick={() => {
                                            setJoinGame("")
                                        }}
                                    >
                                        Join Game
                                    </ArticlesButton>
                                </>
                            }

                            {joinGame !== false &&
                                <>
                                    <div className="form-group articles mb-0">
                                        <label htmlFor="nickname">Server ID</label>
                                        {/* <SingleInput
                                    value={nickname}
                                    setValue={setNickname}
                                /> */}
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="server-id"
                                            value={joinGame}
                                            onChange={(e) => setJoinGame(e.target.value)}
                                        ></input>
                                    </div>
                                    <div style={{ fontSize: '0.8rem' }}>Enter the 4 digit Server ID</div>

                                    <div className='d-flex justify-content-center mt-3'>
                                        <ArticlesButton
                                            className=""
                                            onClick={() => {
                                                setJoinGame(false)
                                            }}
                                        >
                                            <i className="fad fa-arrow-left"></i>
                                            Go Back
                                        </ArticlesButton>
                                        <Link href={{
                                            pathname: "/play",
                                            query: {
                                                server: joinGame
                                            }
                                        }}>
                                            <ArticlesButton
                                                className=""
                                                onClick={() => {
                                                    // setJoinGame("")
                                                }}
                                            >
                                                <i className="fad fa-play"></i>
                                                Join Game
                                            </ArticlesButton>
                                        </Link>
                                    </div>
                                </>
                            }

                        </div>

                        <div className="card-footer d-flex flex-wrap justify-content-center">

                            <div className='d-flex w-50'>
                                <ArticlesButton
                                    className={`w-100`}
                                    small
                                    onClick={() => {
                                        setShowSettingsModal(prev => !prev)
                                    }}
                                >
                                    <i className="fad fa-cog"></i>
                                    Settings
                                </ArticlesButton>
                                <ArticlesButton
                                    className={``}
                                    small
                                    onClick={() => {
                                        toggleDarkMode()
                                    }}
                                >
                                    <i className="fad fa-sun"></i>
                                </ArticlesButton>
                            </div>

                            <ArticlesButton
                                className={`w-50`}
                                small
                                onClick={() => {
                                    setShowInfoModal({
                                        game: game_name
                                    })
                                }}
                            >
                                <i className="fad fa-info-square"></i>
                                Rules & Controls
                            </ArticlesButton>

                            <Link
                                target='_blank'
                                href={'https://github.com/Articles-Joey/tag'}
                                className='w-50'
                            >
                                <ArticlesButton
                                    className={`w-100`}
                                    small
                                    onClick={() => {

                                    }}
                                >
                                    <i className="fab fa-github"></i>
                                    Github
                                </ArticlesButton>
                            </Link>

                            {/* <Link href={'/'} className='w-50'>
                                <ArticlesButton
                                    className={`w-100`}
                                    small
                                    onClick={() => {
    
                                    }}
                                >
                                    <i className="fad fa-sign-out fa-rotate-180"></i>
                                    Leave Game
                                </ArticlesButton>
                            </Link> */}

                            <ArticlesButton
                                className={`w-50`}
                                small
                                onClick={() => {
                                    setShowInfoModal({
                                        game: game_name
                                    })
                                }}
                            >
                                <i className="fad fa-users"></i>
                                Credits
                            </ArticlesButton>

                        </div>

                    </div>

                </div>

                {/* <Ad section={"Games"} section_id={game_name} /> */}

            </div>

        </div>
    );
}