import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { constants } from "../../utils/constants";

interface ReceiptData {
  sessionUuid: string;
  startTime: string;
  endTime: string;
  duration: number;
  unit: string;
  freeMins?: number;
  personCount: number;
  table: {
    name: string;
    category: {
      name: string;
    };
  };
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  payment: {
    amount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    method: string;
    status: string;
    createdAt: string;
  };
}

const Receipt = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await fetch(
          `${constants.BASE_URL}${constants.API_URL}/public-receipt/${uuid}`,
        );
        const data = await response.json();

        if (data.success) {
          setReceipt(data.data);
        } else {
          setError(data.message || "Failed to load receipt.");
        }
      } catch (err: any) {
        setError("Something went wrong. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [uuid]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f4f6f8",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !receipt) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f4f6f8",
          p: 3,
        }}
      >
        <Typography color="error" variant="h6">
          {error || "Receipt not found."}
        </Typography>
      </Box>
    );
  }

  const { table, payment } = receipt;
  const isHours = receipt.unit === "hours";
  const durationString = `${receipt.duration} ${isHours ? "hour" : "mins"}${receipt.freeMins ? ` + ${receipt.freeMins}mins free` : ""}`;
  const rate =
    receipt.duration > 0
      ? (payment.amount / receipt.duration).toFixed(2)
      : "0.00";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        py: 4,
        px: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: "100%",
          borderRadius: 4,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        <Box
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Payment Receipt
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.8, mt: 0.5 }}>
            Ludo Royal Club
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Billing Summary
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Customer: {receipt.customer.firstName} {receipt.customer.lastName}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Table: {table.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Category: {table.category.name}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Duration: {durationString}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rate: {rate} PKR
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Subtotal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Number(payment.amount).toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Tax ({payment.taxRate}%)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Number(payment.taxAmount).toFixed(2)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pt: 2,
              pb: 2,
              mt: 1,
              borderTop: "1px solid",
              borderColor: "grey.300",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              Total Amount
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              {Number(payment.totalAmount).toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.75rem", mb: 0.5 }}
            >
              Payment method
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {payment.method}
            </Typography>
          </Box>
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Date: {new Date(payment.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Receipt;
