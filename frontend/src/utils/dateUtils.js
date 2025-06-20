import { parseISO, format } from "date-fns";
export const formatDate = (dateString) => {
  try {
    const parsedDate = parseISO(dateString);
    return format(parsedDate, "MMMM dd, yyyy, h:mm a");
  } catch (error) {
    console.error("Error parsing date:", error);
    return dateString;
  }
};
