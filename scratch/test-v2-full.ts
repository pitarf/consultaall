import axios from 'axios';
import https from 'https';

const TOKEN = process.env.DIRECT_DATA_TOKEN || "09223E37-417E-4D50-B74F-A928A421E407";

async function testFullFlow() {
  console.log("Iniciando fluxo completo de Pesquisa V2...");
  
  try {
    const payloadFilter = {
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

    console.log("1. FilterNaturalPerson...");
    const resFilter = await fetch('https://api.app.directd.com.br/api/AdvancedSearch/FilterNaturalPerson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'accept': 'application/json', 'Token': TOKEN, 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify(payloadFilter)
    });
    const filterData = await resFilter.json();
    console.log(filterData);

    const id = filterData.listFilters[0].id;
    console.log("2. ProcessingIds para", id);
    const resProc = await fetch('https://api.app.directd.com.br/api/AdvancedSearch/ProcessingIds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'accept': 'application/json', 'Token': TOKEN, 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify({ listIds: [id], searchName: 'Teste API V2' })
    });
    const procData = await resProc.json();
    const searchUid = procData.searchUid;
    console.log(procData);

    console.log("3. Polling ViewSearch...");
    while (true) {
      await new Promise(r => setTimeout(r, 2000));
      const resView = await fetch('https://api.app.directd.com.br/api/AdvancedSearch/ViewSearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': 'application/json', 'Token': TOKEN, 'User-Agent': 'Mozilla/5.0' },
        body: JSON.stringify({ searchUid })
      });
      const viewData = await resView.json();
      const item = viewData.viewSearch?.searchItems?.[0];
      if (item && [4, 5, 6, 7].includes(item.resultId)) {
        console.log("FINAL RESULT:", JSON.stringify(item.returnJson, null, 2));
        break;
      } else {
        console.log("Aguardando... resultId =", item?.resultId);
      }
    }

  } catch (err: any) {
    console.error("ERROR:");
    console.error(err);
  }
}

testFullFlow();
