import React from 'react'
import * as Icons from "react-icons/vsc"
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

const SidebarLink = ({link, iconName}) => {

    const  Icon = Icons[iconName];
    const location = useLocation();
    const dispatch = useDispatch();

    const matchRoute = (route) => {
        return matchRoute({path:route}, location.pathname);
    }

  return (
    <NavLink
    to
    >
        
    </NavLink>
  )
}

export default SidebarLink

// 38:48