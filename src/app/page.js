'use client'

import Image from 'next/image'
import './page.css'
import Link from 'next/link'
import { motion } from 'framer-motion'
import SearchBarWithCat from '../components/SearchBarwithCat'
import broadcom from '../../public/company-logos/broadcom.png'
import cisco from '../../public/company-logos/cisco.png'
import celestica from '../../public/company-logos/celestica.png'
import micas from '../../public/company-logos/micas.png'
import nvidia from '../../public/company-logos/nvidia.png'
import optiv from '../../public/company-logos/optiv.png'
import wwt from '../../public/company-logos/wwt.png'
import wistron from '../../public/company-logos/wistron.png'
import carahsoft from '../../public/company-logos/carahsoft.png'
import connectItSolutions from '../../public/company-logos/connect-it-solutions.png'
import eps from '../../public/company-logos/eps.png'
import hardwareNation from '../../public/company-logos/hardware-nation.png'
import edgeCore from '../../public/company-logos/edgecore.png'
import keysight from '../../public/company-logos/keysight.png'
import pnnetworks from '../../public/company-logos/pnetworks.png'
const technologyPartners = [
  broadcom,
  cisco,
  celestica,
  edgeCore,
  keysight,
  micas,
  nvidia,
  wistron,
]
const distriPartners = [
  carahsoft,
  connectItSolutions,
  eps,
  hardwareNation,
  micas,
  optiv,
  pnnetworks,
  wwt,
]

export default function Home() {
  return (
    <div className="bg-[#191153] flex flex-col items-center">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-[var(--primary)] text-white pt-10 pb-16"
      >
        {/* Background dots or pattern */}
        <div className="absolute inset-0 bg-[url('https://dev.community.aviznetworks.com/wp-content/uploads/2025/03/06-Artboard-13.png')] bg-contain bg-no-repeat bg-top"></div>
        <div className="relative max-w-5xl mx-auto px-4 text-center pt-30">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-8xl font-extrabold mb-4"
          >
            Aviz Community
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg mb-8"
          >
            A global hub for network innovators exploring SONiC, Network Observability,
            and AI-powered networking assistants. Join engineers, architects, and
            decision-makers solving real challenges across enterprise, data centers
            and telco networks. No noise. Just outcomes. Welcome to the home of serious
            network transformation.
          </motion.p>

          {/* Search Bar With Categories */}
          <SearchBarWithCat />
        </div>
      </motion.section>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className='max-w-[80%] w-full bg-white rounded-[20px] shadow-lg mt-20 mb-20 p-20'
      >
      {/* Technology Partners */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto rounded-[20px]"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl font-semibold text-center mb-8 font-bold"
        >
          Technology Partners
        </motion.h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 items-center">
          {technologyPartners.map((src, index) => (
            <motion.div 
              key={`${src}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-4 bg-white rounded-lg flex items-center justify-center border-1 border-solid border-gray-200"
            >
              <Image 
                src={src} 
                alt="Partner logo" 
                width={150} 
                height={60}
                className="object-contain"
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Distributors */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-7xl mx-auto rounded-[20px] mt-20"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-2xl font-semibold text-center mb-8 font-bold"
        >
          Aviz VARs and Distributors
        </motion.h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 items-center">
          {distriPartners.map((src, index) => (
            <motion.div 
              key={`${src}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="p-4 bg-white rounded-lg flex items-center justify-center border-1 border-solid border-gray-200"
            >
              <Image 
                src={src} 
                alt="Distributor logo" 
                width={150} 
                height={60}
                className="object-contain"
              />
            </motion.div>
          ))}
        </div>
      </motion.section>
      </motion.div>

      {/* Subscribe Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-black text-white w-[80%] p-10 rounded-[20px] shadow-lg mb-20"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-2xl font-semibold"
          >
            Subscribe to Aviz latest updates
          </motion.h3>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-[#191153] hover:bg-[#2a1c7a] rounded-full font-medium"
          >
            Join
          </motion.button>
        </div>
      </motion.section>
    </div>
  )
}
