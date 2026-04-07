const BASE = "https://YOUR-BACKEND.onrender.com";

export const login = async (username, password) => {
  const form = new FormData();
  form.append("username", username);
  form.append("password", password);

  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    body: form,
  });

  return res.json();
};

export const register = async (username, password) => {
  const form = new FormData();
  form.append("username", username);
  form.append("password", password);

  const res = await fetch(`${BASE}/register`, {
    method: "POST",
    body: form,
  });

  return res.json();
};

export const predict = async (file, user) => {
  const form = new FormData();
  form.append("file", file);
  form.append("user", user);

  const res = await fetch(`${BASE}/predict`, {
    method: "POST",
    body: form,
  });

  return res.json();
};
