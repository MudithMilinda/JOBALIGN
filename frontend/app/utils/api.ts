export const createCheckout = async (userId: string, plan: string) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  
  const res = await fetch(`${backendUrl}/api/stripe/create-checkout-session`, {
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