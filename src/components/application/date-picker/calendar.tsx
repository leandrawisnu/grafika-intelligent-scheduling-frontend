"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { Fragment, useState } from "react";
import { today } from "@internationalized/date";
import { APP_TIMEZONE } from "@/lib/timezone";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { useDateFormatter } from "react-aria";
import type { CalendarState } from "react-stately";
import type { CalendarProps as AriaCalendarProps, DateValue } from "react-aria-components";
import {
    Calendar as AriaCalendar,
    CalendarContext as AriaCalendarContext,
    CalendarGrid as AriaCalendarGrid,
    CalendarGridBody as AriaCalendarGridBody,
    CalendarGridHeader as AriaCalendarGridHeader,
    CalendarHeaderCell as AriaCalendarHeaderCell,
    CalendarMonthPicker as AriaCalendarMonthPicker,
    CalendarYearPicker as AriaCalendarYearPicker,
    useSlottedContext,
} from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { InputDateBase } from "@/components/base/input/input-date";
import { cn } from "@/lib/utils";
import { cx } from "@/lib/utils/cx";
import { CalendarCell } from "./cell";

type CalendarJumpView = "days" | "years" | "months";

function CalendarPickerChip({
    selected,
    onClick,
    children,
}: {
    selected?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "rounded-lg px-2 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                selected
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-foreground hover:bg-muted",
            )}
        >
            {children}
        </button>
    );
}

function CalendarBody({
    state,
    highlightedDates,
    children,
    showQuickControls = true,
}: {
    state: CalendarState;
    highlightedDates?: DateValue[];
    children?: ReactNode;
    showQuickControls?: boolean;
}) {
    const [jumpView, setJumpView] = useState<CalendarJumpView>("days");

    const monthYearFormatter = useDateFormatter({
        month: "long",
        year: "numeric",
        calendar: state.focusedDate.calendar.identifier,
        timeZone: state.timeZone,
    });

    const title = monthYearFormatter.format(state.focusedDate.toDate(state.timeZone));

    const shiftYears = (delta: number) => {
        state.setFocusedDate(state.focusedDate.add({ years: delta }));
    };

    return (
        <>
            <header className="flex items-center justify-between gap-2">
                {jumpView === "days" ? (
                    <>
                        <Button slot="previous" iconLeading={ChevronLeft} size="sm" color="tertiary" className="size-8 shrink-0" />
                        <button
                            type="button"
                            onClick={() => setJumpView("years")}
                            className="min-w-0 flex-1 rounded-md px-2 py-1.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                            aria-label={`${title}. Klik untuk lompat tahun atau bulan.`}
                        >
                            <span className="truncate">{title}</span>
                        </button>
                        <Button slot="next" iconLeading={ChevronRight} size="sm" color="tertiary" className="size-8 shrink-0" />
                    </>
                ) : jumpView === "years" ? (
                    <>
                        <Button
                            slot={null}
                            iconLeading={ChevronLeft}
                            size="sm"
                            color="tertiary"
                            className="size-8 shrink-0"
                            aria-label="Tahun sebelumnya"
                            onClick={() => shiftYears(-12)}
                        />
                        <p className="flex-1 text-center text-sm font-semibold text-foreground">Pilih tahun</p>
                        <Button
                            slot={null}
                            iconLeading={ChevronRight}
                            size="sm"
                            color="tertiary"
                            className="size-8 shrink-0"
                            aria-label="Tahun berikutnya"
                            onClick={() => shiftYears(12)}
                        />
                    </>
                ) : (
                    <>
                        <Button
                            slot={null}
                            iconLeading={ChevronLeft}
                            size="sm"
                            color="tertiary"
                            className="size-8 shrink-0"
                            aria-label="Kembali pilih tahun"
                            onClick={() => setJumpView("years")}
                        />
                        <button
                            type="button"
                            onClick={() => setJumpView("years")}
                            className="min-w-0 flex-1 rounded-md px-2 py-1.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                            {state.focusedDate.year}
                        </button>
                        <div className="size-8 shrink-0" aria-hidden />
                    </>
                )}
            </header>

            {jumpView === "years" ? (
                <AriaCalendarYearPicker visibleYears={20}>
                    {(picker) => (
                        <div
                            role="radiogroup"
                            aria-label={picker["aria-label"]}
                            className="grid grid-cols-4 gap-1 sm:grid-cols-5"
                        >
                            {picker.items.map((item) => (
                                <CalendarPickerChip
                                    key={item.id}
                                    selected={picker.value === item.id}
                                    onClick={() => {
                                        picker.onChange(item.id);
                                        setJumpView("months");
                                    }}
                                >
                                    {item.formatted}
                                </CalendarPickerChip>
                            ))}
                        </div>
                    )}
                </AriaCalendarYearPicker>
            ) : jumpView === "months" ? (
                <AriaCalendarMonthPicker format="short">
                    {(picker) => (
                        <div
                            role="radiogroup"
                            aria-label={picker["aria-label"]}
                            className="grid grid-cols-3 gap-1"
                        >
                            {picker.items.map((item) => (
                                <CalendarPickerChip
                                    key={item.id}
                                    selected={picker.value === item.id}
                                    onClick={() => {
                                        picker.onChange(item.id);
                                        setJumpView("days");
                                    }}
                                >
                                    {item.formatted}
                                </CalendarPickerChip>
                            ))}
                        </div>
                    )}
                </AriaCalendarMonthPicker>
            ) : (
                <>
                    {showQuickControls
                        ? children ?? (
                              <div className="flex gap-3">
                                  <InputDateBase aria-label="Date" size="sm" className="flex-1" />
                                  <Button
                                      slot={null}
                                      size="sm"
                                      color="secondary"
                                      onClick={() => {
                                          state.setValue(today(APP_TIMEZONE));
                                          state.setFocusedDate(today(APP_TIMEZONE));
                                      }}
                                  >
                                      Hari ini
                                  </Button>
                              </div>
                          )
                        : children}

                    <AriaCalendarGrid weekdayStyle="short" className="w-max">
                        <AriaCalendarGridHeader className="border-b-4 border-transparent">
                            {(day) => (
                                <AriaCalendarHeaderCell className="p-0">
                                    <div className="flex size-10 items-center justify-center text-sm font-medium text-muted-foreground">
                                        {day.slice(0, 2)}
                                    </div>
                                </AriaCalendarHeaderCell>
                            )}
                        </AriaCalendarGridHeader>
                        <AriaCalendarGridBody className="[&_td]:p-0 [&_tr]:border-b-4 [&_tr]:border-transparent [&_tr:last-of-type]:border-none">
                            {(date) => (
                                <CalendarCell
                                    date={date}
                                    isHighlighted={highlightedDates?.some((highlightedDate) => date.compare(highlightedDate) === 0)}
                                />
                            )}
                        </AriaCalendarGridBody>
                    </AriaCalendarGrid>
                </>
            )}
        </>
    );
}

