// A component for rendering a popup modal.
// Note: Each modal must have a unique domId prop. This id is used to link the modal to its trigger button.

// To toggle the modal programmatically, use the toggleModal() function from app/utilities/miscFunctions.tsx,
// passing in the modal's domId as the argument.

interface ModalProps {
    domId: string,
    title?: string,
    maxWidth?: string,
    margin?: string,
    darkOverlay?: boolean,
}
export default function Modal({ domId, title = "", maxWidth, margin, darkOverlay, children }: React.PropsWithChildren<ModalProps>) {

    const modalMaxWidth: string = maxWidth ? maxWidth : '375px';
    const modalMargin: string = margin ? margin : '24px';

    return (<>
        <input className="modal-state" id={domId} type="checkbox" />
        <div className="modal" style={{paddingLeft: modalMargin, paddingRight: modalMargin}}>
            <label className={`modal-overlay ${darkOverlay ? "bg-black/70" : ""}`} htmlFor={domId}></label>
            <div className="modal-content flex flex-col w-full p-0 bg-zinc-950 border-[1px] border-gray-3"
            style={{maxWidth: modalMaxWidth}}>
                <div className="flex w-full mt-1">
                    {title !== "" &&
                        <div className="self-center text-xl font-light ml-4 mr-3 
                        overflow-x-hidden whitespace-nowrap text-ellipsis">
                            {title}
                        </div>
                    }
                    <label htmlFor={domId} className="btn btn-sm btn-circle btn-ghost text-lg ml-auto mr-1">✕</label>
                </div>
                {title !== ""
                    ? (<>
                        <div className="divider mt-1 mb-0 mx-3 relative bottom-2" />
                        {children}
                    </>)
                    : (<>
                        <div className="mt-[-12px] w-full" />
                        {children}
                    </>)
                }
            </div>
        </div>
    </>)
}