'use client';

import { Suspense } from 'react';
import PostIdeaClient from './PostIdeaClient';

export default function PostIdeaPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostIdeaClient />
    </Suspense>
  );
}