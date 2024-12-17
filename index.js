async function solve(){
  let i = document.getElementsByClassName("svframe")[0].src;
  let par = new URLSearchParams(i);
  let latitude = par.get("lat");
  let longitude = par.get("long");
  let details = await getLocationDetails(latitude, longitude);
  alert(details.country + ", " + details.region)
}


async function getLocationDetails(lat, lon) {
    try {
        // Step 1: Get the country name using Nominatim
        const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
        const response = await fetch(geocodeUrl, {
            headers: { 'User-Agent': 'LocationLookup/1.0' } // Required header for Nominatim API
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const geocodeData = await response.json();
        const country = geocodeData?.address?.country;

        if (!country) {
            return { country: "Unknown country", continent: "Unknown continent", region: "Unknown region" };
        }

        // Step 2: Get M49 classification data
        const m49Url = "https://unstats.un.org/unsd/methodology/m49/m49.json";
        const m49Response = await fetch(m49Url);

        if (!m49Response.ok) {
            throw new Error(`M49 API error! Status: ${m49Response.status}`);
        }

        const m49Data = await m49Response.json();

        // Step 3: Match country to M49 regions
        const countryEntry = Object.values(m49Data.countries).find(
            (entry) => entry.name.toLowerCase() === country.toLowerCase()
        );

        if (!countryEntry) {
            return {
                country,
                continent: "Unknown continent",
                region: "Unknown region"
            };
        }

        const continent = countryEntry.region_name || "Unknown continent";
        const region = countryEntry.subregion_name || "Unknown region";

        return { country, continent, region };
    } catch (error) {
        console.error("Error fetching location details:", error.message);
        return { country: null, continent: null, region: null };
    }
}
