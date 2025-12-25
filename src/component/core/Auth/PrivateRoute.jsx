import React, { Children } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({children}) => {

    const {token} = useSelector((state) => state.auth)

    // isse bhi kar sakte h
    // return token ? children : <Navigate to="/login" replace />

   { if(token !== null)
        return children;
    else
        return  <Navigate to='/login'/>
}

}

export default PrivateRoute