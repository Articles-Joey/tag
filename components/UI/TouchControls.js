import { memo, useEffect, useRef, useState } from "react";

import ArticlesButton from "@/components/UI/Button";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import { useStore } from "@/hooks/useStore";

function TouchControlsBase() {

    const touchControlsEnabled = useTouchControlsStore((state) => state.enabled);
    const touchControls = useTouchControlsStore((state) => state.touchControls);
    const setTouchControls = useTouchControlsStore((state) => state.setTouchControls);

    const debug = useStore((state) => state.debug);
    const sidebar = useStore((state) => state.sidebar);

    const [isMountReady, setIsMountReady] = useState(false);

    const containerRef = useRef(null);
    const managerRef = useRef(null);
    const activeNipples = useRef(new Map()); // Map identifier -> 'move' | 'look'

    useEffect(() => {
        if (!touchControlsEnabled) {
            setIsMountReady(false);
            setTouchControls((prev) => ({
                ...prev,
                left: false,
                right: false,
                up: false,
                down: false,
                moveX: 0,
                moveY: 0,
                lookX: 0,
                lookY: 0,
                jump: false,
                cameraView: false,
            }));
            return;
        }

        const timerId = window.setTimeout(() => {
            setIsMountReady(true);
        }, 1000);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [touchControlsEnabled, setTouchControls, setIsMountReady]);

    useEffect(() => {
        if (!touchControlsEnabled || !isMountReady) {
            return;
        }

        if (!containerRef.current) {
            return;
        }

        const nipplejs = require("nipplejs");

        const manager = nipplejs.create({
            zone: containerRef.current,
            mode: "dynamic",
            multitouch: true,
            maxNumberOfNipples: 2,
            threshold: 0.1,
            color: "white",
            size: 110,
            fadeTime: 120,
        });

        managerRef.current = manager;

        manager.on("start", (evt, nipple) => {
            const touchX = nipple.position.x;
            const width = containerRef.current.offsetWidth;
            const side = touchX < width / 2 ? "move" : "look";

            activeNipples.current.set(nipple.identifier, side);

            if (side === "look") {
                setTouchControls((prev) => ({ ...prev, lookX: 0, lookY: 0 }));
            }
        });

        manager.on("move", (evt, nipple) => {
            const side = activeNipples.current.get(nipple.identifier);
            if (!side) return;

            const data = nipple.force > 0 ? nipple : null;
            if (!data || !data.vector) return;

            if (side === "move") {
                const moveX = Math.max(-1, Math.min(1, data.vector.x || 0));
                const moveY = Math.max(-1, Math.min(1, data.vector.y || 0));
                const threshold = 0.25;

                setTouchControls((prev) => ({
                    ...prev,
                    moveX,
                    moveY,
                    left: moveX < -threshold,
                    right: moveX > threshold,
                    up: moveY > threshold,
                    down: moveY < -threshold,
                }));
            } else {
                const lookX = Math.max(-1, Math.min(1, data.vector.x || 0));
                const lookY = Math.max(-1, Math.min(1, data.vector.y || 0));

                setTouchControls((prev) => ({
                    ...prev,
                    lookX,
                    lookY,
                }));
            }
        });

        const handleEnd = (evt, nipple) => {
            const side = activeNipples.current.get(nipple.identifier);
            if (!side) return;

            if (side === "move") {
                setTouchControls((prev) => ({
                    ...prev,
                    left: false,
                    right: false,
                    up: false,
                    down: false,
                    moveX: 0,
                    moveY: 0,
                }));
            } else {
                setTouchControls((prev) => ({
                    ...prev,
                    lookX: 0,
                    lookY: 0,
                }));
            }
            activeNipples.current.delete(nipple.identifier);
        };

        manager.on("end", handleEnd);
        manager.on("hidden", handleEnd);
        manager.on("removed", handleEnd);

        return () => {
            manager.destroy();
            managerRef.current = null;
            activeNipples.current.clear();
            setTouchControls((prev) => ({
                ...prev,
                left: false,
                right: false,
                up: false,
                down: false,
                moveX: 0,
                moveY: 0,
                lookX: 0,
                lookY: 0,
            }));
        };
    }, [touchControlsEnabled, isMountReady, sidebar, setTouchControls]);

    const handleJumpStart = () => {
        setTouchControls((prev) => ({
            ...prev,
            jump: true,
        }));
    };

    const handleJumpEnd = () => {
        setTouchControls((prev) => ({
            ...prev,
            jump: false,
        }));
    };

    const handleCameraToggle = () => {
        setTouchControls((prev) => ({
            ...prev,
            cameraView: true,
        }));

        window.setTimeout(() => {
            useTouchControlsStore.getState().setTouchControls((prev) => ({
                ...prev,
                cameraView: false,
            }));
        }, 80);
    };

    const handleSprintToggle = () => {
        setTouchControls((prev) => ({
            ...prev,
            sprint: !prev.sprint,
        }));
    }

    if (!touchControlsEnabled || !isMountReady) {
        return null;
    }

    return (
        <div className="touch-controls-area">
            <div className="touch-zones" ref={containerRef}>
                <div className="touch-zone touch-zone-move">
                    <div className="touch-zone-label">MOVE</div>
                </div>
                <div className="touch-zone touch-zone-look">
                    <div className="touch-zone-label">LOOK</div>
                </div>
            </div>

            <div className="touch-floating-actions">

                <ArticlesButton
                    className="touch-action-btn touch-action-btn-sprint"
                    onClick={handleSprintToggle}
                >
                    Sprint
                </ArticlesButton>

                <ArticlesButton
                    className="touch-action-btn touch-action-btn-jump"
                    onMouseDown={handleJumpStart}
                    onMouseUp={handleJumpEnd}
                    onMouseLeave={handleJumpEnd}
                    onTouchStart={handleJumpStart}
                    onTouchEnd={handleJumpEnd}
                >
                    Jump
                </ArticlesButton>

                <ArticlesButton
                    className="touch-action-btn touch-action-btn-camera"
                    onClick={handleCameraToggle}
                >
                    Camera
                </ArticlesButton>

            </div>

            {debug &&
                <div className="touch-debug d-none d-lg-block">
                    {JSON.stringify(touchControls)}
                </div>
            }

        </div>
    );
}

const TouchControls = memo(TouchControlsBase);

export default TouchControls;
