import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listServices, listResources, listAvailability, bookSlot } from '@/api/plugins/bookings';
import { useBookingQuery, useBookingMutation } from '@/components/bookings/queries';
import BookingCalendar from '@/components/bookings/BookingCalendar';
import {
  BookingShell,
  GuestFields,
  QueryFeedback,
  Summary,
  buttonClass,
  primaryClass,
  panelClass,
  idOf,
  dateKey,
  formatTime,
  priceLabel,
} from '@/components/bookings/BookingUi';
import { EventsList } from './Events';
export { EventsList };

export default function BookPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'events' ? 'events' : 'services';
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [day, setDay] = useState('');
  const [slotId, setSlotId] = useState('');
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
  });
  const [confirmed, setConfirmed] = useState(null);
  const services = useBookingQuery('services', listServices);
  const resources = useBookingQuery('resources', listResources);
  const availability = useBookingQuery(
    'availability',
    listAvailability,
    { serviceId, resourceId: resourceId || undefined },
    { enabled: Boolean(serviceId) && tab === 'services' },
  );
  const reserve = useBookingMutation(bookSlot);
  const slots = (availability.data || []).filter(
    (slot) =>
      slot.available !== false &&
      Number(slot.remaining ?? slot.capacity) > 0 &&
      new Date(slot.startsAt).getTime() > Date.now(),
  );
  const dates = [...new Set(slots.map((slot) => dateKey(slot.startsAt)))].sort();
  const activeDay = dates.includes(day) ? day : dates[0] || '';
  const selectedSlot = slots.find(
    (slot) => idOf(slot) === slotId && dateKey(slot.startsAt) === activeDay,
  );
  const service = (services.data || []).find((row) => idOf(row) === serviceId);
  const resetSelection = () => {
    setSlotId('');
    setDay('');
    reserve.reset();
  };
  const switchTab = (next) => {
    const query = new URLSearchParams(params);
    if (next === 'events') query.set('tab', next);
    else query.delete('tab');
    setParams(query);
  };
  async function submit(event) {
    event.preventDefault();
    if (!selectedSlot || reserve.isPending) return;
    try {
      const result = await reserve.mutateAsync({
        slotId: idOf(selectedSlot),
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerEmail: form.customerEmail.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setConfirmed({ result, slot: selectedSlot });
    } catch (error) {
      if (error?.status === 409 || error?.code === 'SLOT_FULL') {
        setSlotId('');
        setStep(1);
        void availability.refetch();
      }
      // The mutation retains the SDK error for the inline alert.
    }
  }
  return (
    <BookingShell
      title="رزرو نوبت"
      description="خدمت و زمان مناسب خود را انتخاب کنید و اطلاعات رزرو را ثبت کنید."
    >
      <div className="flex gap-2" aria-label="نوع رزرو">
        <button
          className={buttonClass}
          aria-pressed={tab === 'services'}
          onClick={() => switchTab('services')}
        >
          نوبت‌دهی خدمات
        </button>
        <button
          className={buttonClass}
          aria-pressed={tab === 'events'}
          onClick={() => switchTab('events')}
        >
          رویدادها و کارگاه‌ها
        </button>
      </div>
      {tab === 'events' ? (
        <EventsList />
      ) : confirmed ? (
        <section className={panelClass + ' mx-auto max-w-xl space-y-6 text-center'}>
          <h2 className="text-2xl font-bold" role="status">
            رزرو شما ثبت شد
          </h2>
          <p className="text-sm text-muted-foreground">
            {confirmed.result?.booking?.status === 'pending'
              ? 'نوبت در انتظار تأیید است.'
              : 'جزئیات و وضعیت رزرو در بخش رزروهای من در دسترس است.'}
          </p>
          <Summary service={service} slot={confirmed.slot} />
          <Link className={primaryClass} to="/bookings/my-bookings">
            مشاهده رزروهای من
          </Link>
          <button
            className={buttonClass}
            onClick={() => {
              setConfirmed(null);
              resetSelection();
              setStep(0);
            }}
          >
            رزرو نوبت دیگر
          </button>
        </section>
      ) : (
        <>
          <ol aria-label="مراحل رزرو" className="grid grid-cols-3 gap-2">
            {['انتخاب خدمت', 'تاریخ و ساعت', 'مشخصات و تأیید'].map((label, index) => (
              <li key={label}>
                <button
                  className={
                    buttonClass +
                    ' w-full gap-2 ' +
                    (step === index ? 'border-primary-ink bg-primary/10 text-primary-ink' : '')
                  }
                  aria-current={step === index ? 'step' : undefined}
                  disabled={index > step}
                  onClick={() => setStep(index)}
                >
                  <span>{(index + 1).toLocaleString('fa-IR')}</span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
          <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
            <Summary service={service} slot={selectedSlot} />
            <section className={panelClass + ' space-y-6'}>
              {reserve.isError && (
                <p role="alert" className="text-danger">
                  {reserve.error?.status === 409
                    ? 'این زمان پر شده است؛ زمان دیگری انتخاب کنید.'
                    : reserve.error?.message}
                </p>
              )}
              {step === 0 && (
                <QueryFeedback
                  query={services}
                  empty={!services.data?.length && 'هنوز خدمتی برای رزرو تعریف نشده است.'}
                >
                  <h2 className="text-lg font-bold">انتخاب خدمت</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {(services.data || []).map((item) => (
                      <button
                        key={idOf(item)}
                        className={
                          panelClass +
                          ' space-y-2 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ' +
                          (idOf(item) === serviceId ? 'border-primary-ink bg-primary/5' : '')
                        }
                        aria-pressed={idOf(item) === serviceId}
                        onClick={() => {
                          setServiceId(idOf(item));
                          setResourceId('');
                          resetSelection();
                          setStep(1);
                        }}
                      >
                        <strong>{item.name}</strong>
                        <p className="text-sm text-muted-foreground">
                          {item.durationMinutes} دقیقه · {priceLabel(item.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </QueryFeedback>
              )}
              {step === 1 && (
                <>
                  <h2 className="text-lg font-bold">انتخاب تاریخ و ساعت</h2>
                  <QueryFeedback query={resources}>
                    <label className="block space-y-2 text-sm">
                      <span>کارشناس یا فضا</span>
                      <select
                        className={buttonClass + ' w-full bg-surface'}
                        value={resourceId}
                        onChange={(event) => {
                          setResourceId(event.target.value);
                          resetSelection();
                        }}
                      >
                        <option value="">همه کارشناسان و فضاها</option>
                        {(resources.data || []).map((row) => (
                          <option key={idOf(row)} value={idOf(row)}>
                            {row.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </QueryFeedback>
                  <QueryFeedback
                    query={availability}
                    empty={!slots.length && 'در حال حاضر زمان آزادی برای این خدمت وجود ندارد.'}
                  >
                    <div className="grid gap-6 xl:grid-cols-[1fr_12rem]">
                      <BookingCalendar
                        key={serviceId + resourceId + (dates[0] || '')}
                        value={activeDay}
                        available={dates}
                        onChange={(value) => {
                          setDay(value);
                          setSlotId('');
                          reserve.reset();
                        }}
                      />
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">زمان‌های آزاد</h3>
                        <div
                          className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto xl:grid-cols-1"
                          role="group"
                          aria-label="انتخاب ساعت"
                        >
                          {slots
                            .filter((slot) => dateKey(slot.startsAt) === activeDay)
                            .map((slot) => (
                              <button
                                key={idOf(slot)}
                                className={
                                  buttonClass +
                                  (slotId === idOf(slot) ? ' bg-primary text-on-primary' : '')
                                }
                                aria-pressed={slotId === idOf(slot)}
                                onClick={() => {
                                  setSlotId(idOf(slot));
                                  reserve.reset();
                                }}
                              >
                                {formatTime(slot.startsAt)}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </QueryFeedback>
                  <button
                    className={primaryClass}
                    disabled={!selectedSlot || availability.isFetching}
                    onClick={() => setStep(2)}
                  >
                    ادامه و ثبت مشخصات
                  </button>
                </>
              )}
              {step === 2 && (
                <form onSubmit={submit} className="space-y-6">
                  <h2 className="text-lg font-bold">مشخصات و تأیید رزرو</h2>
                  <GuestFields value={form} onChange={setForm} />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className={primaryClass}
                      disabled={!selectedSlot || reserve.isPending || availability.isFetching}
                    >
                      {reserve.isPending ? 'در حال ثبت…' : 'تأیید و ثبت نهایی'}
                    </button>
                    <button
                      type="button"
                      className={buttonClass}
                      disabled={reserve.isPending}
                      onClick={() => setStep(1)}
                    >
                      ویرایش زمان
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        </>
      )}
    </BookingShell>
  );
}
