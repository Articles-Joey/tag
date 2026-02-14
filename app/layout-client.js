"use client"
// import { useEffect } from "react";
// import dynamic from "next/dynamic";

import GlobalBody from '@articles-media/articles-dev-box/GlobalBody';
import { ControllerConnectionWatcher } from '@articles-media/articles-gamepad-helper';
import { Suspense } from 'react';

export default function LayoutClient({ children }) {

    return (
        <>
            <GlobalBody />
            <Suspense>
                <ControllerConnectionWatcher />
            </Suspense>

        </>
    );
}
