import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ToastNotification } from '../components/ToastNotification';
import { Calendar, Users, Edit, Save, X, Package, User as UserIcon, Plus, Trash2 } from 'lucide-react';

interface Capsule {
  id: string;
  user_id: string;
  title: string;
  message: string;
  recipients: { name: string; email: string }[];
  delivery_date: string;
  status: 'draft' | 'sealed' | 'delivered';
  created_at: string;
  updated_at: string;
}

export const SponsorDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAuthorizedSponsor, setIsAuthorizedSponsor] = useState(false);
  const [sponsoredCapsules, setSponsoredCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditingCapsule, setCurrentEditingCapsule] = useState<Capsule | null>(null);
  const [editDeliveryDate, setEditDeliveryDate] = useState('');
  const [editRecipients, setEditRecipients] = useState<{ name: string; email: string }[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/'); // Redirect to home if not logged in
        return;
      }
      checkSponsorAuthorization();
    }
  }, [user, authLoading, navigate]);

  const checkSponsorAuthorization = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('subscriber_id')
        .eq('sponsor_user_id', user?.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setIsAuthorizedSponsor(true);
        fetchSponsoredCapsules(data.map(s => s.subscriber_id));
      } else {
        setIsAuthorizedSponsor(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking sponsor authorization:', error);
      setIsAuthorizedSponsor(false);
      setLoading(false);
      triggerToast('Failed to verify sponsor status.', 'error');
    }
  };

  const fetchSponsoredCapsules = async (subscriberIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .in('user_id', subscriberIds)
        .order('delivery_date', { ascending: true });

      if (error) throw error;
      setSponsoredCapsules(data || []);
    } catch (error) {
      console.error('Error fetching sponsored capsules:', error);
      triggerToast('Failed to load sponsored capsules.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (capsule: Capsule) => {
    setCurrentEditingCapsule(capsule);
    setEditDeliveryDate(new Date(capsule.delivery_date).toISOString().split('T')[0]); // Format to YYYY-MM-DD
    setEditRecipients([...capsule.recipients]);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditingCapsule) return;

    setEditLoading(true);
    try {
      const { error } = await supabase
        .from('capsules')
        .update({
          delivery_date: editDeliveryDate,
          recipients: editRecipients,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentEditingCapsule.id);

      if (error) throw error;

      triggerToast('Capsule delivery details updated successfully!', 'success');
      setShowEditModal(false);
      // Re-fetch capsules to update the list
      checkSponsorAuthorization(); // This will re-fetch everything
    } catch (error) {
      console.error('Error updating capsule:', error);
      triggerToast('Failed to update capsule delivery details.', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddRecipient = () => {
    setEditRecipients([...editRecipients, { name: '', email: '' }]);
  };

  const handleRecipientChange = (index: number, field: 'name' | 'email', value: string) => {
    const newRecipients = [...editRecipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setEditRecipients(newRecipients);
  };

  const handleRemoveRecipient = (index: number) => {
    const newRecipients = editRecipients.filter((_, i) => i !== index);
    setEditRecipients(newRecipients);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#C0A172' }}></div>
      </div>
    );
  }

  if (!user || !isAuthorizedSponsor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Unauthorized Access
          </h1>
          <p className="text-gray-600 mb-8">
            You do not have permission to view this page. Only designated sponsors can access this dashboard.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Sponsor Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage delivery dates and recipients for sponsored time capsules. You can only modify delivery details - the content remains protected.
          </p>
        </motion.div>

        {sponsoredCapsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center py-16"
          >
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              No Sponsored Capsules
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You are not currently designated as a sponsor for any time capsules.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sponsoredCapsules.map((capsule, index) => (
              <motion.div
                key={capsule.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {capsule.title || 'Untitled Capsule'}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    capsule.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    capsule.status === 'sealed' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {capsule.status === 'draft' ? 'Draft' : capsule.status === 'sealed' ? 'Ready' : 'Delivered'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Delivery: {new Date(capsule.delivery_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-6">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {capsule.recipients?.length > 0
                      ? `${capsule.recipients.length} recipient${capsule.recipients.length > 1 ? 's' : ''}`
                      : 'No recipients'
                    }
                  </span>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => handleEditClick(capsule)}
                    className="w-full btn-primary py-2 text-sm inline-flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Delivery Details
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Created {new Date(capsule.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && currentEditingCapsule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowEditModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                Edit Delivery Details
              </h2>

              <form onSubmit={handleSaveEdit} className="space-y-6">
                {/* Read-only fields */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
                    Capsule Information (Read-Only)
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
                      <div className="text-gray-800 font-medium">
                        {currentEditingCapsule.title || 'Untitled Capsule'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Message Preview</label>
                      <div className="text-gray-700 text-sm bg-white p-3 rounded border max-h-20 overflow-y-auto">
                        {currentEditingCapsule.message ? 
                          currentEditingCapsule.message.substring(0, 150) + (currentEditingCapsule.message.length > 150 ? '...' : '') 
                          : 'No message'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Editable Delivery Details
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
                      style={{ focusRingColor: '#C0A172' }}
                      value={editDeliveryDate}
                      onChange={(e) => setEditDeliveryDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients
                    </label>
                    <div className="space-y-3">
                      {editRecipients.map((recipient, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
                            style={{ focusRingColor: '#C0A172' }}
                            placeholder="Recipient Name"
                            value={recipient.name}
                            onChange={(e) => handleRecipientChange(index, 'name', e.target.value)}
                            required
                          />
                          <input
                            type="email"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
                            style={{ focusRingColor: '#C0A172' }}
                            placeholder="Recipient Email"
                            value={recipient.email}
                            onChange={(e) => handleRecipientChange(index, 'email', e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipient(index)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddRecipient}
                        className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors inline-flex items-center justify-center"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Recipient
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastNotification
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
};