type DateInput = string | number | Date | boolean | null | undefined;

function parseDate(value: DateInput) {
  if (
    value === null ||
    value === undefined ||
    value === false ||
    value === "" ||
    value === "False"
  ) {
    return null;
  }

  if (typeof value === "string") {
    const localDateTime = value.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/,
    );

    if (localDateTime) {
      const [, year, month, day, hour = "0", minute = "0", second = "0", fraction = "0"] =
        localDateTime;
      const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
        Number(fraction.padEnd(3, "0")),
      );

      if (
        date.getFullYear() !== Number(year) ||
        date.getMonth() !== Number(month) - 1 ||
        date.getDate() !== Number(day) ||
        date.getHours() !== Number(hour) ||
        date.getMinutes() !== Number(minute) ||
        date.getSeconds() !== Number(second)
      ) {
        return null;
      }

      return date;
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: DateInput) {
  const date = parseDate(value);
  if (!date) return value && value !== "False" ? String(value) : "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatTime(value: DateInput) {
  const date = parseDate(value);
  if (!date) return value && value !== "False" ? String(value) : "-";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function isSameDate(start: DateInput, stop: DateInput) {
  const startDate = parseDate(start);
  const stopDate = parseDate(stop);
  if (!startDate || !stopDate) return false;
  return formatDate(startDate) === formatDate(stopDate);
}

export function formatDateTime(value: DateInput) {
  const date = parseDate(value);
  if (!date) return value && value !== "False" ? String(value) : "-";

  return `${formatDate(date)} ${formatTime(date)}`;
}
