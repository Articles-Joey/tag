"use client"
import { useEffect, useContext, useState, Suspense } from 'react';

import Link from 'next/link'
import dynamic from 'next/dynamic'

import ArticlesButton from '@/components/UI/Button';
import { useStore } from '@/hooks/useStore';

import PageTemplateLandingPage from '@articles-media/articles-dev-box/PageTemplateLandingPage';
import LandingBackgroundAnimation from '@/components/Game/LandingBackgroundAnimation';

import { GamepadKeyboard, PieMenu } from '@articles-media/articles-gamepad-helper';

import useUserDetails from '@articles-media/articles-dev-box/useUserDetails';
import useUserToken from '@articles-media/articles-dev-box/useUserToken';
import { usePeerStore } from '@/hooks/usePeerStore';
import { useSocketStore } from '@/hooks/useSocketStore';

export default function TagGameLandingPage() {

    const darkMode = useStore((state) => state.darkMode);
    const toggleDarkMode = useStore((state) => state.toggleDarkMode);

    const setShowSettingsModal = useStore((state) => state.setShowSettingsModal);
    const setShowCreditsModal = useStore((state) => state.setShowCreditsModal);
    const resetPeerStore = usePeerStore(state => state.reset);

    const [joinGame, setJoinGame] = useState(false)
    // const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        resetPeerStore();
        // setIsMounted(true)
    }, [resetPeerStore])

    return (

        <div className="tag-lobby-page">

            <Suspense>
                {/* <GamepadKeyboard
                    disableToggle={true}
                    active={nicknameKeyboard}
                    onFinish={(text) => {
                        console.log("FINISH KEYBOARD", text)
                        useStore.getState().setNickname(text);
                        useStore.getState().setNicknameKeyboard(false);
                    }}
                    onCancel={(text) => {
                        console.log("CANCEL KEYBOARD", text)
                        // useStore.getState().setNickname(text);
                        useStore.getState().setNicknameKeyboard(false);
                    }}
                /> */}
                <PieMenu
                    options={[
                        {
                            label: 'Settings',
                            icon: 'fad fa-cog',
                            callback: () => {
                                setShowSettingsModal(prev => !prev)
                            }
                        },
                        {
                            label: 'Go Back',
                            icon: 'fad fa-arrow-left',
                            callback: () => {
                                window.history.back()
                            }
                        },
                        {
                            label: 'Credits',
                            icon: 'fad fa-info-circle',
                            callback: () => {
                                setShowCreditsModal(true)
                            }
                        },
                        {
                            label: 'Game Launcher',
                            icon: 'fad fa-gamepad',
                            callback: () => {
                                window.location.href = 'https://games.articles.media';
                            }
                        },
                        {
                            label: `${darkMode ? "Light" : "Dark"} Mode`,
                            icon: 'fad fa-palette',
                            callback: () => {
                                toggleDarkMode()
                            }
                        }
                    ]}
                    onFinish={(event) => {
                        console.log("Event", event)
                        if (event.callback) {
                            event.callback()
                        }
                    }}
                />
            </Suspense>

            <PageTemplateLandingPage
                useSocketStore={useSocketStore}
                useStore={useStore}
                // RotatingMascot={RotatingMascot}
                Link={Link}
                logoImage={`img/icon.png`}
                LandingBackgroundAnimation={
                    <LandingBackgroundAnimation />
                }
                heroOverride={<>
                    <div className="game-name gloria-hallelujah-regular">
                        <div className='' id='left'>Tag!</div>
                        <div className='' id='right'>{`You're It!`}</div>
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
                </>}
                CardBodyOverride={<>

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

                </>}
                NicknameInputConfig={{
                    PreComponent:
                        <>
                            {/* <img
                                className='panel-bg me-2'
                                src="img/toontown_icon.webp"
                                width={70}
                                height={70}
                            /> */}
                        </>
                }}
                backgroundImage={
                    darkMode ?
                        // `img/preview-dark.webp`
                        `img/preview.webp`
                        :
                        `img/preview.webp`
                }
                singlePlayerConfig={{
                    attachServerType: "single-player",
                }}
                multiplayerConfig={{
                    type: "WebSocket",
                    comingSoon: true,
                    defaultServers: 2,
                    privateServerSupport: false,
                    onlinePlayersTemplate: "2.0",
                }}
            />

        </div>
    );
}