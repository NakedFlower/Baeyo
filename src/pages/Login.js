import React, { useState } from "react";
import { Form, Input, Button, Typography, Space, Divider, message } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { login as loginWithGoogle, loginWithEmail } from "../firebase";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await loginWithEmail(values.email, values.password);
      message.success("로그인 완료");
    } catch (e) {
      message.error("이메일 또는 비밀번호가 올바르지 않습니다");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      message.success("구글 로그인 완료");
    } catch (e) {
      message.error("구글 로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} className="section-title">로그인</Title>
      <Form layout="vertical" onFinish={onFinish} className="glass-card">
        <Form.Item name="email" label="이메일" rules={[{ required: true, message: "이메일을 입력하세요" }, { type: 'email', message: '이메일 형식이 아닙니다' }]}>
          <Input placeholder="you@example.com" />
        </Form.Item>
        <Form.Item name="password" label="비밀번호" rules={[{ required: true, message: "비밀번호를 입력하세요" }]}>
          <Input.Password placeholder="비밀번호" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>로그인</Button>
            <Button type="link" href="/forgot">비밀번호 찾기</Button>
          </Space>
        </Form.Item>
        <Divider plain><Text type="secondary">또는</Text></Divider>
        <Button icon={<GoogleOutlined />} onClick={onGoogle} loading={loading}>
          구글로 계속하기
        </Button>
      </Form>
      <Text type="secondary">계정이 없으신가요? </Text>
      <Link to="/signup">회원가입하기</Link>
    </Space>
  );
}


