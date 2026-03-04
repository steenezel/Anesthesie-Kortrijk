"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:3rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
     classNames={{
  root: cn("w-fit p-3", defaultClassNames.root),
  months: cn(
    "relative flex flex-col gap-6 md:flex-row", // Meer ruimte tussen maanden
    defaultClassNames.months
  ),
  month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
  nav: cn(
    "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
    defaultClassNames.nav
  ),
  button_previous: cn(
    buttonVariants({ variant: "ghost" }),
    "h-9 w-9 rounded-full select-none p-0 opacity-60 hover:opacity-100 transition-opacity",
    defaultClassNames.button_previous
  ),
  button_next: cn(
    buttonVariants({ variant: "ghost" }),
    "h-9 w-9 rounded-full select-none p-0 opacity-60 hover:opacity-100 transition-opacity",
    defaultClassNames.button_next
  ),
  month_caption: cn(
    "flex h-9 w-full items-center justify-center px-8",
    defaultClassNames.month_caption
  ),
  caption_label: cn(
    "select-none font-black uppercase tracking-[0.2em] text-[10px] text-slate-900", // "Sleek" medische look
    defaultClassNames.caption_label
  ),
  table: "w-full border-collapse",
  weekdays: cn("flex justify-between mb-2", defaultClassNames.weekdays),
  weekday: cn(
    "text-slate-400 flex-1 select-none text-[10px] font-black uppercase tracking-tighter",
    defaultClassNames.weekday
  ),
  // HIER GEBEURT DE MAGIE: 'gap-2' zorgt dat de dagen niet meer plakken
  week: cn("mt-2 flex w-full justify-between gap-2", defaultClassNames.week), 
  day: cn(
    "group/day relative flex aspect-square h-9 w-9 items-center justify-center p-0 text-center text-sm",
    defaultClassNames.day
  ),
  day_button: cn(
    buttonVariants({ variant: "ghost" }),
    "h-9 w-9 rounded-xl font-bold transition-all duration-200", // Zachte vierkante hoeken
    "hover:bg-teal-50 hover:text-teal-600 focus:bg-teal-600 focus:text-white",
    "data-[selected=true]:bg-teal-600 data-[selected=true]:text-white data-[selected=true]:shadow-md data-[selected=true]:shadow-teal-100"
  ),
  today: cn(
    "bg-slate-100 text-slate-900 font-black rounded-xl",
    defaultClassNames.today
  ),
  outside: cn(
    "text-slate-300 opacity-40 aria-selected:opacity-100",
    defaultClassNames.outside
  ),
  disabled: cn(
    "text-slate-200 opacity-30",
    defaultClassNames.disabled
  ),
  hidden: cn("invisible", defaultClassNames.hidden),
  ...classNames,
}}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
