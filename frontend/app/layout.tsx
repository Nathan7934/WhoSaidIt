import './globals.css'
import 'animate.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Providers } from './providers';
import NavBar from './components/nav-bar/NavBar';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'WhoSaidIt',
    description: 'Quiz your friends and see who said it!',
    metadataBase: new URL(`${process.env.NEXT_PUBLIC_DOMAIN_URL}`),
    icons: [
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '16x16',
            url: '/favicon/icon16.png'
        },
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            url: '/favicon/icon32.png'
        },
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '64x64',
            url: '/favicon/icon64.png'
        },
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '128x128',
            url: '/favicon/icon128.png'
        },
    ]
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className='bg-black'>
            <body className={inter.className + " overflow-hidden"} data-theme="dark">
                <Providers>
                    <NavBar />
                    {children}
                </Providers>
            </body>
        </html>
    )
}
