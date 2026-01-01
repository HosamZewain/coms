import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Trophy, Award as AwardIcon, Star } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface Award {
    id: string;
    date: string | Date;
    note?: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        employeeProfile?: {
            profileImage?: string;
        };
    };
    awardType: {
        name: string;
        image?: string;
    };
}

interface RecentAwardsProps {
    awards: Award[];
}

const RecentAwards: React.FC<RecentAwardsProps> = ({ awards }) => {
    return (
        <Card className="flex flex-col h-full bg-slate-900 border-0 shadow-lg relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <CardTitle className="text-sm font-semibold text-white">
                    Hall of Fame
                </CardTitle>
                <Trophy className="w-4 h-4 text-amber-400" />
            </CardHeader>
            <CardContent className="flex-1 px-4 pb-4 relative z-10">
                {awards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8">
                        <AwardIcon className="w-8 h-8 text-slate-700" />
                        <p className="text-xs text-slate-500">No awards recently given</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {awards.map((award) => (
                            <div
                                key={award.id}
                                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-[1.02] cursor-default"
                            >
                                <div className="relative">
                                    <Avatar className="h-10 w-10 border-2 border-amber-500/30">
                                        <AvatarImage src={award.user.employeeProfile?.profileImage} />
                                        <AvatarFallback className="bg-slate-800 text-amber-500 text-xs font-bold">
                                            {award.user.firstName[0]}{award.user.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 shadow-sm">
                                        <Star className="w-2.5 h-2.5 text-slate-900 fill-slate-900" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate leading-tight">
                                        {award.user.firstName} {award.user.lastName}
                                    </p>
                                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                        <AwardIcon className="w-3 h-3" />
                                        {award.awardType.name}
                                    </p>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                    {format(new Date(award.date), 'MMM dd')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentAwards;
