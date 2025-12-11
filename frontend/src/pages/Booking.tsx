import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Booking() {
  const { id } = useParams();
  const [slot, setSlot] = useState<any>(null);
  const [name, setName] = useState('');
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${API}/doctors`).then(res => {
      const allSlots = res.data.flatMap((d: any) => d.slots);
      const found = allSlots.find((s: any) => s.id == id);
      setSlot(found);
    });
  }, [id]);

  const book = async () => {
    try {
      await axios.post(`${API}/bookings`, {
        slotId: id,
        patientName: name,
        seats
      });
      setMessage('Booking CONFIRMED! Your appointment is booked.');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Booking failed. Try again.');
    }
  };

  if (!slot) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <h1 className="text-2xl font-bold mb-4">Book Appointment</h1>
      <p className="mb-4">
        Time: {new Date(slot.start_time).toLocaleString()}
      </p>
      <p className="mb-6">Seats available: {slot.available_seats}</p>

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="number"
        min="1"
        max={slot.available_seats}
        value={seats}
        onChange={e => setSeats(Number(e.target.value))}
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={book}
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
      >
        Confirm Booking
      </button>

      {message && <p className="mt-4 text-center font-medium">{message}</p>}
    </div>
  );
}