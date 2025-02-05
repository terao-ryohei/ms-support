import { DayPicker } from "react-day-picker";
import { ja } from "date-fns/locale";

import { buttonVariants } from "./button";
import type { ComponentProps, JSX } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/utils/cn";

export type CalendarProps = ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps): JSX.Element {
  return (
    <DayPicker
      locale={ja}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        caption: "flex justify-center pt-1 relative items-center",
        month_caption: "flex justify-center",
        caption_label: "text-sm font-medium",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: `text-center h-9 w-9 p-0 font-normal aria-selected:opacity-100 buttonVariants({ variant: "ghost" })`,
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        day_outside: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_button:
          "h-full w-full hover:bg-accent hover:text-accent-foreground",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        head_row: "flex",
        month: "space-y-4",
        months:
          "relative flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        nav: "space-x-1 flex items-center",
        nav_button: `h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 ${buttonVariants({ variant: "outline" })}`,
        nav_button_next: "absolute right-1",
        nav_button_previous: "absolute left-1",
        row: "flex w-full mt-2",
        table: "w-full border-collapse space-y-1",
        selected: "bg-accent text-accent-foreground",
        button_previous:
          "absolute p-1 top-[0] left-[0] rounded-md hover:bg-accent",
        button_next:
          "absolute p-1 top-[0] right-[0] rounded-md hover:bg-accent",
        ...classNames,
      }}
      {...props}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
