export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const toJson = async (response) => {
  const data = await response.json();
  return data;
};

export const loginUser = async (email, password) => {
  const response = await fetch(
    `${API_BASE_URL}/userLogin?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
  );
  return toJson(response);
};

export const registerUser = async (email, password, username) => {
  const response = await fetch(`${API_BASE_URL}/saveUserDetails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      username,
    }),
  });
  return toJson(response);
};

export const getTextFromImage = async (email, file) => {
  const formData = new FormData();
  formData.append("uploadedImage", file, file.name);
  formData.append("email", email);

  const response = await fetch(`${API_BASE_URL}/getTextFromFile`, {
    method: "POST",
    body: formData,
  });

  return toJson(response);
};

export const getPreviousData = async (email) => {
  const response = await fetch(
    `${API_BASE_URL}/getHistoryData?email=${encodeURIComponent(email)}`,
  );
  return toJson(response);
};
