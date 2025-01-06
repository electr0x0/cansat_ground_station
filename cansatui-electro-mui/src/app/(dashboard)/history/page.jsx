'use client'

import dynamic from 'next/dynamic';

const History = dynamic(() => import('@/views/cansat/History'), { ssr: false });

const HistoryPage = () => {
  return <History />;
};

export default HistoryPage;
