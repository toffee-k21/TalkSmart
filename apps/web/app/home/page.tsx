"use client"
import React, { useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import Contact from '../component/Contact';
// import { Button } from '@repo/ui/button';

const Home = () => {
    return (
        <div>
            <Contact />
        </div>
    )
}

export default Home