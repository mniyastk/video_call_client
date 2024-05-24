import React from 'react'
import Navbar from '../../components/navbar/navbar'
import { Outlet } from 'react-router-dom'

const Home = () => {
  return (
    <div className='w-screen h-screen '>
        <Navbar/>
        {<Outlet/>}
    </div>
  )
}

export default Home
