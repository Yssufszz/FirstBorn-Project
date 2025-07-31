import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Volume2, ArrowLeft, Share2, Heart } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuthContext } from '../../contexts/AuthContext';
import { COLLECTIONS } from '../../utils/constants';
import { formatDuration, formatDateTime } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

const ContentDetail = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [activeTab, setActiveTab] = useState('audio');
  const [videoError, setVideoError] = useState(false);

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const { documents: content } = useFirestore(COLLECTIONS.CONTENT, []);
  const { documents: userSubscriptions } = useFirestore(
    COLLECTIONS.SUBSCRIPTIONS,
    user ? [{ field: 'userId', operator: '==', value: user.uid }] : []
  );

  const currentContent = content.find(item => item.id === id);

  const isSubscribed = currentContent?.isSubscription ? 
    userSubscriptions.some(sub => 
      sub.contentId === id && 
      sub.isActive && 
      new Date(sub.endDate) > new Date()
    ) : true;

  const canAccess = !currentContent?.isSubscription || isSubscribed;

  useEffect(() => {
    const mediaElement = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (!mediaElement) return;

    const updateTime = () => setCurrentTime(mediaElement.currentTime);
    const updateDuration = () => setDuration(mediaElement.duration);

    mediaElement.addEventListener('timeupdate', updateTime);
    mediaElement.addEventListener('loadedmetadata', updateDuration);
    mediaElement.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      mediaElement.removeEventListener('timeupdate', updateTime);
      mediaElement.removeEventListener('loadedmetadata', updateDuration);
      mediaElement.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [activeTab, currentContent]);

  const togglePlayPause = () => {
    const mediaElement = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (!mediaElement || !canAccess) return;

    if (isPlaying) {
      mediaElement.pause();
    } else {
      mediaElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const mediaElement = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (!mediaElement || !canAccess) return;

    const clickX = e.nativeEvent.offsetX;
    const width = e.currentTarget.offsetWidth;
    const newTime = (clickX / width) * duration;
    
    mediaElement.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    const mediaElement = activeTab === 'audio' ? audioRef.current : videoRef.current;
    if (mediaElement) {
      mediaElement.volume = newVolume;
    }
  };

  if (!currentContent) {
    return <Loading text="Memuat konten..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/content" className="flex items-center text-primary-600 hover:text-primary-500 mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Konten
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentContent.title}</h1>
        <p className="text-gray-600 mb-4">{currentContent.description}</p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{formatDuration(currentContent.duration)}</span>
          <span>•</span>
          <span>{formatDateTime(currentContent.createdAt)}</span>
          {currentContent.isSubscription && (
            <>
              <span>•</span>
              <span className="text-yellow-600 font-medium">Premium</span>
            </>
          )}
        </div>
      </div>

      {!canAccess ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Konten Premium</h3>
          <p className="text-gray-600 mb-4">Berlangganan untuk mengakses konten ini</p>
          <button className="btn btn-primary">Berlangganan Sekarang</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
            {currentContent.audioUrl && (
              <button
                onClick={() => setActiveTab('audio')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'audio'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Audio
              </button>
            )}
            {currentContent.videoUrl && (
              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'video'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Video
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'audio' && currentContent.audioUrl && (
              <div className="space-y-4">
                <audio ref={audioRef} src={currentContent.audioUrl} preload="metadata" />
                
                <div className="flex items-center justify-center">
                  <img
                    src={currentContent.thumbnail || '/api/placeholder/300/300'}
                    alt={currentContent.title}
                    className="w-64 h-64 object-cover rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={togglePlayPause}
                      className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div 
                      className="h-2 bg-gray-200 rounded-full cursor-pointer"
                      onClick={handleSeek}
                    >
                      <div 
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formatDuration(Math.floor(currentTime / 60))}</span>
                      <span>{formatDuration(Math.floor(duration / 60))}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <Volume2 size={20} className="text-gray-500" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'video' && currentContent.videoUrl && (
              <div className="space-y-4">
                {!videoError ? (
                  <video
                    ref={videoRef}
                    src={currentContent.videoUrl}
                    controls
                    preload="metadata"
                    className="w-full rounded-lg"
                    poster={currentContent.thumbnail}
                    onError={() => setVideoError(true)}
                  >
                    Browser Anda tidak mendukung video HTML5.
                  </video>
                ) : (
                  <div className="text-center py-12 bg-gray-100 rounded-lg">
                    <p className="text-gray-600 mb-4">Video tidak dapat dimuat</p>
                    <a 
                      href={currentContent.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      Buka Video Langsung
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500">
                <Heart size={20} />
                <span>Suka</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600">
                <Share2 size={20} />
                <span>Bagikan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDetail;