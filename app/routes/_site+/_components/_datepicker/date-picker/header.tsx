import React, { useMemo } from "react";

import { Icon } from "~/components/Icon";

import { getMonthNameFromNumber } from "./methods";
import { MonthPicker } from "./month-picker";
import { YearPicker } from "./year-picker";

export type HeaderProps = {
   month: number;
   year: number;
   minDateValue: number;
   maxDateValue: number;
   nextMonth: () => void;
   prevMonth: () => void;
   onMonthChange: (_: string) => void;
   onYearChange: (_: number) => void;
   disabled: boolean;
};

export function Header({
   month,
   year,
   minDateValue,
   maxDateValue,
   nextMonth,
   prevMonth,
   onMonthChange,
   onYearChange,
   disabled,
}: HeaderProps) {
   const fromYear = useMemo(
      () => new Date(minDateValue).getFullYear(),
      [minDateValue],
   );
   const toYear = useMemo(
      () => new Date(maxDateValue).getFullYear(),
      [maxDateValue],
   );

   return (
      <div className="sdp--header">
         <button
            className="sdp--square-btn sdp--square-btn__shadowed sdp--square-btn__outlined"
            onClick={prevMonth}
            aria-label="Go to previous month"
            type="button"
            disabled={disabled}
         >
            <Icon name="chevron-left" size={16} />
         </button>
         <div className="sdp--header__main">
            <MonthPicker
               disabled={disabled}
               value={getMonthNameFromNumber(month)}
               onChange={onMonthChange}
            />
            <YearPicker
               disabled={disabled}
               fromYear={fromYear}
               toYear={toYear}
               onChange={onYearChange}
               value={year}
            />
         </div>
         <button
            className="sdp--square-btn sdp--square-btn__shadowed sdp--square-btn__outlined"
            onClick={nextMonth}
            aria-label="Go to next month"
            type="button"
            disabled={disabled}
         >
            <Icon name="chevron-right" size={16} />
         </button>
      </div>
   );
}
