import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ShoppingBag, MessageSquare, Star } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { COLLECTIONS } from '../../utils/constants';
import ContentCard from '../../components/customer/ContentCard';
import MerchandiseCard from '../../components/customer/MerchandiseCard';
import DiscussionThread from '../../components/customer/DiscussionThread';
import Loading from '../../components/common/Loading';

const Home = () => {
  const { documents: featuredContent, loading: contentLoading } = useFirestore(
    COLLECTIONS.CONTENT, 
    []
  );
  
  const { documents: latestMerchandise, loading: merchandiseLoading } = useFirestore(
    COLLECTIONS.MERCHANDISE,
    []
  );
  
  const { documents: trendingDiscussions, loading: discussionLoading } = useFirestore(
    COLLECTIONS.DISCUSSIONS,
    []
  );
  
  console.log('Featured Content:', featuredContent);
  console.log('Latest Merchandise:', latestMerchandise);
  console.log('Content Loading:', contentLoading);

  const activeContent = featuredContent.filter(item => item.isActive);
  const activeMerchandise = latestMerchandise.filter(item => item.isActive);
  const activeDiscussions = trendingDiscussions.filter(item => item.isActive);

  if (contentLoading || merchandiseLoading || discussionLoading) {
    return <Loading text="Memuat halaman..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 mb-12 text-white overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to FirstBorn
          </h1>
          <p className="text-xl md:text-2xl mb-6 opacity-90">
            Platform podcast eksklusif untuk para anak pertama dengan merchandise premium
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/content" className="btn bg-white text-primary-600 hover:bg-gray-100 inline-flex items-center">
              <Play size={20} className="mr-2" />
              Jelajahi Konten
            </Link>
            <Link to="/merchandise" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 inline-flex items-center">
              <ShoppingBag size={20} className="mr-2" />
              Lihat Merchandise
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Konten Unggulan</h2>
          <Link to="/content" className="text-primary-600 hover:text-primary-500 font-medium">
            Lihat Semua →
          </Link>
        </div>
        
        {activeContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeContent.slice(0, 6).map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Play size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Konten</h3>
            <p className="text-gray-600">Konten akan segera hadir untuk Anda</p>
          </div>
        )}
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Diskusi Trending</h2>
          <Link to="/content" className="text-primary-600 hover:text-primary-500 font-medium">
            Lihat Semua →
          </Link>
        </div>
        
        {activeDiscussions.length > 0 ? (
          <div className="space-y-6">
            {activeDiscussions.slice(0, 3).map((discussion) => (
              <DiscussionThread key={discussion.id} discussion={discussion} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Diskusi</h3>
            <p className="text-gray-600">Mulai diskusi pertama Anda</p>
          </div>
        )}
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Merchandise Terbaru</h2>
          <Link to="/merchandise" className="text-primary-600 hover:text-primary-500 font-medium">
            Lihat Semua →
          </Link>
        </div>
        
        {activeMerchandise.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeMerchandise.slice(0, 4).map((product) => (
              <MerchandiseCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Produk</h3>
            <p className="text-gray-600">Produk merchandise akan segera hadir</p>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl p-8">
        <div className="text-center max-w-3xl mx-auto">
          <Star size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tentang FirstBorn</h2>
          <p className="text-lg text-gray-600 mb-6">
            FirstBorn adalah platform podcast yang didedikasikan khusus untuk para anak pertama. 
            Kami memahami tantangan dan pengalaman unik yang dihadapi oleh firstborn dalam keluarga. 
            Melalui konten berkualitas dan merchandise eksklusif, kami hadir untuk memberikan 
            inspirasi dan membangun komunitas yang kuat.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-2xl font-bold text-primary-600 mb-2">500+</h3>
              <p className="text-gray-600">Episode Podcast</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary-600 mb-2">10K+</h3>
              <p className="text-gray-600">Member Aktif</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary-600 mb-2">50+</h3>
              <p className="text-gray-600">Produk Merchandise</p>
            </div>
          </div>
          <div className="mt-8">
            <Link to="/talk-to-us" className="btn btn-primary">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;