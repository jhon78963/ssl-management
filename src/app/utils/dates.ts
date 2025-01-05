import { DatePipe } from '@angular/common';

export function currentDateTime(datePipe: DatePipe) {
  return datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
}

export function currentDate(datePipe: DatePipe) {
  return datePipe.transform(new Date(), 'yyyy-MM-dd');
}

export function formatDateTime(date: Date, datePipe: DatePipe) {
  return datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
}

export function formatDateTimePeru(date: Date, datePipe: DatePipe) {
  return datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss');
}

export function formatDate(date: Date, datePipe: DatePipe) {
  return datePipe.transform(date, 'yyyy-MM-dd');
}
