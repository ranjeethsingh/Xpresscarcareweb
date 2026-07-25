import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys are not configured in environment variables.");
      return NextResponse.json(
        { success: false, error: "Payment gateway is not configured." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { amount } = await request.json();

    const amountInPaise = Math.round(Number(amount) * 100);

    if (!amountInPaise || amountInPaise < 100) {
      return NextResponse.json(
        { success: false, error: "Minimum order amount is ₹1 (100 paise)" },
        { status: 400 }
      );
    }

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Math.floor(100000 + Math.random() * 900000)}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}