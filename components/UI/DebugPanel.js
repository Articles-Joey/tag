import { useStore } from "@/hooks/useStore";
import ArticlesButton from "./Button";

export default function DebugPanel() {

    const debug = useStore((state) => state.debug);
    const setDebug = useStore((state) => state.setDebug);
    const reloadScene = useStore(state => state.reloadScene);

    return (
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
                            onClick={() => reloadScene()}
                        >
                            <i className="fad fa-redo"></i>
                            Reload Game
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => reloadScene()}
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
    )
}