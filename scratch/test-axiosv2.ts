import axios from 'axios';
import https from 'https';

const TOKEN = process.env.DIRECT_DATA_TOKEN || "09223E37-417E-4D50-B74F-A928A421E407";

async function test() {
  console.log("Testing with axiosV2 configuration...");
  try {
    const axiosV2 = axios.create({
      baseURL: 'https://api.directd.com.br',
      headers: { 
        'Content-Type': 'application/json',
        'Token': TOKEN 
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    const payload = {
      fullName: "Sergio Torres Pita",
      motherName: "",
      postalCode: "",
      street: "",
      city: "",
      state: "",
      number: "",
      neighborhood: "",
      email: "",
      phoneNumber: "",
      dateOfBirthStart: "",
      dateOfBirthEnd: "",
      receiveAuxilioEmergencial: null,
      receiveAuxilioReconstrucao: null,
      receiveBolsaFamilia: null,
      receiveBPC: null,
      receiveGarantiaSafra: null,
      receiveSeguroDefeso: null
    };

    const response = await axiosV2.post('https://api.app.directd.com.br/api/AdvancedSearch/FilterNaturalPerson', payload);
    console.log("SUCCESS!", response.status);
    console.log(response.data);
  } catch (err: any) {
    console.error("ERROR:");
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message, err.code);
    }
  }
}

test();
