"use client";

import { today } from "@internationalized/date";
import { APP_TIMEZONE } from "@/lib/timezone";
import { useControlledState } from "@react-stately/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { useDateFormatter } from "react-aria";
import type { DatePickerProps as AriaDatePickerProps, DateValue } from "react-aria-components";
import {
  Button as RacButton,
  DatePicker as AriaDatePicker,
  Dialog as AriaDialog,
  Group as AriaGroup,
  Popover as AriaPopover,
} from "react-aria-components";
import { Button as UiButton } from "@/components/ui/button";
import { fieldControlClass } from "@/lib/field-control";
import { cn } from "@/lib/utils";
import { cx } from "@/lib/utils/cx";
import { Calendar } from "./calendar";

const highlightedDates = [today(APP_TIMEZONE)];

function DatePickerTodayButton({ onToday }: { onToday: () => void }) {
  return (
    <UiButton
      type="button"
      variant="ghost"
      size="sm"
      className="text-primary hover:text-primary"
      onClick={onToday}
    >
      Hari ini
    </UiButton>
  );
}

interface DatePickerProps extends AriaDatePickerProps<DateValue> {
  onApply?: () => void;
  onCancel?: () => void;
}

export const DatePicker = ({
  value: valueProp,
  defaultValue,
  onChange,
  onApply,
  onCancel,
  ...props
}: DatePickerProps) => {
  const formatter = useDateFormatter({
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const [value, setValue] = useControlledState(valueProp, defaultValue || null, onChange);

  const formattedDate = value ? formatter.format(value.toDate(APP_TIMEZONE)) : "Pilih tanggal";

  return (
    <AriaDatePicker shouldCloseOnSelect={false} {...props} value={value} onChange={setValue}>
      <AriaGroup className="w-full" data-slot="group">
        <RacButton
          data-slot="field-trigger"
          className={cn(
            fieldControlClass,
            "justify-start font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{formattedDate}</span>
        </RacButton>
      </AriaGroup>
      <AriaPopover
        isNonModal
        offset={8}
        placement="bottom start"
        shouldFlip
        containerPadding={12}
        className={({ isEntering, isExiting }) =>
          cx(
            "z-[200] origin-(--trigger-anchor-point) will-change-transform",
            isEntering &&
              "duration-150 ease-out animate-in fade-in placement-right:slide-in-from-left-0.5 placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5",
            isExiting &&
              "duration-100 ease-in animate-out fade-out placement-right:slide-out-to-left-0.5 placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5",
          )
        }
      >
        <AriaDialog className="isolate overflow-hidden rounded-[var(--radius-card)] border border-border bg-popover text-popover-foreground">
          {({ close }) => (
            <>
              <div className="flex px-4 py-4 sm:px-6 sm:py-5">
                <Calendar highlightedDates={highlightedDates} showQuickControls={false} />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border bg-popover px-4 py-3">
                <DatePickerTodayButton onToday={() => setValue(today(APP_TIMEZONE))} />
                <div className="flex gap-2">
                  <UiButton
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={() => {
                      onCancel?.();
                      close();
                    }}
                  >
                    Batal
                  </UiButton>
                  <UiButton
                    type="button"
                    size="default"
                    onClick={() => {
                      onApply?.();
                      close();
                    }}
                  >
                    Terapkan
                  </UiButton>
                </div>
              </div>
            </>
          )}
        </AriaDialog>
      </AriaPopover>
    </AriaDatePicker>
  );
};
