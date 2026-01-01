import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../store/auth.store';
import HeaderAttendance from '../components/layout/HeaderAttendance';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { getProfileImageUrl } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/employees/me');
                setProfileImage(getProfileImageUrl(res.data.data?.profileImage));
            } catch (error) {
                console.error('Failed to fetch profile image', error);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between h-16 px-6 border-b border-white/10 bg-slate-800/50 backdrop-blur-xl">
                    <h2 className="text-lg font-semibold text-white">Welcome back, {user?.firstName}</h2>
                    <div className="flex items-center gap-4">
                        <HeaderAttendance />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-3 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-medium leading-none text-white">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-slate-400">{user?.role?.name}</p>
                                    </div>
                                    <Avatar className="h-9 w-9 border-2 border-indigo-500/30">
                                        <AvatarImage src={profileImage} />
                                        <AvatarFallback className="bg-indigo-500/30 text-indigo-300 font-bold">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-white/10 text-white">
                                <DropdownMenuLabel className="text-slate-300">My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem onClick={() => navigate(`/employees/${user?.id}`)} className="hover:bg-white/10 focus:bg-white/10 text-slate-200">
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }} className="text-red-400 focus:text-red-400 hover:bg-white/10 focus:bg-white/10">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

