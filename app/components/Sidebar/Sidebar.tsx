import Link from "next/link";

export const Sidebar = () => {
  return (
    <aside
      style={{
        width: "64px",
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
      }}
    >
      {/* 上：Logo / Menu */}
      <div>
        <div style={{ color: "white", marginBottom: "24px" }}>≡</div>
      </div>

      {/* 下：Social Links */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Link href="#" style={{ color: "white" }}>
          in
        </Link>
        <Link href="#" style={{ color: "white" }}>
          gh
        </Link>
        <Link href="#" style={{ color: "white" }}>
          tw
        </Link>
      </div>
    </aside>
  );
};
