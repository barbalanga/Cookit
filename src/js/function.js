import { TIMEOUT } from "./config";


const timeout = function (s) {
    return new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error(`Request took too long! Timeout after ${s} second`));
      }, s * 1000);
    });
  };


export const getJSON = async function (url) {
    try {
    const res = await Promise.race([fetch(url),timeout(TIMEOUT)]);
    const data = await res.json();
   
    if(!res.ok)
    throw new Error (`${data.message}`);
    return data;
    }
    catch(error){
      console.error('Error fetching data:', error);
        throw error;
    }
}



// export const sendJSON = async function (url, uploadData) {
//   try {
//   const res = await Promise.race([fetch(url, {
//     method: 'POST',
//     headers:{
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(uploadData)
//   }),timeout(TIMEOUT)]);
//   const data = await res.json();
 
//   if(!res.ok)
//   throw new Error (`${data.message}`);
//   return data;
//   }
//   catch(error){
//       throw error;
//   }
// }


export const sendJSON = async function(url, options = {}) {
  try {
      console.log(`Sending ${options.method || 'GET'} request to ${url}`);
      if (options.body) {
          console.log('Request body:', options.body);
      }

      const fetchOptions = {
          method: options.method || 'GET',
          headers: {
              'Content-Type': 'application/json',
              ...options.headers,
          },
      };

      // Only include body if it's not a GET request
      if (options.body && options.method !== 'GET') {
          fetchOptions.body = JSON.stringify(options.body);
      }

      const res = await fetch(url, fetchOptions);
      console.log('Response status:', res.status);

      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) throw new Error(`${data.error || 'Request failed'} (${res.status})`);

      return data;
  } catch (err) {
      console.error('Error in sendJSON:', err);
      throw err;
  }
};