export const CalendarContextProvider = ({ children }: PropsWithChildren) => {
    const [value, setValue] = useState<DateValue | null>(null);
    const [focusedValue, onFocusChange] = useState<DateValue | undefined>();

    // React Aria's Calendar context widened `onChange` to support multiple selection
    // (`selectionMode="multiple"`). This calendar is single-select, so collapse any
    // array value down to the first entry.
    const onChange = (next: DateValue | readonly DateValue[] | null) => {
        setValue(Array.isArray(next) ? (next[0] ?? null) : next);
    };

    return <AriaCalendarContext.Provider value={{ value, onChange, focusedValue, onFocusChange }}>{children}</AriaCalendarContext.Provider>;
};

interface CalendarProps extends AriaCalendarProps<DateValue> {
    /** The dates to highlight. */
    highlightedDates?: DateValue[];
    /** Show MM/DD/YYYY input and "Hari ini" above the grid. */
    showQuickControls?: boolean;
    /**
     * The content to render between the header and the calendar grid.
     * If not provided, a default layout will be rendered with a date input and a today button.
     */
    children?: ReactNode;
}

export const Calendar = ({ highlightedDates, showQuickControls, className, children, ...props }: CalendarProps) => {
    const context = useSlottedContext(AriaCalendarContext);

    const ContextWrapper = context ? Fragment : CalendarContextProvider;

    return (
        <ContextWrapper>
            <AriaCalendar {...props} className={(state) => cx("flex flex-col gap-3", typeof className === "function" ? className(state) : className)}>
                {({ state }) => (
                    <CalendarBody
                        state={state}
                        highlightedDates={highlightedDates}
                        showQuickControls={showQuickControls}
                    >
                        {children}
                    </CalendarBody>
                )}
            </AriaCalendar>
        </ContextWrapper>
    );
};
