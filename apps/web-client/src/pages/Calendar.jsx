import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Building, User, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

const Calendar = () => {
    const { t, i18n } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [objects, setObjects] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchBookings(), fetchProperties()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await api.get('/properties');
            setObjects(response.data.properties || []);
        } catch (error) {
            console.error("Failed to fetch properties", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await api.get('/guests');
            const guests = response.data.guests || [];

            const mappedBookings = guests.map(guest => {
                // Determine color based on submission status
                let color = 'bg-yellow-500'; // Default pending
                if (guest.submission_status === 'sent' || guest.submission_status === 'confirmed') color = 'bg-green-500';
                else if (guest.submission_status === 'error') color = 'bg-red-500';

                return {
                    id: guest.id,
                    objectId: guest.object_id, // Map from snake_case backend
                    guestName: `${guest.first_name} ${guest.last_name}`,
                    startDate: new Date(guest.arrival_date),
                    endDate: new Date(guest.departure_date),
                    status: guest.submission_status || 'pending',
                    color: color
                };
            });

            setBookings(mappedBookings);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        }
    };

    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        return new Date(year, month + 1, 0).getDate();
    }, [currentDate]);

    const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

    const changeMonth = (increment) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
    };

    const getBookingForDay = (objectId, day) => {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return bookings.find(booking =>
            booking.objectId == objectId &&
            targetDate >= booking.startDate &&
            targetDate <= booking.endDate
        );
    };

    const getBookingStyle = (booking, day) => {
        if (!booking) return '';

        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const isStart = targetDate.getTime() === booking.startDate.getTime();
        const isEnd = targetDate.getTime() === booking.endDate.getTime();

        let rounded = '';
        if (isStart && isEnd) rounded = 'rounded-full mx-1';
        else if (isStart) rounded = 'rounded-l-full ml-1';
        else if (isEnd) rounded = 'rounded-r-full mr-1';

        return `${booking.color} ${rounded} h-6 w-full absolute top-1/2 left-0 -translate-y-1/2 opacity-80 hover:opacity-100 transition-opacity cursor-pointer`;
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        {t('calendar.title')}
                    </h1>
                    <p className="text-slate-500 mt-1">{t('calendar.subtitle')}</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-semibold text-slate-800 w-32 text-center select-none">
                        {currentDate.toLocaleString(i18n.language, { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-px bg-slate-200 mx-2" />

                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('calendar.add_booking')}</span>
                    </button>
                </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/50 shadow-xl bg-white/50 backdrop-blur-xl">
                <div className="overflow-x-auto pb-4">
                    <div className="min-w-[1000px]">
                        {/* Header Row: Days */}
                        <div className="flex border-b border-slate-200/60 bg-slate-50/50">
                            {/* Objects Column Header */}
                            <div className="w-64 flex-shrink-0 p-4 border-r border-slate-200/60 font-semibold text-slate-600 sticky left-0 bg-slate-50/95 backdrop-blur z-20">
                                {t('guest.property')}
                            </div>

                            {/* Days Header */}
                            {daysArray.map(day => {
                                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                const isToday = new Date().toDateString() === date.toDateString();

                                return (
                                    <div
                                        key={day}
                                        className={`flex-1 min-w-[40px] text-center py-3 border-r border-slate-100 last:border-r-0 flex flex-col items-center justify-center ${isWeekend ? 'bg-slate-100/50' : ''}`}
                                    >
                                        <span className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                                            {date.toLocaleString(i18n.language, { weekday: 'narrow' })}
                                        </span>
                                        <span className={`text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700'}`}>
                                            {day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Property Rows */}
                        {objects.map(obj => (
                            <div key={obj.id} className="flex border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors group">
                                {/* Property Name */}
                                <div className="w-64 flex-shrink-0 p-4 border-r border-slate-200/60 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors z-10 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Building className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800 text-sm">{obj.name}</div>
                                        <div className="text-xs text-slate-500">{obj.type}</div>
                                    </div>
                                </div>

                                {/* Days Cells */}
                                {daysArray.map(day => {
                                    const booking = getBookingForDay(obj.id, day);
                                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                                    return (
                                        <div
                                            key={day}
                                            className={`flex-1 min-w-[40px] border-r border-slate-100 last:border-r-0 relative h-16 ${isWeekend ? 'bg-slate-50/30' : ''}`}
                                        >
                                            {booking && (
                                                <div
                                                    className={getBookingStyle(booking, day)}
                                                    title={`${booking.guestName} (${booking.status})`}
                                                >
                                                    {/* Only show name on the first day of booking or if it's the 1st of month */}
                                                    {(day === booking.startDate.getDate() || day === 1) && (
                                                        <div className="text-[10px] text-white font-medium truncate px-2 leading-6">
                                                            {booking.guestName}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend / Stats */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>{t('calendar.legend.reported')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>{t('calendar.legend.pending')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>{t('calendar.legend.error')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>{t('calendar.legend.confirmed')}</span>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
