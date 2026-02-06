import { useTagGameStore } from "@/hooks/useTagGameStore"

export default function SprintMeter() {
    const sprintEnergy = useTagGameStore(state => state.sprintEnergy)

    // Calculate percentage (0 to 100)
    // Energy is 0 to 5.
    const percentage = (sprintEnergy / 5) * 100

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '20px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            border: '2px solid white',
            borderRadius: '10px',
            overflow: 'hidden',
             pointerEvents: 'none', // Allow clicking through
             zIndex: 100 // Ensure visibility
        }}>
            <div style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: percentage < 20 ? 'red' : 'cyan', // Optional: change color when low
                transition: 'width 0.1s linear' // Smooth out the updates slightly
            }} />
        </div>
    )
}
