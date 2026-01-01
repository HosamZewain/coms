import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Building2, Home, MapPin } from 'lucide-react';

interface WorkLocationStatsProps {
    data: {
        office: number;
        home: number;
        undefined: number;
    };
    darkMode?: boolean;
}

export default function WorkLocationStats({ data, darkMode = false }: WorkLocationStatsProps) {
    const total = data.office + data.home + data.undefined;
    const getPercent = (val: number) => total > 0 ? Math.round((val / total) * 100) : 0;

    return (
        <Card className={`border-0 overflow-hidden flex flex-col h-full ${darkMode ? 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl' : 'bg-white/50 backdrop-blur-sm shadow-sm'}`}>
            <CardHeader className={`pb-4 border-b text-start ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-white/30'}`}>
                <CardTitle className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Work Location</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    {/* Office */}
                    <div className="group">
                        <div className="flex justify-between items-center text-sm mb-2 text-start">
                            <span className={`flex items-center gap-2 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-indigo-500/30 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                                    <Building2 className="h-3.5 w-3.5" />
                                </div>
                                Office
                            </span>
                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{data.office} <span className={`text-[10px] font-medium ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>({getPercent(data.office)}%)</span></span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                                style={{ width: `${getPercent(data.office)}%` }}
                            />
                        </div>
                    </div>

                    {/* Remote/Home */}
                    <div className="group">
                        <div className="flex justify-between items-center text-sm mb-2 text-start">
                            <span className={`flex items-center gap-2 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-fuchsia-500/30 text-fuchsia-300' : 'bg-fuchsia-50 text-fuchsia-600'}`}>
                                    <Home className="h-3.5 w-3.5" />
                                </div>
                                Remote / Home
                            </span>
                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{data.home} <span className={`text-[10px] font-medium ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>({getPercent(data.home)}%)</span></span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                            <div
                                className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(217,70,239,0.4)]"
                                style={{ width: `${getPercent(data.home)}%` }}
                            />
                        </div>
                    </div>

                    {/* Other/Undefined */}
                    {data.undefined > 0 && (
                        <div className="group">
                            <div className="flex justify-between items-center text-sm mb-2 text-start">
                                <span className={`flex items-center gap-2 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                                        <MapPin className="h-3.5 w-3.5" />
                                    </div>
                                    Other
                                </span>
                                <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{data.undefined} <span className={`text-[10px] font-medium ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>({getPercent(data.undefined)}%)</span></span>
                            </div>
                            <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                                <div
                                    className="h-full bg-slate-400 rounded-full transition-all duration-500"
                                    style={{ width: `${getPercent(data.undefined)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
