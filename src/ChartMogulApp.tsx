import { DefaultStyle, useSetAppHeight, Text, useHelpScoutContext, Link, Spinner, Icon } from "@helpscout/ui-kit";
import { useEffect, useState, useMemo } from "react";
import { API_BASE } from "./config";

interface Subscription {
  uuid: string;
  status: string;
  plan: string;
  mrr: number;
}

interface CustomerData {
  display_name: string;
  chartmogul_url: string;
  status: string;
  status_color: string;
  mrr: number;
  arr: number;
  customer_since: string;
  uuid: string;
  country: string;
  subs: Subscription[];
}

const STATUS_COLORS: Record<string, string> = {
  Active: "#66bb6a",
  "Past Due": "#e57373",
  Cancelled: "#e57373",
};

const formatDate = (input: string): string => {
  const date = new Date(input);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const statusColor = (status: string): string => STATUS_COLORS[status] || "#999";

const sortSubscriptions = (subs: Subscription[]) =>
  [...subs].sort((a, b) => {
    const priority = (status: string) => (status === "active" ? 0 : 1);
    const diff = priority(a.status) - priority(b.status);
    return diff !== 0 ? diff : b.mrr - a.mrr;
  });

const extractCustomerData = (data: any): CustomerData => ({
  display_name: data.company || data.name || data.email || "Untitled customer",
  chartmogul_url: data["chartmogul-url"],
  status: data.status,
  status_color: statusColor(data.status),
  mrr: data.mrr / 100,
  arr: (data.mrr / 100) * 12,
  customer_since: formatDate(data["customer-since"]),
  uuid: data.uuid,
  country: data.address?.country ?? "N/A",
  subs: [],
});

async function getCustomerUUID(uuid: string) {
  try {
    const response = await fetch(`${API_BASE}/api/chartmogul/customer?uuid=${uuid}`);
    const data = await response.json();
    return data ?? null;
  } catch (err) {
    console.error("Error fetching customer:", err);
    return null;
  }
}

async function getSubscriptions(uuid: string) {
  try {
    const response = await fetch(`${API_BASE}/api/chartmogul/subscriptions?uuid=${uuid}`);
    const data = await response.json();
    return data.entries ?? [];
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    return [];
  }
}

async function searchContacts(email: string) {
  try {
    const response = await fetch(`${API_BASE}/api/chartmogul/contacts?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    return data?.entries[0] ?? null;
  } catch (err) {
    console.error("Error fetching customer via contact email:", err);
    return null;
  }
}

function ChartMogulApp() {
  const appRef = useSetAppHeight();
  const { customer } = useHelpScoutContext();
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [requesterData, setRequesterData] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const sortedSubs = useMemo(
    () => requesterData ? sortSubscriptions(requesterData.subs) : [],
    [requesterData]
  );

  useEffect(() => {
    const fetchData = async () => {
      const email = customer?.emails?.[0]?.value;
      if (!email) return;
      setCustomerEmail(email);

      let chartmogulCustomer = null;

      const chartmogulContact = await searchContacts(email);
      if (chartmogulContact) {
        chartmogulCustomer = await getCustomerUUID(chartmogulContact.customer_uuid);
      }

      if (!chartmogulCustomer) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const data = extractCustomerData(chartmogulCustomer);
      const subs = await getSubscriptions(data.uuid);
      setRequesterData({ ...data, subs });
      setIsLoading(false);
    };

    fetchData();
  }, [customer]);

  if (notFound) {
    return (
      <div ref={appRef}>
        <DefaultStyle />
        <Text>Customer with email {customerEmail} is not found in ChartMogul.</Text>
      </div>
    );
  }

  if (isLoading || !requesterData) {
    return (
      <div ref={appRef}>
        <DefaultStyle />
        <Text>Loading customer data...</Text>
        <Spinner />
      </div>
    );
  }

  const isPaidStatus = ["Active", "Past Due", "Cancelled"].includes(requesterData.status);

  return (
    <div ref={appRef}>
      <DefaultStyle />

      <Link href={requesterData.chartmogul_url} target="_blank" rel="noopener noreferrer" color="#1A237E">
        <Text style={{ fontSize: 16, fontWeight: 700, color: "#304ddb" }}>{requesterData.display_name}</Text>
      </Link>

      <Text style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
        <span style={{ color: requesterData.status_color }}>{requesterData.status}</span> • {requesterData.country}
      </Text>

      {isPaidStatus && (
        <Text style={{ fontSize: 11, color: "#666" }}>
          Customer since {requesterData.customer_since}
        </Text>
      )}

      <section style={{
        width: 231, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0"
      }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: "#756963" }}>${Math.round(requesterData.mrr).toLocaleString()}</div>
          <div style={{ fontSize: 11, color: "#666" }}>MRR</div>
        </div>

        <div style={{
          height: 32, width: 1,
          background: "repeating-linear-gradient(to bottom, #ccc, #ccc 1px, transparent 1px, transparent 3px)"
        }}></div>

        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: "#756963" }}>${Math.round(requesterData.arr).toLocaleString()}</div>
          <div style={{ fontSize: 11, color: "#666" }}>ARR</div>
        </div>
      </section>

      {isPaidStatus && (
        <>
          <Text style={{ fontSize: 12, fontWeight: 500, color: "#666", paddingBottom: 3 }}>
            Subscriptions
          </Text>

          {requesterData.subs.length > 0 ? (
            <div style={{ fontSize: 12 }}>
              {sortedSubs.map((sub: Subscription, index: number) => {
                const isLast = index === requesterData.subs.length - 1;
                return (
                  <div key={sub.uuid} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", padding: "6px 0",
                    borderBottom: isLast ? "none" : "1px solid #eee"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="period" state={sub.status === "active" ? "success" : "error"} style={{ minWidth: "20px" }} />
                      <Text style={{ fontSize: 11, color: "#666", maxWidth: "140px" }}>{sub.plan}</Text>
                    </div>
                    <Text style={{ fontSize: 11, color: "#666", whiteSpace: "nowrap", paddingRight: "6px" }}>
                      {Math.round(sub.mrr / 100).toLocaleString()} MRR
                    </Text>
                  </div>
                );
              })}
            </div>
          ) : (
            <Text style={{ fontSize: 12, color: "#999" }}>No subscriptions found.</Text>
          )}
        </>
      )}
    </div>
  );
}

export default ChartMogulApp;
