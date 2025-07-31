import React, { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { COLLECTIONS } from '../../utils/constants';
import { useAuthContext } from '../../contexts/AuthContext';
import ContentCard from '../../components/customer/ContentCard';
import DiscussionThread from '../../components/customer/DiscussionThread';
import Loading from '../../components/common/Loading';

const Content = () => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('content');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const { documents: content, loading: contentLoading } = useFirestore(
    COLLECTIONS.CONTENT,
    []
  );

  const { documents: discussions, loading: discussionLoading } = useFirestore(
    COLLECTIONS.DISCUSSIONS,
    []
  );

  const { documents: userSubscriptions, loading: subscriptionLoading } = useFirestore(
    COLLECTIONS.SUBSCRIPTIONS,
    user ? [{ field: 'userId', operator: '==', value: user.uid }] : []
  );

  const activeContent = content.filter(item => item.isActive);
  const activeDiscussions = discussions.filter(item => item.isActive);

  const filteredContent = activeContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'free') return matchesSearch && !item.isSubscription;
    if (filterType === 'premium') return matchesSearch && item.isSubscription;
    
    return matchesSearch;
  });

  const isSubscribed = (contentId) => {
    return userSubscriptions.some(sub => 
      sub.contentId === contentId && 
      sub.isActive && 
      new Date(sub.endDate) > new Date()
    );
  };

  if (contentLoading || discussionLoading || subscriptionLoading) {
    return <Loading text="Memuat konten..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Konten & Diskusi</h1>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'content'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Konten Audio/Video
            </button>
            <button
              onClick={() => setActiveTab('discussions')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'discussions'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Diskusi/Thread
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari konten..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {activeTab === 'content' && (
              <>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Semua</option>
                  <option value="free">Gratis</option>
                  <option value="premium">Premium</option>
                </select>

                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'content' ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-6'
        }>
          {filteredContent.map((item) => (
            <ContentCard 
              key={item.id} 
              content={item} 
              isSubscribed={isSubscribed(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {activeDiscussions.map((discussion) => (
            <DiscussionThread key={discussion.id} discussion={discussion} />
          ))}
        </div>
      )}

      {((activeTab === 'content' && filteredContent.length === 0) || 
        (activeTab === 'discussions' && activeDiscussions.length === 0)) && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'content' ? 'Konten tidak ditemukan' : 'Belum ada diskusi'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'content' 
              ? 'Coba ubah filter pencarian Anda' 
              : 'Mulai diskusi pertama Anda'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Content;