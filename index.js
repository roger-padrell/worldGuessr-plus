async function solve(){
  let i = document.getElementsByClassName("svframe")[0].src;
  let par = new URLSearchParams(i);
  let latitude = par.get("lat");
  let longitude = par.get("long");
  let name = await getCountryName(latitude, longitude);
  alert(name)
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
