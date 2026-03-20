"use client";

import { useEffect, useState } from 'react';

/**
 * useSessionResume
 * Automatically detects SRM session expirations (by listening to explicit error states or missing tokens)
 * and seamlessly attempts to securely re-authenticate the user in the background using locally retained
 * credential states, thereby preventing unexpected dashboard timeouts unless the user actively logs out
 * or their credentials physically change.
 */
export function useSessionResume(errorOrMissingToken: boolean) {
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreFailed, setRestoreFailed] = useState(false);

    useEffect(() => {
        // Only attempt recovery if an error has occurred AND we aren't already looping
        if (errorOrMissingToken && !isRestoring && !restoreFailed) {
            const user = localStorage.getItem('srm_username');
            const pass = localStorage.getItem('srm_password');

            // Only proceed if credential memory actually exists
            if (user && pass) {
                setIsRestoring(true);
                console.log("SRM TTL exceeded or missing token... triggering background auto-login recovery mapping.");

                // Execute background silent authentication
                fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user, password: pass })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.token) {
                            // Success: Hot-swap the new physical token into the cache and trigger a hard sync
                            console.log("Background token cache map successfully renewed.");
                            localStorage.setItem('srm_token', data.token);
                            window.location.reload();
                        } else {
                            // The password was probably changed or explicitly banned - drop the stored cache
                            console.error("Auto-resume constraint failed natively.");
                            localStorage.removeItem('srm_password');
                            setRestoreFailed(true);
                            setIsRestoring(false);
                        }
                    })
                    .catch(err => {
                        console.error("Auto-resume fetch crashed:", err);
                        setRestoreFailed(true);
                        setIsRestoring(false);
                    });
            }
        }
    }, [errorOrMissingToken, isRestoring, restoreFailed]);

    return { isRestoring, restoreFailed };
}
