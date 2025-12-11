import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Admin() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorName, setDoctorName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [totalSeats, setTotalSeats] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState('');

  useEffect(() => {
    axios.get(`${API}/doctors`).then(res => setDoctors(res.data));
  }, []);

  const createDoctor = async () => {
  try {
    await axios.post(`${API}/doctors`, { name: doctorName });
    alert('Doctor created successfully!');
    setDoctorName('');
    // Optional: refresh the list automatically
    const res = await axios.get(`${API}/doctors`);
    setDoctors(res.data);
  } catch (err) {
    alert('Error creating doctor');
  }
};

  const createSlot = async () => {
  try {
    await axios.post(`${API}/slots`, {
      doctorId: selectedDoctor,
      startTime,
      totalSeats
    });
    alert('Slot created successfully!');
    setStartTime('');
    setTotalSeats(1);
    // Optional: refresh the list
    const res = await axios.get(`${API}/doctors`);
    setDoctors(res.data);
  } catch (err) {
    alert('Error creating slot');
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl mb-4">Create Doctor</h2>
        <input
          type="text"
          placeholder="Doctor name"
          value={doctorName}
          onChange={e => setDoctorName(e.target.value)}
          className="p-2 border rounded w-full mb-4"
        />
        <button onClick={createDoctor} className="bg-green-600 text-white p-2 rounded">
          Create Doctor
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl mb-4">Create Slot</h2>
        <select
          value={selectedDoctor}
          onChange={e => setSelectedDoctor(e.target.value)}
          className="p-2 border rounded w-full mb-4"
        >
          <option value="">Select Doctor</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          className="p-2 border rounded w-full mb-4"
        />

        <input
          type="number"
          min="1"
          value={totalSeats}
          onChange={e => setTotalSeats(Number(e.target.value))}
          className="p-2 border rounded w-full mb-4"
          placeholder="Total seats"
        />

        <button onClick={createSlot} className="bg-green-600 text-white p-2 rounded">
          Create Slot
        </button>
      </div>
    </div>
  );
}