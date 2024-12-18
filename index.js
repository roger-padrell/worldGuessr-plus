async function solve(){
  let i = document.getElementsByClassName("svframe")[0].src;
  let par = new URLSearchParams(i);
  let latitude = par.get("lat");
  let longitude = par.get("long");
  let details = await getLocationDetails(latitude, longitude);
  console.log(details)
  alert(details.country + ", " + details.region)
  let image = getMapImageUrl(latitude, longitude)
  let el = document.createElement("img")
  el.src = image;
  document.body.append(el)
}

function getMapImageUrl(latitude, longitude, zoom = 10, width = 600, height = 400) {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error('Invalid latitude or longitude');
    }

    // OpenStreetMap static tile server
    const tileBaseUrl = 'https://www.openstreetmap.org/export/embed.html';

    // Generate the bbox based on latitude, longitude, and zoom
    const bbox = `${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}`;

    // Construct and return the full URL
    return `${tileBaseUrl}?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
}


async function getCountryName(lat, lon) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'CountryLookup/1.0' } // Required by Nominatim API
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Check if the country is present in the response
        if (data?.address?.country) {
            return data.address.country;
        } else {
            return "Country not found";
        }
    } catch (error) {
        console.error("Error fetching country name:", error.message);
        return null;
    }
}


async function getLocationDetails(lat, lon) {
    try {
        // Step 1: Get the country name using Nominatim
        const country = await getCountryName(lat, lon);
        country = country.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

        if (!country) {
            return { country: "Unknown country", continent: "Unknown continent", region: "Unknown region" };
        }

        // Step 2: Get M49 classification data
        const m49Url = "https://omnika.org/component/firedrive/?view=document&id=13&format=raw";
        const m49Response = await fetch(m49Url);

        if (!m49Response.ok) {
            throw new Error(`M49 API error! Status: ${m49Response.status}`);
        }

        const m49Data = await m49Response.json();

        // Step 3: Match country to M49 regions
        let countryEntry;
        for(let c in m49Data){
          if(m49Data[c]["Country or Area"].toLowerCase() === country.toLowerCase()){
            countryEntry = m49Data[c];
          }
        }

        if (!countryEntry) {
            return {
                country,
                continent: "Unknown continent",
                region: "Unknown region"
            };
        }

        const continent = countryEntry.region_name || "Unknown continent";
        const region = countryEntry["Sub-region Name"] || "Unknown region";

        return { country, continent, region };
    } catch (error) {
        console.error("Error fetching location details:", error.message);
        return { country: null, continent: null, region: null };
    }
}
