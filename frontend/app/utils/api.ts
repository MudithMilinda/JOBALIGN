export const createCheckout = async (userId: string, plan: string) => {
  const res = await fetch("http://localhost:5000/api/stripe/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, plan }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Checkout failed");
  }

  return data;
};