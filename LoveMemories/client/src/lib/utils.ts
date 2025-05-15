import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  
  // Convert string date to Date object if needed
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  // Format the date as "dd/MM/yyyy HH:mm"
  return format(dateObj, "dd/MM/yyyy HH:mm");
}
