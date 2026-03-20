"use client";

import { useEffect } from 'react';

// For Google AdSense integration
// You will need to get an AdSense Publisher ID (e.g. ca-pub-XXXXXXXXXXXXXXXX)
export default function AdBanner({ dataAdSlot, dataAdFormat = 'auto', dataFullWidthResponsive = true }: { dataAdSlot: string, dataAdFormat?: string, dataFullWidthResponsive?: boolean }) {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <div style={{ textAlign: 'center', margin: '24px 0', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-client="ca-pub-YOUR_PUBLISHER_ID_HERE" // REPLACE THIS with your actual Pulisher ID
                data-ad-slot={dataAdSlot}
                data-ad-format={dataAdFormat}
                data-full-width-responsive={dataFullWidthResponsive}
            ></ins>
            <span className="ad-placeholder-text" style={{ position: 'absolute', color: '#64748b', fontSize: '0.85rem' }}>Advertisement Space</span>
        </div>
    );
}
