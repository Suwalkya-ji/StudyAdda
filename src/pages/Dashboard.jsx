import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom';
import Sidebar from '../component/core/Dashboard/Sidebar';

const Dashboard = () => {

    const {loading : authLoading} = useSelector((state) => state.auth);
    const {loading : profileLoading} = useSelector((state) => state.profile);

    if(authLoading || profileLoading) {
        return(
            <div className='mt-10'>
                Loading....
            </div>
        )
    }

  return (
    <div className='relative flex min-h-[calc(100vh-3.5rem)]'>
        <Sidebar />

        <div className='h-[clac(100vh-3.5rem)] overflow-auto'>
            <div>
                <Outlet/>
            </div>

        </div>
        

    </div>
  )
}

export default Dashboard