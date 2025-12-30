import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Building2, Home, MapPin } from 'lucide-react';

interface WorkLocationStatsProps {
    data: {
        office: number;
        home: number;
        undefined: number;
    };
}

export default function WorkLocationStats({ data }: WorkLocationStatsProps) {
    const total = data.office + data.home + data.undefined;
    const getPercent = (val: number) => total > 0 ? Math.round((val / total) * 100) : 0;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Work Location</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Office */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-blue-500" />
                                Office
                            </span>
                            <span className="font-medium">{data.office} ({getPercent(data.office)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${getPercent(data.office)}%` }}
                            />
                        </div>
                    </div>

                    {/* Remote/Home */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-purple-500" />
                                Remote / Home
                            </span>
                            <span className="font-medium">{data.home} ({getPercent(data.home)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${getPercent(data.home)}%` }}
                            />
                        </div>
                    </div>

                    {/* Other/Undefined */}
                    {data.undefined > 0 && (
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    Other
                                </span>
                                <span className="font-medium">{data.undefined} ({getPercent(data.undefined)}%)</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gray-500 rounded-full"
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
