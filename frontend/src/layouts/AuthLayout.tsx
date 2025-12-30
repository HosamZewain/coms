import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">COMS</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Tech Companies Operations Management System
                    </p>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
