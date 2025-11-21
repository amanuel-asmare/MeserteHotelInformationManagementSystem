// frontend/src/components/ui/DatePicker.tsx
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils" // Assuming you have a utility for classnames (e.g., from shadcn setup)
import { Button } from "../ui/receptionistUI/button" // Adjust path
import { Calendar } from "../ui/calender" // Adjust path
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/receptionistUI/popover" // Adjust path

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
}

export function DatePicker({ date, setDate, disabled }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  )
}