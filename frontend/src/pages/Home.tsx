import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Home() {
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${API}/doctors`).then(res => setDoctors(res.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book Doctor Appointment</h1>
      <Link to="/admin" className="text-blue-600 mb-4 block">Admin Panel →</Link>

      {doctors.map(doctor => (
        <div key={doctor.id} className="bg-white p-6 mb-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold">{doctor.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {doctor.slots.map((slot: any) => (
              <Link
                key={slot.id}
                to={`/booking/${slot.id}`}
                className="border p-4 rounded hover:bg-blue-50"
              >
                <p className="font-medium">
                  {new Date(slot.start_time).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Seats left: {slot.available_seats}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}