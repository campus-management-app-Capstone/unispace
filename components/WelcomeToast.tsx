'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function WelcomeToast() {
    useEffect(() => {
        toast('Welcome to unispace!', {
            toastId: 'welcome-toast'
        });
    }, []);

    return null;
}
