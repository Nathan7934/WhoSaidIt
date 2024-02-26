import { useEffect } from 'react';

// This hook adjusts the height of the main content area to fill the remaining viewport height
// after the navbar height is subtracted.

export default function useAdjustContentHeight(
    navbarSelector: string, 
    mainContentSelector: string,
    dependencies: any[] = []
) {
    useEffect(() => {
        const adjustContentHeight = () => {
            const navbar: HTMLElement | null = document.querySelector(navbarSelector);
            const mainContent: HTMLElement | null = document.querySelector(mainContentSelector);

            if (navbar && mainContent) {
            const navbarHeight = navbar.offsetHeight;
            const viewportHeight = window.innerHeight;
            const contentHeight = viewportHeight - navbarHeight;
            mainContent.style.height = `${contentHeight}px`;
            }
        };
  
        // Adjust content height on initial load and on window resize
        setTimeout(adjustContentHeight, 100);
        window.addEventListener('resize', adjustContentHeight);
    
        // Cleanup event listener on component unmount
        return () => window.removeEventListener('resize', adjustContentHeight);
    }, [dependencies]);
};