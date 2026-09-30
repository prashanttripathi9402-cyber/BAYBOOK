import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Truck, CheckCircle2, Star, Loader2, RefreshCw } from 'lucide-react';
import API from '../services/api';
import StatusTimeline from '../components/StatusTimeline';

export default function BookingTrackerPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/bookings/my-bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleReviewSubmit = async () => {
    if (!reviewBooking || !comment) return;
    setSubmittingReview(true);
    try {
      await API.post('/reviews', {
        bookingId: reviewBooking._id,
        rating,
        comment
      });
      alert('Thank you for rating your service experience!');
      setReviewBooking(null);
      setComment('');
      fetchMyBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Service Bookings & Live Tracking</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time BookMyShow status tracker for vehicle servicing</p>
        </div>
        <button
          onClick={fetchMyBookings}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          <span>Refresh Status</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span>Fetching your service bookings...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/60 rounded-2xl border border-slate-800 p-8 space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No active or past bookings</h3>
          <p className="text-xs text-slate-500">Book your first vehicle service slot from the local discovery tab.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/80 border border-blue-800 px-2.5 py-0.5 rounded">
                      {booking.bookingNumber}
                    </span>
                    <span className="text-xs text-slate-400">• {booking.vehicleDetails?.make} {booking.vehicleDetails?.model} ({booking.vehicleDetails?.regNumber})</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{booking.vendorId?.businessName || 'Garage Partner'}</h3>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Payable</div>
                  <div className="text-xl font-extrabold text-blue-400">₹{booking.totalAmount}</div>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">Live Progress Timeline</div>
                <StatusTimeline currentStatus={booking.status} />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/40 p-4 rounded-xl text-xs">
                <div>
                  <div className="text-slate-400">Date & Slot</div>
                  <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    {booking.bookingDate} ({booking.timeSlot?.startTime} - {booking.timeSlot?.endTime})
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">Delivery Mode</div>
                  <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                    {booking.deliveryMode === 'Doorstep Pickup & Drop' ? <Truck className="w-3.5 h-3.5 text-emerald-400" /> : <MapPin className="w-3.5 h-3.5 text-amber-400" />}
                    {booking.deliveryMode}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">Booked Packages</div>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    {booking.servicesBooked?.map(s => s.title).join(', ')}
                  </div>
                </div>
              </div>

              {/* Action Button: Post Review if completed */}
              {booking.status === 'Completed' && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setReviewBooking(booking)}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-600/20"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Rate & Review Garage</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Rate Your Service Experience</h3>
            <p className="text-xs text-slate-400">{reviewBooking.vendorId?.businessName}</p>

            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write your feedback about garage workmanship, timeliness, and staff behavior..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setReviewBooking(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={submittingReview}
                onClick={handleReviewSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-semibold"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
