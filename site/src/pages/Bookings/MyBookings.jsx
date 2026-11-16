import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  listMyBookings,
  listMyEvents,
  cancelMyBooking,
  cancelMyEventRegistration,
} from '@/api/plugins/bookings';
import { useBookingQuery, useBookingMutation } from '@/components/bookings/queries';
import {
  BookingShell,
  QueryFeedback,
  STATUS,
  panelClass,
  buttonClass,
  primaryClass,
  idOf,
  formatDate,
  formatTime,
  priceLabel,
} from '@/components/bookings/BookingUi';

export default function MyBookingsPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'events' ? 'events' : 'appointments';
  const [filter, setFilter] = useState('upcoming');
  const [cancelling, setCancelling] = useState(null);
  const appointments = useBookingQuery(
    'my-appointments',
    listMyBookings,
    {},
    { enabled: tab === 'appointments' },
  );
  const events = useBookingQuery('my-events', listMyEvents, {}, { enabled: tab === 'events' });
  const cancel = useBookingMutation(({ id, type }) =>
    type === 'events'
      ? cancelMyEventRegistration(id, 'لغو توسط کاربر')
      : cancelMyBooking(id, 'لغو توسط کاربر'),
  );
  const query = tab === 'events' ? events : appointments;
  const rows = (query.data || []).filter(
    (row) =>
      filter === 'all' ||
      (filter === 'cancelled'
        ? row.status === 'cancelled'
        : ['pending', 'confirmed'].includes(row.status) &&
          new Date(row.startsAt).getTime() >= Date.now()),
  );
  async function confirmCancel() {
    if (cancel.isPending) return;
    try {
      await cancel.mutateAsync(cancelling);
      setCancelling(null);
    } catch {
      /* The mutation error is rendered in the confirmation panel. */
    }
  }
  function switchTab(value) {
    const next = new URLSearchParams(params);
    if (value === 'events') next.set('tab', value);
    else next.delete('tab');
    setParams(next);
    setCancelling(null);
    cancel.reset();
  }
  return (
    <BookingShell
      title="رزروهای من"
      description="نوبت‌ها و ثبت‌نام‌های همین حساب یا مرورگر را پیگیری کنید."
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            className={buttonClass}
            aria-pressed={tab === 'appointments'}
            onClick={() => switchTab('appointments')}
          >
            نوبت‌های من
          </button>
          <button
            className={buttonClass}
            aria-pressed={tab === 'events'}
            onClick={() => switchTab('events')}
          >
            رویدادهای من
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          نمایش
          <select
            className={buttonClass + ' bg-surface'}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="upcoming">پیش رو</option>
            <option value="all">همه رزروها</option>
            <option value="cancelled">لغوشده</option>
          </select>
        </label>
      </div>
      {cancelling && (
        <section className={panelClass + ' space-y-4'} aria-labelledby="cancel-heading">
          <h2 id="cancel-heading" className="font-bold">
            این رزرو لغو شود؟
          </h2>
          <p className="text-sm text-muted-foreground">لغو رزرو تابع شرایط و بازه مجاز لغو است.</p>
          {cancel.isError && (
            <p role="alert" className="text-danger">
              {cancel.error?.message}
            </p>
          )}
          <div className="flex gap-3">
            <button
              className={primaryClass}
              disabled={cancel.isPending}
              onClick={() => void confirmCancel()}
            >
              {cancel.isPending ? 'در حال لغو…' : 'تأیید لغو'}
            </button>
            <button
              className={buttonClass}
              disabled={cancel.isPending}
              onClick={() => {
                setCancelling(null);
                cancel.reset();
              }}
            >
              انصراف
            </button>
          </div>
        </section>
      )}
      <QueryFeedback query={query} empty={!rows.length && 'رزروی در این بخش وجود ندارد.'}>
        <div className="space-y-3">
          {rows.map((row) => (
            <article
              key={idOf(row)}
              className={panelClass + ' flex flex-wrap items-center justify-between gap-5'}
            >
              <div className="space-y-2">
                <h2 className="font-bold">
                  {row.eventTitle || row.serviceTitle || row.title || 'رزرو'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formatDate(row.startsAt)} · {formatTime(row.startsAt)} تا{' '}
                  {formatTime(row.endsAt)}
                </p>
                <p className="text-sm">
                  {row.customerName} · {priceLabel(row.price ?? row.totalPrice)}
                </p>
                {row.meetingUrl &&
                  row.status === 'confirmed' &&
                  row.meetingUrl.toLowerCase().startsWith('https://') && (
                    <a
                      className="text-sm text-primary-ink underline"
                      href={row.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      ورود به جلسه آنلاین
                    </a>
                  )}
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-subtle px-3 py-2 text-xs">
                  {STATUS[row.status] || row.status}
                </span>
                {['pending', 'confirmed'].includes(row.status) && (
                  <button
                    className={buttonClass}
                    disabled={cancel.isPending}
                    onClick={() => {
                      cancel.reset();
                      setCancelling({ id: idOf(row), type: tab });
                    }}
                  >
                    لغو رزرو
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </QueryFeedback>
      <Link className={primaryClass} to="/bookings/book">
        ثبت رزرو جدید
      </Link>
    </BookingShell>
  );
}
