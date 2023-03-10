import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "@remix-run/react";
import { Fragment } from "react";

//A modal generic wrapper, pass in show and onClose to control the modal state, otherwise use it as a route modal
export function Modal({
   show = true,
   onClose,
   children,
}: {
   show?: boolean;
   onClose?: () => void;
   children?: React.ReactNode;
}) {
   const navigate = useNavigate();

   return (
      <Transition appear show={show} as={Fragment}>
         <Dialog
            onClose={onClose ?? (() => navigate(-1))}
            as="div"
            className="relative z-50"
         >
            <div className="h-full w-full">
               <Transition.Child
                  //backdrop transition
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
               >
                  <div
                     className="fixed inset-0 bg-slate-600/70 dark:bg-black/70"
                     aria-hidden="true"
                  />
               </Transition.Child>
               <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center">
                     <Transition.Child
                        //modal transition
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                     >
                        {/* Container to center the panel */}
                        {/* The actual dialog panel  */}
                        <Dialog.Panel>{children}</Dialog.Panel>
                     </Transition.Child>
                  </div>
               </div>
            </div>
         </Dialog>
      </Transition>
   );
}
