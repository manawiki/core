import { useEffect, useState } from "react";

import dt from "date-and-time";
import reactTimerHook from "react-timer-hook";
import { useReadOnly } from "slate-react";

import { convertTimeToDate } from "~/components/datepicker/util";

import type { EventItemElement } from "../../core/types";

const { useTimer } = reactTimerHook;

export function CountdownTimer({ element }: { element: EventItemElement }) {
   const today = new Date();
   const readOnly = useReadOnly();

   const { startTime, endTime, startDate, endDate } = element;

   const hasStartFields = startTime && startDate;
   const hasEndFields = endTime && endDate;

   const hasAllFields = hasStartFields && hasEndFields;

   //Combine date with time field
   const displayStartDate =
      hasStartFields && convertTimeToDate(startTime, startDate);

   const displayEndDate = hasEndFields && convertTimeToDate(endTime, endDate);

   const isActiveEvent = displayStartDate && today >= displayStartDate;
   const isEventComplete = displayEndDate && today >= displayEndDate;

   //If the event is active, show countdown before event ends, otherwise show countdown before event starts
   const expirationDate = isActiveEvent ? displayEndDate : displayStartDate;

   const [expiryTime, setExpiryTimestamp] = useState(expirationDate);

   const { minutes, hours, days, seconds, restart } = useTimer({
      expiryTimestamp: expiryTime ?? new Date(),
   });

   useEffect(() => {
      if (expirationDate) {
         setExpiryTimestamp(expirationDate);
         restart(expirationDate);
      }
   }, [element]);

   const label = isActiveEvent ? "Ends In" : "Starts In";

   return (
      <div className="flex items-center gap-4 pr-1">
         {hasAllFields && !isEventComplete && (
            <>
               <section>
                  <div className="text-right text-[10px] font-bold text-zinc-500 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-300 dark:decoration-zinc-600">
                     {label}
                  </div>
                  <div className="flex items-center justify-end">
                     <div className="text-1 flex items-center gap-2 text-xs font-bold">
                        {days ? (
                           <div className="flex items-center gap-0.5">
                              <span>{days}</span>
                              <span className="font-semibold text-zinc-400 dark:text-zinc-500">
                                 d
                              </span>
                           </div>
                        ) : null}
                        {hours ? (
                           <div className="flex items-center gap-0.5">
                              <span>{hours}</span>
                              <span className="font-semibold text-zinc-400 dark:text-zinc-500">
                                 h
                              </span>
                           </div>
                        ) : null}
                        {minutes ? (
                           <div className="flex items-center gap-0.5">
                              <span>{minutes}</span>
                              <span className="font-semibold text-zinc-400 dark:text-zinc-500">
                                 m
                              </span>
                           </div>
                        ) : null}
                        {seconds ? (
                           <div className="flex items-center gap-0.5">
                              <span>{seconds}</span>
                              <span className="font-semibold text-zinc-400 dark:text-zinc-500">
                                 s
                              </span>
                           </div>
                        ) : null}
                     </div>
                  </div>
               </section>
               {displayEndDate && !isActiveEvent && !readOnly && (
                  <section>
                     <div className="text-right text-[10px] font-bold text-zinc-500 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-300 dark:decoration-zinc-600">
                        Ends On
                     </div>
                     <div className="flex items-center justify-end">
                        <time
                           className="text-1 flex items-center gap-2 text-xs font-semibold"
                           dateTime={`${displayEndDate}`}
                        >
                           {dt.format(displayEndDate, "MMM D, hh:mm A")}
                        </time>
                     </div>
                  </section>
               )}
            </>
         )}
         {hasAllFields && isEventComplete && (
            <div className="text-1 text-xs">Event Ended</div>
         )}
      </div>
   );
}
