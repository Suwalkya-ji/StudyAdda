import React from 'react'

const HighlightText = ({text}) => {
  return (
    <span className='font-bold text-richblue-500 '>   {/* bg-gradient-to-b from-[red] to-[white]  */}
         {" "}
        {text}
    </span>
  )
}

export default HighlightText