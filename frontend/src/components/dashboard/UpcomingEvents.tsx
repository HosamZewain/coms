import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, Cake, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface Event {
    id: string;
    type: 'BIRTHDAY' | 'HOLIDAY';
    title: string;
    date: string | Date;
    isBirthday: boolean;
    user?: {
        id: string;
        name: string;
        image?: string;
    };
}

interface UpcomingEventsProps {
    events: Event[];
    darkMode?: boolean;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, darkMode = false }) => {
    return (
        <Card className={`flex flex-col h-full border-0 ${darkMode ? 'bg-transparent' : 'bg-white/50 backdrop-blur-sm shadow-sm'}`}>
            <CardHeader className={`flex flex-row items-center justify-between pb-2 space-y-0 ${darkMode ? 'border-b border-white/10' : ''}`}>
                <CardTitle className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Upcoming Events
                </CardTitle>
                <Calendar className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
            </CardHeader>
            <CardContent className="flex-1 px-4 pb-4">
                {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8">
                        <Calendar className={`w-8 h-8 ${darkMode ? 'text-slate-600' : 'text-slate-200'}`} />
                        <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No events in the next 30 days</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {events.map((event) => (
                            <div
                                key={`${event.type}-${event.id}`}
                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors group ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                                    }`}
                            >
                                {event.isBirthday ? (
                                    <div className="relative">
                                        <Avatar className={`h-9 w-9 border-2 ${darkMode ? 'border-indigo-500/30' : 'border-indigo-50'}`}>
                                            <AvatarImage src={event.user?.image} />
                                            <AvatarFallback className={`text-xs font-bold ${darkMode ? 'bg-indigo-500/30 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
                                                {event.user?.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`absolute -bottom-1 -right-1 rounded-full p-0.5 shadow-sm ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                            <Cake className="w-3 h-3 text-pink-500" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`flex items-center justify-center h-9 w-9 rounded-full ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                                        <Gift className="w-4 h-4" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {event.title}
                                    </p>
                                    <p className={`text-[10px] font-medium uppercase tracking-wider mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                        {format(new Date(event.date), 'MMM dd')} • {event.type === 'BIRTHDAY' ? 'Birthday' : 'Public Holiday'}
                                    </p>
                                </div>
                                <div className={`text-[10px] font-semibold ${darkMode ? 'text-slate-500 group-hover:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                                    {event.type === 'BIRTHDAY' ? 'Wish them!' : 'Off'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UpcomingEvents;
