// A component for rendering a popup modal.
// Note: Each modal must have a unique domId prop. This id is used to link the modal to its trigger button.

// To toggle the modal programmatically, use the toggleModal() function from app/utilities/miscFunctions.tsx,
// passing in the modal's domId as the argument.

interface ModalProps {
    domId: string,
    title: string,
}
export default function Modal({ domId, title, children }: React.PropsWithChildren<ModalProps>) {
    return (<>
        <input className="modal-state" id={domId} type="checkbox" />
        <div className="modal">
            <label className="modal-overlay" htmlFor={domId}></label>
            <div className="modal-content flex flex-col w-full max-w-[375px] mx-6 p-0 bg-zinc-950 border-[1px] border-gray-3">
                <div className="flex w-full mt-1">
                    <div className="relative bottom-[2px] self-center text-xl font-light ml-4 mr-3 
                    overflow-x-hidden whitespace-nowrap text-ellipsis">
                        {title}
                    </div>
                    <label htmlFor={domId} className="btn btn-sm btn-circle btn-ghost text-lg ml-auto mr-1">✕</label>
                </div>
                <div className="divider mt-1 mb-0 mx-3 relative bottom-2"></div>
                {children}
            </div>
        </div>
    </>)
}