import { useCallback, useEffect, useState } from "react"
import useTouchControlsStore from "@/hooks/useTouchControlsStore"

function actionByKey(key) {
	const keyActionMap = {
		KeyW: 'moveForward',
		KeyS: 'moveBackward',
		KeyA: 'moveLeft',
		KeyD: 'moveRight',
		Space: 'jump',
        ShiftLeft: 'shift',
        KeyC: 'crouch',
        KeyV: 'cameraView',
	}
	return keyActionMap[key]
}

export const useKeyboard = () => {
	const [actions, setActions] = useState({
		moveForward: false,
		moveBackward: false,
		moveLeft: false,
		moveRight: false,
		jump: false,
        shift: false,
        crouch: false,
        cameraView: false,
	})

	const touchControlsEnabled = useTouchControlsStore((state) => state.enabled)
	const touchControls = useTouchControlsStore((state) => state.touchControls)

	const handleKeyDown = useCallback((e) => {
		const action = actionByKey(e.code)
		if (action) {
			setActions((prev) => {
				return ({
					...prev,
					[action]: true
				})
			})
		}
	}, [])

	const handleKeyUp = useCallback((e) => {
		const action = actionByKey(e.code)
		if (action) {
			setActions((prev) => {
				return ({
					...prev,
					[action]: false
				})
			})
		}
	}, [])

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('keyup', handleKeyUp)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('keyup', handleKeyUp)
		}
	}, [handleKeyDown, handleKeyUp])

	if (!touchControlsEnabled) {
		return actions
	}

	return {
		...actions,
		moveForward: actions.moveForward || !!touchControls.up,
		moveBackward: actions.moveBackward || !!touchControls.down,
		moveLeft: actions.moveLeft || !!touchControls.left,
		moveRight: actions.moveRight || !!touchControls.right,
		jump: actions.jump || !!touchControls.jump,
		sprint: actions.sprint || !!touchControls.sprint,
		cameraView: actions.cameraView || !!touchControls.cameraView,
	}
}