import React from 'react'
import { ToastContainer, toast } from 'react-toastify';
import Navbar from './Navbar';


type wrapperProps = {
    children : React.ReactNode
}


const Wrapper = ({children} : wrapperProps) => {
  return (
    <div>
        <Navbar />
        <ToastContainer 
            position='top-right'
            autoClose={500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable/>
        <div className='px-5 md:px-[10%] mt-8 mb-10'>
            {children}
        </div>
    </div>
  )
}

export default Wrapper