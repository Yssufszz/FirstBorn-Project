import React, { useState } from 'react';
import { MessageCircle, ThumbsUp, Reply, MoreVertical } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

const DiscussionThread = ({ discussion }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = (e) => {
    e.preventDefault();
    // Handle comment submission
    console.log('New comment:', newComment);
    setNewComment('');
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={discussion.author?.avatar || '/api/placeholder/40/40'}
            alt={discussion.author?.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h4 className="font-medium text-gray-900">{discussion.author?.name}</h4>
            <p className="text-sm text-gray-500">{formatDateTime(discussion.createdAt)}</p>
          </div>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <MoreVertical size={16} />
        </button>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {discussion.title}
      </h3>
      
      <p className="text-gray-700 mb-4">
        {discussion.content}
      </p>

      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <button className="flex items-center space-x-1 hover:text-primary-600">
          <ThumbsUp size={16} />
          <span>{discussion.likes || 0}</span>
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 hover:text-primary-600"
        >
          <MessageCircle size={16} />
          <span>{discussion.comments?.length || 0} komentar</span>
        </button>

        <button className="flex items-center space-x-1 hover:text-primary-600">
          <Reply size={16} />
          <span>Balas</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          <div className="border-t pt-4">
            {discussion.comments?.map((comment, index) => (
              <div key={index} className="flex space-x-3 mb-3">
                <img
                  src={comment.author?.avatar || '/api/placeholder/32/32'}
                  alt={comment.author?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-sm">{comment.author?.name}</p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitComment} className="border-t pt-4">
            <div className="flex space-x-3">
              <img
                src="/api/placeholder/32/32"
                alt="You"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tulis komentar..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="2"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="btn btn-primary btn-sm disabled:opacity-50"
                  >
                    Kirim
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DiscussionThread;