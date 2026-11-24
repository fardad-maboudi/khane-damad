import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyMembership } from '@/api/backoffice/team';
import {
  getCalendar,
  confirmBooking,
  completeBooking,
  noShowBooking,
  cancelBooking,
} from '@/api/backoffice/bookings';
import { useBookingQuery, useBookingMutation } from '@/components/bookings/queries';
import BookingCalendar, { monthGrid } from '@/components/bookings/BookingCalendar';
import {
  QueryFeedback,
  STATUS,
  panelClass,
  buttonClass,
  primaryClass,
  idOf,
  dateKey,
  formatDate,
  formatTime,
} from '@/components/bookings/BookingUi';

const actions = {
  confirm: confirmBooking,
  complete: completeBooking,
  noShow: noShowBooking,
  cancel: (id) => cancelBooking(id, { reason: 'لغو توسط مدیر سایت' }),
};
export default function ManageBookingsPage() {
  const [day, setDay] = useState(dateKey(new Date()));
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [pendingAction, setPendingAction] = useState('');
  const membership = useBookingQuery('staff-membership', getMyMembership);
  const member = membership.data?.membership || membership.data;
  const canManage = member?.capabilities?.includes('booking:manage');
  const calendar = useBookingQuery(
    'staff-calendar',
    getCalendar,
    { from: day + 'T00:00:00+03:30', to: day + 'T23:59:59.999+03:30', limit: 50, skip: page * 50 },
    { enabled: Boolean(canManage) },
  );
  const mutate = useBookingMutation(({ id, action }) => actions[action](id));
  const bookings = calendar.data?.bookings || [];
  const slots = calendar.data?.slots || [];
  const allDates = monthGrid(day)
    .cells.filter((cell) => cell.inMonth)
    .map((cell) => cell.key);
  async function applyAction() {
    if (mutate.isPending) return;
    try {
      await mutate.mutateAsync({ id: idOf(selected), action: pendingAction });
      setSelected(null);
      setPendingAction('');
    } catch {
      /* The SDK error is rendered beside the action confirmation. */
    }
  }
  return (
    <div dir="rtl" className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">تقویم و مدیریت رزروها</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            نوبت‌های روزانه، زمان‌های آزاد و وضعیت مراجعه مشتریان
          </p>
        </div>
        <Link className={buttonClass} to="/bookings/book">
          صفحه رزرو
        </Link>
      </header>
      <QueryFeedback query={membership}>
        {!canManage ? (
          <p role="alert">برای مدیریت رزروها به دسترسی مدیریت نوبت نیاز دارید.</p>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
            <aside className={panelClass}>
              <BookingCalendar
                key={day}
                onMonthChange={(value) => {
                  setDay(value);
                  setPage(0);
                  setSelected(null);
                }}
                value={day}
                available={allDates}
                onChange={(value) => {
                  setDay(value);
                  setPage(0);
                  setSelected(null);
                }}
              />
              <label className="mt-4 block space-y-2 text-sm">
                <span>انتخاب روز دیگر</span>
                <input
                  type="date"
                  className={buttonClass + ' w-full bg-surface'}
                  value={day}
                  onChange={(event) => {
                    if (event.target.value) {
                      setDay(event.target.value);
                      setPage(0);
                      setSelected(null);
                    }
                  }}
                />
              </label>
            </aside>
            <section className="min-w-0 space-y-5">
              <h2 className="text-lg font-bold">{formatDate(day + 'T12:00:00+03:30')}</h2>
              <QueryFeedback query={calendar}>
                <div className="grid grid-cols-2 gap-3">
                  <div className={panelClass}>
                    <p className="text-xs text-muted-foreground">رزروها در این صفحه</p>
                    <strong className="mt-2 block text-2xl">
                      {bookings.length.toLocaleString('fa-IR')}
                    </strong>
                  </div>
                  <div className={panelClass}>
                    <p className="text-xs text-muted-foreground">زمان‌ها در این صفحه</p>
                    <strong className="mt-2 block text-2xl">
                      {slots.length.toLocaleString('fa-IR')}
                    </strong>
                  </div>
                </div>
                <div className="mt-5 overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-[34rem] text-start text-sm">
                    <caption className="sr-only">نوبت‌های روز انتخاب‌شده</caption>
                    <thead className="bg-subtle text-muted-foreground">
                      <tr>
                        {['مشتری', 'زمان', 'وضعیت', 'عملیات'].map((title) => (
                          <th key={title} scope="col" className="p-4 text-start">
                            {title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={idOf(booking)} className="border-t border-border">
                          <td className="p-4">
                            <strong>{booking.customerName}</strong>
                            <p dir="ltr" className="mt-1 text-start text-muted-foreground">
                              {booking.customerPhone}
                            </p>
                          </td>
                          <td className="p-4">{formatTime(booking.startsAt)}</td>
                          <td className="p-4">{STATUS[booking.status] || booking.status}</td>
                          <td className="p-4">
                            <button
                              className={buttonClass}
                              onClick={() => {
                                setSelected(booking);
                                setPendingAction('');
                                mutate.reset();
                              }}
                            >
                              جزئیات
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!bookings.length && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-muted-foreground">
                            رزروی در این صفحه وجود ندارد.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    className={buttonClass}
                    disabled={page === 0 || calendar.isFetching}
                    onClick={() => {
                      setPage(page - 1);
                      setSelected(null);
                    }}
                  >
                    صفحه قبل
                  </button>
                  <span>{(page + 1).toLocaleString('fa-IR')}</span>
                  <button
                    className={buttonClass}
                    disabled={Math.max(bookings.length, slots.length) < 50 || calendar.isFetching}
                    onClick={() => {
                      setPage(page + 1);
                      setSelected(null);
                    }}
                  >
                    صفحه بعد
                  </button>
                </div>
              </QueryFeedback>
              {selected && (
                <section className={panelClass + ' space-y-4'}>
                  <h3 className="font-bold">جزئیات نوبت {selected.customerName}</h3>
                  <p>
                    {formatDate(selected.startsAt)} · {formatTime(selected.startsAt)} تا{' '}
                    {formatTime(selected.endsAt)}
                  </p>
                  <p className="text-sm text-muted-foreground">{selected.notes}</p>
                  <div className="flex flex-wrap gap-2">
                    {(selected.status === 'pending'
                      ? [['confirm', 'تأیید']]
                      : selected.status === 'confirmed'
                        ? [
                            ['complete', 'تکمیل'],
                            ['noShow', 'عدم حضور'],
                          ]
                        : []
                    )
                      .concat(
                        ['pending', 'confirmed'].includes(selected.status)
                          ? [['cancel', 'لغو']]
                          : [],
                      )
                      .map(([action, label]) => (
                        <button
                          key={action}
                          className={buttonClass}
                          disabled={mutate.isPending}
                          onClick={() => {
                            setPendingAction(action);
                            mutate.reset();
                          }}
                        >
                          {label}
                        </button>
                      ))}
                  </div>
                  {pendingAction && (
                    <div className="space-y-3 border-t border-border pt-4">
                      <p>تغییر وضعیت این نوبت تأیید شود؟</p>
                      {mutate.isError && (
                        <p role="alert" className="text-danger">
                          {mutate.error?.message}
                        </p>
                      )}
                      <button
                        className={primaryClass}
                        disabled={mutate.isPending}
                        onClick={() => void applyAction()}
                      >
                        {mutate.isPending ? 'در حال ثبت…' : 'تأیید تغییر'}
                      </button>
                    </div>
                  )}
                </section>
              )}
            </section>
          </div>
        )}
      </QueryFeedback>
    </div>
  );
}
