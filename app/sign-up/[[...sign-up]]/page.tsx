import React from 'react'
import { SignUp } from '@clerk/nextjs'
import TextHome from '@/app/components/TextHome'

export default function Page() {
  return (
   <>
        <div className='h-screen flex flex-col justify-center items-center'>
            <TextHome />

        <div className='flex justify-center items-center'>
            <SignUp />
        </div>
    </div>

    </>
  )

}