import React, { useState } from 'react'

export default function AirtableLogin() {
    const [redirecting, setRedirecting] = useState(false);
  const handleLogin = () => {
    window.location.href = "https://airtable-dynamic-form-builder-backend.onrender.com/api/v1/auth/airtable/login";
    // try {
    //     const url = `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/airtable/login`;
    //     const response = fetch
    // } catch (error) {
    //     console.log("Error in redirecting to login with artable: ", error);
    // }
  };

  return (
    <div className='h-screen flex flex-col gap-4 justify-center items-center'>
      <h1 className='text-3xl font-bold'>Dynamic Form Builder</h1>
      <p className='text-xl font-semibold'>Connect your Airtable account to build forms.</p>
      <button onClick={handleLogin} style={{ padding: "10px 16px" }} className='bg-blue-500 cursor-pointer rounded-sm font-semibold text-white hover:bg-blue-400'>
        Login with Airtable
      </button>
    </div>
  );
}
