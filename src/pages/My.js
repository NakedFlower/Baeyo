import React from "react";
import { Card, Avatar, Button, Typography, Space } from "antd";
import { subscribeAuth, logout } from "../firebase";
import { UserOutlined, LoginOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function My() {
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    const unsub = subscribeAuth(setUser);
    return () => unsub && unsub();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} className="section-title">MY</Title>
      <Card className="glass-card">
        {user ? (
          <Space align="center">
            <Avatar src={user.photoURL} icon={<UserOutlined />} />
            <div>
              <div>{user.displayName || user.email}</div>
              <Text type="secondary">{user.email}</Text>
            </div>
            <Button onClick={logout} style={{ marginLeft: "auto" }}>로그아웃</Button>
          </Space>
        ) : (
          <Space align="center">
            <Avatar icon={<UserOutlined />} />
            <div>
              <div>로그인이 필요합니다</div>
              <Text type="secondary">맞춤 정보와 내 모집글을 확인하세요</Text>
            </div>
            <Link to="/login" style={{ marginLeft: "auto" }}>
              <Button type="primary" icon={<LoginOutlined />}>로그인</Button>
            </Link>
          </Space>
        )}
      </Card>
    </Space>
  );
}


