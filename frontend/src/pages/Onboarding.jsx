import React from 'react';

function Onboarding() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Welcome to CardioTwin</h2>
      <p className="text-slate-600">Please fill out your health profile to create your baseline digital twin.</p>
      {/* Form would go here */}
      <button className="mt-6 bg-primary text-white px-6 py-2 rounded-lg">Complete Profile</button>
    </div>
  );
}

export default Onboarding;
