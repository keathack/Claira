import { Calendar, Clock, Video, MapPin, Plus } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";

const DOCTOR_IMG = "https://images.unsplash.com/photo-1758691463626-0ab959babe00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZG9jdG9yJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzc0Nzc1NzgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const appointments = [
  { id: 1, doctor: "Dr. Sarah Chen", specialty: "Cardiology", date: "Mar 31", time: "10:00 AM", type: "in-person", status: "confirmed" },
  { id: 2, doctor: "Dr. James Park", specialty: "General", date: "Apr 4", time: "2:30 PM", type: "virtual", status: "confirmed" },
  { id: 3, doctor: "Dr. Emily Rodriguez", specialty: "Endocrinology", date: "Apr 12", time: "11:00 AM", type: "in-person", status: "pending" },
  { id: 4, doctor: "Dr. Michael Lee", specialty: "Dermatology", date: "Apr 20", time: "9:00 AM", type: "virtual", status: "confirmed" },
];

const tabs = ["Upcoming", "Past"];

export function Appointments() {
  const [activeTab, setActiveTab] = useState("Upcoming");

  return (
    <div className="px-5 pt-14 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[#1e2533]" style={{ fontSize: 22, fontWeight: 600 }}>Appointments</h1>
        <button className="w-10 h-10 rounded-xl bg-[#577399] flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex gap-1 bg-[#eaedf4] rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg transition-all ${activeTab === tab ? "bg-white text-[#1e2533] shadow-sm" : "text-[#a9b9d0]"}`}
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {appointments.map((apt) => (
          <div key={apt.id} className="bg-white rounded-2xl p-4 border border-[#d1d9e6]">
            <div className="flex items-center gap-3 mb-3">
              <ImageWithFallback src={DOCTOR_IMG} alt={apt.doctor} className="w-11 h-11 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 500 }}>{apt.doctor}</p>
                <p className="text-[#a9b9d0]" style={{ fontSize: 13 }}>{apt.specialty}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg ${apt.status === "confirmed" ? "bg-[#577399]/12 text-[#577399]" : "bg-[#a9b9d0]/16 text-[#7a94b6]"}`} style={{ fontSize: 11, fontWeight: 500 }}>
                {apt.status === "confirmed" ? "Confirmed" : "Pending"}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[#7a94b6]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span style={{ fontSize: 12 }}>{apt.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span style={{ fontSize: 12 }}>{apt.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {apt.type === "virtual" ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                <span style={{ fontSize: 12 }}>{apt.type === "virtual" ? "Virtual" : "In-person"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
