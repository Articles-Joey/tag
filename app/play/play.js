"use client"
import dynamic from 'next/dynamic'

import useFullscreen from '@/hooks/useFullScreen';
import { useControllerStore } from '@/hooks/useControllerStore';
import LeftPanelContent from '@/components/UI/LeftPanel';
import SprintMeter from '@/components/UI/SprintMeter';
import { useStore } from '@/hooks/useStore';
import classNames from 'classnames';
import AudioHandler from '@/components/Handlers/AudioHandler';
import CameraZoomIndicator from '@/components/UI/CameraZoomIndicator';
import PeerLogicHandler from '@/components/Handlers/PeerLogicHandler';

import GameMenu from '@articles-media/articles-dev-box/GameMenu';
import TouchControls from '@/components/UI/TouchControls';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function TagGamePage() {

    // const { controllerState } = useControllerStore()

    const sceneKey = useStore(state => state.sceneKey);
    const sidebar = useStore(state => state.sidebar);
    const showMenu = useStore(state => state.showMenu);

    return (
        <div
            className={classNames(
                `${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`,
                {
                    'menu-open': showMenu,
                    'fullscreen': useFullscreen().isFullscreen,
                    'show-sidebar': sidebar,
                }
            )}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
        >

            <PeerLogicHandler />

            <AudioHandler />

            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                menuBarConfig={{
                    style: "Corner Button",
                    menuBarButtonPosition: "Left"
                }}
                sidebarConfig={{
                    style: "Static Panel",
                }}
            />

            <div className='canvas-wrap'>

                <SprintMeter />

                <CameraZoomIndicator />

                <TouchControls />

                <GameCanvas
                    key={sceneKey}
                />

            </div>

        </div>
    );
}