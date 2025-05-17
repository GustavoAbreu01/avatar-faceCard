import React from 'react'
import { LuScanFace } from "react-icons/lu";

export default function Header() {
    return (
        <div className='w-[88vw] h-20 bg-gray-900 border-(--color_2) rounded-b-[40px] mx-[6vw] flex items-center px-6 justify-between fixed z-10'>
            <LuScanFace className='text-gray-200 size-12 p-1.5 rounded-md' />
            <div className='bg-gray-500 size-8 rounded-full p-1 flex items-center justify-center'>
                <div className='bg-gray-700 size-4 rounded-full animate-pulse'></div>
            </div>
            <div className='size-9 p-1.5 rounded-md' />
        </div>
    )
}