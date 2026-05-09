import axios from "axios";

export const searchLocation = async (
  query: string
) => {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: query + ", India",
        format: "json",
        addressdetails: 1,
        limit: 10,
      },
      headers: {
        "User-Agent": "FoodCompanionApp",
      },
    }
  );

  return response.data;
};

export const reverseGeocode = async (
  lat: number,
  lon: number
) => {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/reverse",
    {
      params: {
        lat,
        lon,
        format: "json",
      },
      headers: {
        "User-Agent": "FoodCompanionApp",
      },
    }
  );

  return response.data;
};