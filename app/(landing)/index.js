"use client"
import { useEffect, useContext, useState, Suspense } from 'react';

import Link from 'next/link'
import dynamic from 'next/dynamic'

import ArticlesButton from '@/components/UI/Button';
import { useStore } from '@/hooks/useStore';

import GameScoreboard from '@articles-media/articles-dev-box/GameScoreboard';
import Ad from '@articles-media/articles-dev-box/Ad';
const ReturnToLauncherButton = dynamic(() =>
    import('@articles-media/articles-dev-box/ReturnToLauncherButton'),
    { ssr: false }
);
import { GamepadKeyboard, PieMenu } from '@articles-media/articles-gamepad-helper';

import useUserDetails from '@articles-media/articles-dev-box/useUserDetails';
import useUserToken from '@articles-media/articles-dev-box/useUserToken';

const game_key = 'tag'
const game_name = 'Tag'

export default function TagGameLandingPage() {

    const darkMode = useStore((state) => state.darkMode);
    const toggleDarkMode = useStore((state) => state.toggleDarkMode);
    const nickname = useStore((state) => state.nickname);
    const setNickname = useStore((state) => state.setNickname);
    const setShowInfoModal = useStore((state) => state.setShowInfoModal);
    const setShowSettingsModal = useStore((state) => state.setShowSettingsModal);
    const setShowCreditsModal = useStore((state) => state.setShowCreditsModal);

    const [joinGame, setJoinGame] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {

        setIsMounted(true)

    }, [])

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate
    } = useUserToken(
        "3034"
    );

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate
    } = useUserDetails({
        token: userToken
    });

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

                    <div className="card card-articles mb-3" >

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
                                    setShowCreditsModal(true)
                                }}
                            >
                                <i className="fad fa-users"></i>
                                Credits
                            </ArticlesButton>

                        </div>

                    </div>

                    <ReturnToLauncherButton />

                </div>

                <GameScoreboard
                    game={game_name}
                    style="Default"
                    darkMode={darkMode ? true : false}
                />

                <Ad
                    style="Default"
                    section={"Games"}
                    section_id={game_name}
                    darkMode={darkMode ? true : false}
                    user_ad_token={userToken}
                    userDetails={userDetails}
                    userDetailsLoading={userDetailsLoading}
                />

            </div>

        </div>
    );
}