import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listEvents, bookEvent } from '@/api/plugins/bookings';
import { useBookingQuery, useBookingMutation } from '@/components/bookings/queries';
import {
  BookingShell,
  QueryFeedback,
  GuestFields,
  Summary,
  panelClass,
  buttonClass,
  primaryClass,
  idOf,
  formatDate,
  formatTime,
  priceLabel,
} from '@/components/bookings/BookingUi';

export function EventsList() {
  const events = useBookingQuery('events', listEvents);
  const register = useBookingMutation(bookEvent);
  const [selected, setSelected] = useState(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
    seats: 1,
  });
  async function submit(event) {
    event.preventDefault();
    if (!selected || register.isPending) return;
    try {
      await register.mutateAsync({
        eventId: idOf(selected),
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerEmail: form.customerEmail.trim() || undefined,
        notes: form.notes.trim() || undefined,
        seats: Number(form.seats),
      });
      setSuccess(true);
    } catch {
      // SDK failure remains visible below; availability is refreshed after a conflict.
      void events.refetch();
    }
  }
  if (selected)
    return (
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <Summary service={selected} slot={selected}>
          {selected.place && <p className="text-sm">{selected.place}</p>}
        </Summary>
        <section className={panelClass + ' space-y-6'}>
          {success ? (
            <>
              <h2 role="status" className="text-xl font-bold">
                ثبت‌نام شما ثبت شد
              </h2>
              <Link className={primaryClass} to="/bookings/my-bookings?tab=events">
                مشاهده رویدادهای من
              </Link>
            </>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <h2 className="text-xl font-bold">مشخصات شرکت‌کننده</h2>
              <GuestFields
                value={form}
                onChange={setForm}
                seats
                maxSeats={Number(selected.seatsRemaining ?? selected.capacity)}
              />
              {register.isError && (
                <p role="alert" className="text-danger">
                  {register.error?.message}
                </p>
              )}
              <button className={primaryClass} disabled={register.isPending}>
                {register.isPending ? 'در حال ثبت…' : 'تأیید و ثبت‌نام'}
              </button>
            </form>
          )}
          <button
            className={buttonClass}
            disabled={register.isPending}
            onClick={() => {
              setSelected(null);
              register.reset();
              setSuccess(false);
            }}
          >
            بازگشت به رویدادها
          </button>
        </section>
      </div>
    );
  return (
    <QueryFeedback
      query={events}
      empty={!events.data?.length && 'در حال حاضر رویدادی برای ثبت‌نام وجود ندارد.'}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(events.data || []).map((event) => {
          const remaining = Math.max(0, Number(event.seatsRemaining ?? event.capacity));
          return (
            <article key={idOf(event)} className={panelClass + ' flex flex-col gap-4'}>
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="aspect-video w-full rounded-xl object-cover"
                  loading="lazy"
                />
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold">{event.title}</h2>
                <span className="text-xs text-muted-foreground">
                  {remaining > 0
                    ? remaining.toLocaleString('fa-IR') + ' صندلی خالی'
                    : 'ظرفیت تکمیل است'}
                </span>
              </div>
              {event.description && (
                <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
                  {event.description}
                </p>
              )}
              <dl className="mt-auto space-y-2 border-t border-border pt-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">زمان برگزاری</dt>
                  <dd>
                    {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
                  </dd>
                </div>
                {event.place && (
                  <div>
                    <dt className="text-muted-foreground">مکان</dt>
                    <dd>{event.place}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">هزینه</dt>
                  <dd>{priceLabel(event.price)}</dd>
                </div>
                {event.recurrence?.frequency && (
                  <div>
                    <dt className="text-muted-foreground">تکرار</dt>
                    <dd>
                      {{ daily: 'روزانه', weekly: 'هفتگی', monthly: 'ماهانه', yearly: 'سالانه' }[
                        event.recurrence.frequency
                      ] || 'دوره‌ای'}
                    </dd>
                  </div>
                )}
              </dl>
              <button
                className={primaryClass}
                disabled={remaining <= 0}
                onClick={() => {
                  setSelected(event);
                  setForm({ ...form, seats: 1 });
                }}
              >
                {remaining > 0 ? 'ثبت‌نام در رویداد' : 'ظرفیت تکمیل شده'}
              </button>
            </article>
          );
        })}
      </div>
    </QueryFeedback>
  );
}
export default function EventsPage() {
  return (
    <BookingShell
      title="رویدادها و کارگاه‌ها"
      description="رویداد مورد نظر را انتخاب کنید و ثبت‌نام خود را انجام دهید."
    >
      <EventsList />
    </BookingShell>
  );
}
