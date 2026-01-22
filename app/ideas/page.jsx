'use client';
import { useState } from 'react';
import IdeaList from '@/components/Idea/IdeaList';

const IdeasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Example: Replace this with data fetched from your database
  const ideas = [
    { id: 1, title: 'Online Education Platform', category: 'Education' },
    { id: 2, title: 'Traffic Monitoring App', category: 'Traffic' },
    { id: 3, title: 'Industrial Waste Solution', category: 'Industrial' },
    { id: 4, title: 'Startup Marketplace', category: 'Startup' },
    { id: 5, title: 'Healthcare Mobile App', category: 'Healthcare' },
  ];

  // Filter ideas based on search term
  const filteredIdeas = ideas.filter((idea) =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Ideas</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search ideas by title, category, or tags..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-6 px-4 py-2 border rounded-md bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Idea List */}
      <IdeaList searchQuery={searchQuery} />
    </div>
  );
};

export default IdeasPage;