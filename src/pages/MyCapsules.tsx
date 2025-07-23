import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Users, Clock, Package, Edit, Trash2, Eye, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ToastNotification } from '../components/ToastNotification';

interface Capsule {
  id: string;
  title: string;
  recipients: { name: string; email: string }[];
  delivery_date: string;
  status: 'draft' | 'sealed' | 'sent';
  created_at: string;
  files: any[];
}

export const MyCapsules: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'sealed' | 'sent'>('all');
  const [showToast, setShowToast] = useState(false); // State variable for toast visibility
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');

  // Renamed the function to triggerToast to avoid conflict
  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  useEffect(() => {
    if (user) {
      fetchCapsules();
    }
  }, [user]);

  const fetchCapsules = async () => {
    try {
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCapsules(data || []);
    } catch (error) {
      console.error('Error fetching capsules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sealed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sent':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-4 h-4" />;
      case 'sealed':
        return <Clock className="w-4 h-4" />;
      case 'sent':
        return <Send className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sealed':
        return 'Ready';
      case 'sent':
        return 'Sent';
      default:
        return status;
    }
  };

  const handleCreateNew = () => {
    navigate('/create-capsule');
  };

  const handleEditCapsule = (capsuleId: string) => {
    navigate(`/create-capsule?edit=${capsuleId}`);
  };

  const handleDeleteCapsule = async (capsuleId: string) => {
    try {
      const { error } = await supabase
        .from('capsules')
        .delete()
        .eq('id', capsuleId);

      if (error) throw error;
      
      // Refresh the list
      fetchCapsules();
      // Use the renamed function here
      triggerToast('Capsule deleted successfully', 'success'); 
    } catch (error) {
      console.error('Error deleting capsule:', error);
      // Use the renamed function here
      triggerToast('Failed to delete capsule', 'error'); 
    }
  };

  const filteredCapsules = activeFilter === 'all' 
    ? capsules 
    : capsules.filter(capsule => capsule.status === activeFilter);

  const getCategoryCount = (status: 'draft' | 'sealed' | 'sent') => {
    return capsules.filter(capsule => capsule.status === status).length;
  };

  const hasAnyCapsules = capsules.length > 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold text-dusty-800 mb-4">
            Sign In Required
          </h1>
          <p className="text-dusty-600 mb-8">
            Please sign in to view your time capsules.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#C0A172' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl lg:text-7xl font-serif font-bold gradient-text mb-4">
            My Time Capsules
          </h1>
          <p className="text-xl text-dusty-600 max-w-3xl mx-auto">
            Manage all your time capsules in one place. Create new memories, edit drafts, 
            and track delivery status.
          </p>
        </motion.div>

        {/* Create New Capsule Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <button
            onClick={handleCreateNew}
            className="btn-primary text-lg px-8 py-4 inline-flex items-center group"
          >
            <Plus className="w-6 h-6 mr-3" />
            Create New Capsule
          </button>
        </motion.div>

        {/* Filter Tabs */}
        {hasAnyCapsules && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-white rounded-lg p-2 shadow-md border border-dusty-200">
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All Capsules', count: capsules.length },
                  { key: 'draft', label: 'Drafts', count: getCategoryCount('draft') },
                  { key: 'sealed', label: 'Ready', count: getCategoryCount('sealed') },
                  { key: 'sent', label: 'Sent', count: getCategoryCount('sent') }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeFilter === filter.key
                        ? 'bg-dusty-600 text-white shadow-md'
                        : 'text-dusty-600 hover:bg-dusty-50'
                    }`}
                  >
                    {filter.label}
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white bg-opacity-20">
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Capsules Grid or Empty State */}
        {!hasAnyCapsules ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center py-16"
          >
            <Package className="w-24 h-24 text-dusty-300 mx-auto mb-6" />
            <h3 className="text-2xl font-serif font-bold text-dusty-700 mb-4">
              No Time Capsules Yet
            </h3>
            <p className="text-dusty-600 mb-8 max-w-md mx-auto">
              Start preserving your precious memories by creating your first time capsule. 
              It's easy and takes just a few minutes.
            </p>
            <button
              onClick={handleCreateNew}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Capsule
            </button>
          </motion.div>
        ) : filteredCapsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center py-16"
          >
            <Package className="w-16 h-16 text-dusty-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-dusty-700 mb-2">
              No {activeFilter === 'all' ? '' : formatStatus(activeFilter)} Capsules
            </h3>
            <p className="text-dusty-600">
              {activeFilter === 'draft' && 'You don\'t have any draft capsules.'}
              {activeFilter === 'sealed' && 'You don\'t have any ready capsules.'}
              {activeFilter === 'sent' && 'You haven\'t sent any capsules yet.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCapsules.map((capsule, index) => (
              <motion.div
                key={capsule.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="card p-6 hover:shadow-xl transition-all duration-300"
              >
                {/* Capsule Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-serif font-bold text-dusty-800 line-clamp-2">
                    {capsule.title || 'Untitled Capsule'}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(capsule.status)}`}>
                    {getStatusIcon(capsule.status)}
                    <span className="ml-1">{formatStatus(capsule.status)}</span>
                  </span>
                </div>

                {/* Recipients */}
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-4 h-4 text-dusty-500" />
                  <span className="text-sm text-dusty-600">
                    {capsule.recipients?.length > 0 
                      ? \`${capsule.recipients.length} recipient${capsule.recipients.length > 1 ? 's' : ''}`
                      : 'No recipients'
                    }
                  </span>
                </div>

                {/* Delivery Date */}
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-4 h-4 text-dusty-500" />
                  <span className="text-sm text-dusty-600">
                    {new Date(capsule.delivery_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {/* Files Count */}
                <div className="flex items-center space-x-2 mb-6">
                  <Package className="w-4 h-4 text-dusty-500" />
                  <span className="text-sm text-dusty-600">
                    {capsule.files?.length || 0} file{(capsule.files?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {capsule.status === 'draft' && (
                    <button
                      onClick={() => handleEditCapsule(capsule.id)}
                      className="flex-1 btn-primary py-2 text-sm"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  )}
                  
                  {(capsule.status === 'sealed' || capsule.status === 'sent') && (
                    <button
                      // Calling the renamed function here
                      onClick={() => triggerToast('Preview functionality available in edit mode', 'info')}
                      className="flex-1 btn-outline py-2 text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </button>
                  )}
                  
                  {capsule.status === 'draft' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this time capsule? This action cannot be undone.')) {
                          handleDeleteCapsule(capsule.id);
                        }
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-none transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Created Date */}
                <div className="mt-4 pt-4 border-t border-dusty-200">
                  <span className="text-xs text-dusty-500">
                    Created {new Date(capsule.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {hasAnyCapsules && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Edit className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-dusty-800 mb-2">
                  {getCategoryCount('draft')}
                </h3>
                <p className="text-dusty-600">Drafts</p>
              </div>
              
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-dusty-800 mb-2">
                  {getCategoryCount('sealed')}
                </h3>
                <p className="text-dusty-600">Ready</p>
              </div>
              
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-dusty-800 mb-2">
                  {getCategoryCount('sent')}
                </h3>
                <p className="text-dusty-600">Sent</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
};