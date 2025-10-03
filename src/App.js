import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, theme, ConfigProvider, Skeleton, Avatar } from "antd";
import { HomeOutlined, ShoppingOutlined, MessageOutlined, UserOutlined, LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";
import { subscribeAuth, logout } from "./firebase";

const { Header, Content, Footer } = Layout;

function AppShell() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsub = subscribeAuth((u) => {
      setCurrentUser(u);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, []);

  const items = [
    { key: "/", icon: <HomeOutlined />, label: <Link to="/">홈</Link> },
    { key: "/groupbuy", icon: <ShoppingOutlined />, label: <Link to="/groupbuy">공동구매</Link> },
    { key: "/chat", icon: <MessageOutlined />, label: <Link to="/chat">채팅</Link> },
    { key: "/my", icon: <UserOutlined />, label: <Link to="/my">MY</Link> }
  ];

  return (
    <Layout className="app-layout">
      <Header className="app-header" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div className="app-logo">
          <img src="/baeyo.png" alt="BaeYo" height="26" />
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={items}
          style={{ flex: 1, background: "transparent" }}
        />
        {loading ? (
          <Skeleton.Avatar active size="small" />
        ) : currentUser ? (
          <Avatar src={currentUser.photoURL} icon={<UserOutlined />} />
        ) : (
          <Link to="/login">
            <Button icon={<LoginOutlined />}>로그인</Button>
          </Link>
        )}
      </Header>
      <Content className="app-content">
        <div className="glass-card" style={{ padding: 24 }}>
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: "center", color: "#94a3b8", background: "transparent" }}>
        © {new Date().getFullYear()} 공동구매 플랫폼
      </Footer>
    </Layout>
  );
}

export default function App() {
  const antdTheme = {
    token: {
      colorPrimary: "#fb923c", /* orange-400 */
      colorBgBase: "#fff7ed",
      colorTextBase: "#1f2937",
      borderRadius: 10
    },
    algorithm: theme.defaultAlgorithm
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <AppShell />
    </ConfigProvider>
  );
}
