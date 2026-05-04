"use client"
import dynamic from 'next/dynamic'

import useFullscreen from '@/hooks/useFullScreen';
import { useControllerStore } from '@/hooks/useControllerStore';
import LeftPanelContent from '@/components/UI/LeftPanel';
import SprintMeter from '@/components/UI/SprintMeter';
import { useStore } from '@/hooks/useStore';
import classNames from 'classnames';
import AudioHandler from '@/components/Game/AudioHandler';
import CameraZoomIndicator from '@/components/UI/CameraZoomIndicator';
import PeerLogicHandler from '@/components/PeerLogicHandler';

import GameMenu from '@articles-media/articles-dev-box/GameMenu';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function TagGamePage() {

    const { controllerState } = useControllerStore()

    const sceneKey = useStore(state => state.sceneKey);

    return (
        <div
            className={classNames(
                `${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`,
                {
                    'menu-open': useStore.getState().menuOpen,
                    'fullscreen': useFullscreen().isFullscreen,
                    'show-sidebar': useStore.getState().sidebar,
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

                <GameCanvas
                    key={sceneKey}
                />

            </div>

        </div>
    );
}