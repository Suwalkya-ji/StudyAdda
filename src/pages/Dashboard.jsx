import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Outlet, NavLink, matchPath, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../component/core/Dashboard/Sidebar';
import { sidebarLinks } from '../data/dashboard-links';
import * as Icons from "react-icons/vsc"
import { VscSignOut, VscSettingsGear } from "react-icons/vsc"
import { logout } from "../services/operations/authAPI"
import ConfirmationModal from '../component/common/ConfirmationModal'

const Dashboard = () => {
    const { user, loading: profileLoading } = useSelector((state) => state.profile);
    const { loading: authLoading } = useSelector((state) => state.auth);
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [confirmationModal, setConfirmationModal] = useState(null);

    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname)
    }

    if (authLoading || profileLoading) {
        return (
            <div className='grid min-h-[calc(100vh-3.5rem)] place-items-center'>
                <div className='spinner'></div>
            </div>
        )
    }

  return (
    <div className='relative flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row'>
       
        {/* Desktop Sidebar */}
        <div className='hidden lg:block'>
            <Sidebar />
        </div>

        {/* Mobile Horizontal Nav Bar */}
        <div className='block lg:hidden border-b border-richblack-700 bg-richblack-800 px-4 py-3 overflow-x-auto'>
            <div className='flex items-center gap-2 min-w-max text-xs sm:text-sm'>
                {sidebarLinks.map((link) => {
                    if (link.type && user?.accountType !== link.type) return null;
                    const Icon = Icons[link.icon];
                    return (
                        <NavLink
                            key={link.id}
                            to={link.path}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                                matchRoute(link.path)
                                    ? "bg-yellow-50 text-richblack-900 font-semibold"
                                    : "text-richblack-200 hover:text-white"
                            }`}
                        >
                            {Icon && <Icon />}
                            <span>{link.name}</span>
                        </NavLink>
                    )
                })}
                <NavLink
                    to="/dashboard/settings"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                        matchRoute("/dashboard/settings")
                            ? "bg-yellow-50 text-richblack-900 font-semibold"
                            : "text-richblack-200 hover:text-white"
                    }`}
                >
                    <VscSettingsGear />
                    <span>Settings</span>
                </NavLink>
                <button
                    onClick={() =>
                        setConfirmationModal({
                            text1: "Are you sure?",
                            text2: "You will be logged out of your account.",
                            btn1Text: "Logout",
                            btn2Text: "Cancel",
                            btn1Handler: () => dispatch(logout(navigate)),
                            btn2Handler: () => setConfirmationModal(null),
                        })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-pink-200 hover:bg-pink-900/30"
                >
                    <VscSignOut />
                    <span>Logout</span>
                </button>
            </div>
        </div>

        <div className='h-[calc(100vh-3.5rem)] flex-1 overflow-auto'>
            <div className='mx-auto w-11/12 px-4 sm:px-6 lg:px-0 max-w-[1000px] py-6 sm:py-10'>
                <Outlet/>
            </div>
        </div>

        {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  )
}

export default Dashboard