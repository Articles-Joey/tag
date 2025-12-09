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
// import SingleInput from '@/components/Articles/SingleInput';
import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
import IsDev from '@/components/UI/IsDev';
import { useSocketStore } from '@/hooks/useSocketStore';

const InfoModal = dynamic(
    () => import('@/components/UI/InfoModal'),
    { ssr: false }
)

const SettingsModal = dynamic(
    () => import('@/components/UI/SettingsModal'),
    { ssr: false }
)

// const PrivateGameModal = dynamic(
//     () => import('app/(site)/community/games/four-frogs/components/PrivateGameModal'),
//     { ssr: false }
// )

const game_key = 'tag'
const game_name = 'Tag'

export default function TagGameLandingPage() {

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    const [nickname, setNickname] = useLocalStorageNew("game:nickname", userReduxState.display_name)

    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [showPrivateGameModal, setShowPrivateGameModal] = useState(false)

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

        socket.on('game:tag-landing-details', function (msg) {
            console.log('game:tag-landing-details', msg)

            // if (JSON.stringify(msg) !== JSON.stringify(lobbyDetails)) {
            setLobbyDetails(msg)
            // }
        });

        return () => {
            socket.off('game:tag-landing-details');
        };

    }, [])

    // useEffect(() => {

    //     if (!isMounted) return

    //     console.log("isMounted")        

    // }, [isMounted])

    // useEffect(() => {

    //     localStorage.setItem('game:four-frogs:rulesAnControls', showInfoModal)

    // }, [showInfoModal])

    useEffect(() => {

        if (!isMounted || joinAttempted) return

        console.log("TEST 123")

        if (socket.connected) {
            setJoinAttempted(true)
            socket.emit('join-room', 'game:tag-landing');
        }

        return function cleanup() {
            socket.emit('leave-room', 'game:tag-landing')
        };

    }, [socket.connected, isMounted]);

    return (

        <div className="tag-lobby-page">

            {showInfoModal &&
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
            }

            <div className='background-wrap'>
                <Image
                    src={`${process.env.NEXT_PUBLIC_CDN}games/Tag/background.jpg`}
                    alt=""
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                />
            </div>

            <div className="container d-flex flex-column-reverse flex-lg-row justify-content-center align-items-center">

                <div className="card card-articles mb-3 mb-lg-0" style={{ "width": "20rem" }}>

                    {/* <div style={{ position: 'relative', height: '200px' }}>
                        <Image
                            src={Logo}
                            alt=""
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div> */}

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

                        <div className="fw-bold mb-1 small text-center">
                            {lobbyDetails.players.length || 0} player{lobbyDetails.players.length > 1 && 's'} in the lobby.
                        </div>

                        {/* <div className='small fw-bold'>Public Servers</div> */}

                        <div className="servers">

                            {[1, 2, 3, 4].map(id => {

                                let lobbyLookup = lobbyDetails?.fourFrogsGlobalState?.games?.find(lobby =>
                                    parseInt(lobby.server_id) == id
                                )

                                return (
                                    <div key={id} className="server">

                                        <div className='d-flex justify-content-between align-items-center w-100 mb-2'>
                                            <div className="mb-0" style={{ fontSize: '0.9rem' }}><b>Server {id}</b></div>
                                            <div className='mb-0'>{lobbyLookup?.players?.length || 0}/4</div>
                                        </div>

                                        <div className='d-flex justify-content-around w-100 mb-1'>
                                            {[1, 2, 3, 4].map(player_count => {

                                                let playerLookup = false

                                                if (lobbyLookup?.players?.length >= player_count) playerLookup = true

                                                return (
                                                    <div key={player_count} className="icon" style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        ...(playerLookup ? {
                                                            backgroundColor: 'black',
                                                        } : {
                                                            backgroundColor: 'gray',
                                                        }),
                                                        border: '1px solid black'
                                                    }}>

                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <Link
                                            className={``}
                                            href={{
                                                pathname: `/play`,
                                                query: {
                                                    server: id
                                                }
                                            }}
                                        >
                                            <ArticlesButton
                                                small
                                                className="px-5"
                                            >
                                                Join
                                            </ArticlesButton>
                                        </Link>

                                    </div>
                                )
                            })}

                        </div>

                        <div className='small fw-bold  mt-3 mb-1'>Or</div>

                        {/* <div className='d-flex'>

                            <ArticlesButton
                                className={`w-50`}
                                onClick={() => {
                                    // TODO
                                    alert("Coming Soon!")
                                }}
                            >
                                <i className="fad fa-robot"></i>
                                Practice
                            </ArticlesButton>

                            <ArticlesButton
                                className={`w-50`}
                                onClick={() => {
                                    setShowPrivateGameModal(prev => !prev)
                                }}
                            >
                                <i className="fad fa-lock"></i>
                                Private Game
                            </ArticlesButton>

                        </div> */}

                        <IsDev className={'mt-3'}>
                            <div>
                                <ArticlesButton
                                    className="w-50"
                                    variant='warning'
                                    onClick={() => {
                                        socket.emit('game:four-frogs:reset', '');
                                    }}
                                >
                                    Reset Server
                                </ArticlesButton>
                            </div>
                        </IsDev>

                    </div>

                    <div className="card-footer d-flex flex-wrap justify-content-center">

                        <ArticlesButton
                            className={`w-50`}
                            small
                            onClick={() => {
                                setShowSettingsModal(prev => !prev)
                            }}
                        >
                            <i className="fad fa-cog"></i>
                            Settings
                        </ArticlesButton>

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

                {/* <Ad section={"Games"} section_id={game_name} /> */}

            </div>

        </div>
    );
}