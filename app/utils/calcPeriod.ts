import { datePipe } from "./datePipe";

export function calcPeriod(date: string) {
  const today = new Date();

  const match = date.match(
    /(?<closingMonth>(翌々月|翌月|来月|再来月|月)?)締め(?<paymentMonth>(翌々月|翌月|来月|再来月|月)?)?(?<paymentDay>\d+)/,
  );
  const match2 = /(\d+)日サイト/.exec(date);
  const match3 = /^\d{4}[-/]\d{2}[-/]\d{2}$/.exec(date);

  if (match3) {
    return date.replaceAll("/", "-");
  }

  if ((!match || !match.groups) && !match2) {
    return datePipe(today);
  }

  let paymentDay = today.getDate();

  let paymentMonth = today.getMonth();

  if (match?.groups) {
    paymentDay = Number.parseInt(match.groups.paymentDay, 10);

    if (
      match.groups.paymentMonth === "翌月" ||
      match.groups.paymentMonth === "来月"
    ) {
      paymentMonth += 1;
    }
    if (
      match.groups.paymentMonth === "翌々月" ||
      match.groups.paymentMonth === "再来月"
    ) {
      paymentMonth += 2;
    }
  }

  if (match2) {
    if (Number.parseInt(match2[1], 10) % 30 === 0) {
      paymentMonth += Number.parseInt(match2[1], 10) / 30;
      paymentDay = 0;
    } else {
      paymentDay += Number.parseInt(match2[1], 10);
    }
  }

  // Generate payment date
  const paymentDate = new Date(today.getFullYear(), paymentMonth, paymentDay);

  return datePipe(paymentDate);
}
